/**
 * Download all equipment item icons from Albion Online Render API
 * to public/icons/items/ for local serving.
 *
 * Usage: npx tsx scripts/sync-icons.ts
 *
 * Downloads icons at 64px size for equipment items (weapons, armor, offhands, capes, bags).
 * Includes enchanted variants (@1, @2, @3, @4).
 * Skips already-downloaded icons for incremental updates.
 */

import fs from 'fs'
import path from 'path'

const RENDER_BASE = 'https://render.albiononline.com/v1/item'
const OUTPUT_DIR = path.join(process.cwd(), 'public', 'icons', 'items')
const ICON_SIZE = 64
const CONCURRENCY = 10 // parallel downloads
const DELAY_MS = 50 // delay between batches to avoid rate limiting

// Equipment categories that matter for flipper/trade routes
const EQUIPMENT_PREFIXES = [
  '_MAIN_', '_2H_', '_OFF_', '_HEAD_', '_ARMOR_', '_SHOES_',
  '_CAPE', '_BAG', '_POTION_', '_MEAL_',
]

async function main() {
  console.log('=== Albion Online Icon Sync ===\n')

  // Step 1: Load processed items
  const itemsPath = path.join(process.cwd(), 'public', 'game-data', 'items.json')
  if (!fs.existsSync(itemsPath)) {
    console.error('Error: public/game-data/items.json not found. Run "npm run sync-game-data" first.')
    process.exit(1)
  }

  const items: Array<{ id: string; tier: number; category: string }> = JSON.parse(
    fs.readFileSync(itemsPath, 'utf-8')
  )

  // Step 2: Filter to equipment items worth downloading
  const equipmentItems = items.filter((item) => {
    // Only T3+ items
    if (item.tier < 3) return false
    // Check if it's an equipment item by ID pattern
    const upper = item.id.toUpperCase()
    return EQUIPMENT_PREFIXES.some((prefix) => upper.includes(prefix))
  })

  console.log(`Total items: ${items.length}`)
  console.log(`Equipment items to download: ${equipmentItems.length}`)

  // Step 3: Create output directory
  fs.mkdirSync(OUTPUT_DIR, { recursive: true })

  // Step 4: Download icons
  let downloaded = 0
  let skipped = 0
  let failed = 0

  const itemIds = equipmentItems.map((item) => item.id)

  for (let i = 0; i < itemIds.length; i += CONCURRENCY) {
    const batch = itemIds.slice(i, i + CONCURRENCY)

    await Promise.all(
      batch.map(async (itemId) => {
        // Filename: replace @ with _ for filesystem safety
        const filename = `${itemId.replace(/@/g, '_at_')}.png`
        const filepath = path.join(OUTPUT_DIR, filename)

        // Skip if already exists
        if (fs.existsSync(filepath)) {
          skipped++
          return
        }

        try {
          // Parse enchantment from ID
          const [baseId, enchant] = itemId.split('@')
          const enchantSuffix = enchant ? `@${enchant}` : ''
          const url = `${RENDER_BASE}/${baseId}${enchantSuffix}.png?size=${ICON_SIZE}`

          const response = await fetch(url)
          if (!response.ok) {
            failed++
            return
          }

          const buffer = Buffer.from(await response.arrayBuffer())
          fs.writeFileSync(filepath, buffer)
          downloaded++
        } catch {
          failed++
        }
      })
    )

    // Progress
    const total = itemIds.length
    const done = i + batch.length
    const pct = Math.round((done / total) * 100)
    process.stdout.write(`\r  Progress: ${done}/${total} (${pct}%) | Downloaded: ${downloaded} | Skipped: ${skipped} | Failed: ${failed}`)

    // Rate limit
    if (i + CONCURRENCY < itemIds.length) {
      await new Promise((r) => setTimeout(r, DELAY_MS))
    }
  }

  console.log('\n')
  console.log(`=== Done! ===`)
  console.log(`  Downloaded: ${downloaded}`)
  console.log(`  Skipped (already exists): ${skipped}`)
  console.log(`  Failed: ${failed}`)
  console.log(`  Output: ${OUTPUT_DIR}`)

  // Calculate approximate size
  const files = fs.readdirSync(OUTPUT_DIR)
  const totalSize = files.reduce((sum, f) => {
    return sum + fs.statSync(path.join(OUTPUT_DIR, f)).size
  }, 0)
  console.log(`  Total size: ${(totalSize / 1024 / 1024).toFixed(1)} MB (${files.length} files)`)
}

main().catch(console.error)
