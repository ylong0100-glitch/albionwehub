#!/usr/bin/env npx tsx
// =============================================================================
// Albion Online Game Data Sync Script
// Downloads raw game data from ao-bin-dumps and transforms into optimized format
// Usage: npx tsx scripts/sync-game-data.ts
// =============================================================================

import { writeFileSync, mkdirSync, existsSync } from 'fs'
import { join } from 'path'

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------
const FORMATTED_ITEMS_URL =
  'https://raw.githubusercontent.com/ao-data/ao-bin-dumps/master/formatted/items.json'
const ROOT_ITEMS_URL =
  'https://raw.githubusercontent.com/ao-data/ao-bin-dumps/master/items.json'

const OUTPUT_DIR = join(process.cwd(), 'public', 'game-data')

// ---------------------------------------------------------------------------
// Types — raw data from ao-bin-dumps
// ---------------------------------------------------------------------------
interface RawFormattedItem {
  UniqueName: string
  LocalizedNames: Record<string, string> | null
  LocalizedDescriptions: Record<string, string> | null
  Index: string
}

interface RawCraftResource {
  '@uniquename': string
  '@count': string
  '@maxreturnamount'?: string
}

interface RawCraftingRequirements {
  '@silver'?: string
  '@time'?: string
  '@craftingfocus'?: string
  '@amountcrafted'?: string
  craftresource?: RawCraftResource | RawCraftResource[]
}

interface RawEnchantment {
  '@enchantmentlevel': string
  craftingrequirements?: RawCraftingRequirements | RawCraftingRequirements[]
}

interface RawItem {
  '@uniquename': string
  '@tier'?: string
  '@shopcategory'?: string
  '@shopsubcategory1'?: string
  '@weight'?: string
  '@craftingfocus'?: string
  craftingrequirements?: RawCraftingRequirements | RawCraftingRequirements[]
  enchantments?: {
    enchantment?: RawEnchantment | RawEnchantment[]
  }
}

// ---------------------------------------------------------------------------
// Types — processed output
// ---------------------------------------------------------------------------
interface ProcessedItem {
  id: string
  name: string
  nameZH?: string
  tier: number
  enchantment: number
  category: string
  subcategory: string
  weight?: number
}

interface ProcessedRecipe {
  itemId: string
  materials: Array<{ itemId: string; count: number }>
  silver: number
  craftingFocus: number
  amountCrafted: number
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Normalize a field that can be a single object or an array into an array */
function toArray<T>(val: T | T[] | undefined | null): T[] {
  if (val == null) return []
  return Array.isArray(val) ? val : [val]
}

/** Safe parse int from string, defaulting to fallback */
function safeInt(val: string | undefined | null, fallback = 0): number {
  if (val == null) return fallback
  const n = parseInt(val, 10)
  return isNaN(n) ? fallback : n
}

/** Safe parse float */
function safeFloat(val: string | undefined | null, fallback = 0): number {
  if (val == null) return fallback
  const n = parseFloat(val)
  return isNaN(n) ? fallback : n
}

/** Extract tier number from item ID like "T4_MAIN_SWORD" */
function extractTier(item: RawItem): number {
  // Prefer explicit @tier field
  if (item['@tier']) {
    return safeInt(item['@tier'], 0)
  }
  // Fallback: parse from uniquename
  const match = item['@uniquename'].match(/^T(\d)/)
  return match ? parseInt(match[1], 10) : 0
}

/** Build materials array from craft requirements */
function extractMaterials(
  req: RawCraftingRequirements,
): Array<{ itemId: string; count: number }> {
  const resources = toArray(req.craftresource)
  return resources
    .filter((r) => r['@uniquename'] && r['@count'])
    .map((r) => ({
      itemId: r['@uniquename'],
      count: safeInt(r['@count'], 1),
    }))
}

// ---------------------------------------------------------------------------
// Download with retry
// ---------------------------------------------------------------------------
async function download(url: string, label: string): Promise<string> {
  console.log(`  Downloading ${label}...`)
  const maxRetries = 3
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const res = await fetch(url)
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${res.statusText}`)
      }
      const text = await res.text()
      const sizeMB = (Buffer.byteLength(text) / 1024 / 1024).toFixed(1)
      console.log(`  -> ${label}: ${sizeMB} MB downloaded`)
      return text
    } catch (err) {
      console.error(`  Attempt ${attempt}/${maxRetries} failed for ${label}:`, err)
      if (attempt === maxRetries) throw err
      await new Promise((r) => setTimeout(r, 2000 * attempt))
    }
  }
  throw new Error('Unreachable')
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------
async function main() {
  console.log('=== Albion Online Game Data Sync ===\n')

  // 1. Download raw data
  console.log('Step 1: Downloading raw data...')
  const [formattedText, rootText] = await Promise.all([
    download(FORMATTED_ITEMS_URL, 'formatted/items.json'),
    download(ROOT_ITEMS_URL, 'items.json'),
  ])

  // 2. Parse
  console.log('\nStep 2: Parsing JSON...')
  const formattedItems: RawFormattedItem[] = JSON.parse(formattedText)
  const rootData = JSON.parse(rootText)
  console.log(`  formatted/items.json: ${formattedItems.length} entries`)

  // 3. Build name lookup from formatted items
  console.log('\nStep 3: Building name lookup...')
  const nameMap = new Map<
    string,
    { en: string; zh?: string; names: Record<string, string> }
  >()
  for (const item of formattedItems) {
    const en = item.LocalizedNames?.['EN-US'] ?? item.UniqueName
    const zh = item.LocalizedNames?.['ZH-CN'] ?? undefined
    nameMap.set(item.UniqueName, {
      en,
      zh,
      names: item.LocalizedNames ?? {},
    })
  }
  console.log(`  Name entries: ${nameMap.size}`)

  // 4. Collect all raw items from root data
  console.log('\nStep 4: Extracting items from root data...')
  const allRawItems: RawItem[] = []
  const itemCategories = rootData.items
  if (itemCategories) {
    for (const [category, value] of Object.entries(itemCategories)) {
      if (category.startsWith('@')) continue // skip @xmlns etc
      const items = toArray(value as RawItem | RawItem[])
      allRawItems.push(...items)
    }
  }
  console.log(`  Raw items extracted: ${allRawItems.length}`)

  // 5. Process items and recipes
  console.log('\nStep 5: Processing items and recipes...')
  const processedItems: ProcessedItem[] = []
  const processedRecipes: ProcessedRecipe[] = []
  const itemNames: Record<string, Record<string, string>> = {}

  // Track processed item IDs to avoid duplicates
  const seenItems = new Set<string>()

  for (const raw of allRawItems) {
    const uniqueName = raw['@uniquename']
    if (!uniqueName || seenItems.has(uniqueName)) continue
    seenItems.add(uniqueName)

    const tier = extractTier(raw)
    const category = raw['@shopcategory'] ?? ''
    const subcategory = raw['@shopsubcategory1'] ?? ''
    const weight = raw['@weight'] ? safeFloat(raw['@weight']) : undefined

    // Get localized name
    const nameEntry = nameMap.get(uniqueName)
    const name = nameEntry?.en ?? uniqueName
    const nameZH = nameEntry?.zh

    // Add base item
    const item: ProcessedItem = {
      id: uniqueName,
      name,
      tier,
      enchantment: 0,
      category,
      subcategory,
    }
    if (nameZH) item.nameZH = nameZH
    if (weight != null && weight > 0) item.weight = weight
    processedItems.push(item)

    // Add localized names to item-names output
    if (nameEntry?.names && Object.keys(nameEntry.names).length > 0) {
      itemNames[uniqueName] = nameEntry.names
    }

    // Extract base recipe
    const craftReqs = toArray(raw.craftingrequirements)
    for (const req of craftReqs) {
      const materials = extractMaterials(req)
      if (materials.length === 0) continue

      processedRecipes.push({
        itemId: uniqueName,
        materials,
        silver: safeInt(req['@silver']),
        craftingFocus: safeInt(req['@craftingfocus'] ?? raw['@craftingfocus']),
        amountCrafted: safeInt(req['@amountcrafted'], 1),
      })
      break // Only take the first valid crafting requirement set
    }

    // Extract enchanted variants
    const enchantments = toArray(raw.enchantments?.enchantment)
    for (const ench of enchantments) {
      const enchLevel = safeInt(ench['@enchantmentlevel'], 0)
      if (enchLevel <= 0) continue

      const enchId = `${uniqueName}@${enchLevel}`
      if (seenItems.has(enchId)) continue
      seenItems.add(enchId)

      // Get enchanted item name from formatted data
      const enchNameEntry = nameMap.get(enchId)
      const enchName = enchNameEntry?.en ?? `${name} (Enchantment ${enchLevel})`
      const enchNameZH = enchNameEntry?.zh

      const enchItem: ProcessedItem = {
        id: enchId,
        name: enchName,
        tier,
        enchantment: enchLevel,
        category,
        subcategory,
      }
      if (enchNameZH) enchItem.nameZH = enchNameZH
      if (weight != null && weight > 0) enchItem.weight = weight
      processedItems.push(enchItem)

      // Enchanted names
      if (enchNameEntry?.names && Object.keys(enchNameEntry.names).length > 0) {
        itemNames[enchId] = enchNameEntry.names
      }

      // Enchanted recipe
      const enchCraftReqs = toArray(ench.craftingrequirements)
      for (const req of enchCraftReqs) {
        const materials = extractMaterials(req)
        if (materials.length === 0) continue

        processedRecipes.push({
          itemId: enchId,
          materials,
          silver: safeInt(req['@silver']),
          craftingFocus: safeInt(req['@craftingfocus'] ?? raw['@craftingfocus']),
          amountCrafted: safeInt(req['@amountcrafted'], 1),
        })
        break
      }
    }
  }

  // Also add items from formatted list that weren't in root data (journal items, etc.)
  for (const fItem of formattedItems) {
    if (seenItems.has(fItem.UniqueName)) continue
    seenItems.add(fItem.UniqueName)

    const nameEntry = nameMap.get(fItem.UniqueName)
    const tierMatch = fItem.UniqueName.match(/^T(\d)/)
    const tier = tierMatch ? parseInt(tierMatch[1], 10) : 0
    const enchMatch = fItem.UniqueName.match(/@(\d+)$/)
    const enchantment = enchMatch ? parseInt(enchMatch[1], 10) : 0

    const item: ProcessedItem = {
      id: fItem.UniqueName,
      name: nameEntry?.en ?? fItem.UniqueName,
      tier,
      enchantment,
      category: '',
      subcategory: '',
    }
    if (nameEntry?.zh) item.nameZH = nameEntry.zh
    processedItems.push(item)

    if (nameEntry?.names && Object.keys(nameEntry.names).length > 0) {
      itemNames[fItem.UniqueName] = nameEntry.names
    }
  }

  console.log(`  Processed items: ${processedItems.length}`)
  console.log(`  Processed recipes: ${processedRecipes.length}`)
  console.log(`  Item name entries: ${Object.keys(itemNames).length}`)

  // 6. Write output files
  console.log('\nStep 6: Writing output files...')
  if (!existsSync(OUTPUT_DIR)) {
    mkdirSync(OUTPUT_DIR, { recursive: true })
  }

  const itemsPath = join(OUTPUT_DIR, 'items.json')
  const recipesPath = join(OUTPUT_DIR, 'recipes.json')
  const namesPath = join(OUTPUT_DIR, 'item-names.json')

  const itemsJson = JSON.stringify(processedItems)
  const recipesJson = JSON.stringify(processedRecipes)
  const namesJson = JSON.stringify(itemNames)

  writeFileSync(itemsPath, itemsJson, 'utf-8')
  writeFileSync(recipesPath, recipesJson, 'utf-8')
  writeFileSync(namesPath, namesJson, 'utf-8')

  const itemsSize = (Buffer.byteLength(itemsJson) / 1024).toFixed(0)
  const recipesSize = (Buffer.byteLength(recipesJson) / 1024).toFixed(0)
  const namesSize = (Buffer.byteLength(namesJson) / 1024).toFixed(0)

  console.log(`  -> items.json: ${itemsSize} KB (${processedItems.length} items)`)
  console.log(`  -> recipes.json: ${recipesSize} KB (${processedRecipes.length} recipes)`)
  console.log(`  -> item-names.json: ${namesSize} KB (${Object.keys(itemNames).length} entries)`)

  console.log('\n=== Sync complete! ===')
}

main().catch((err) => {
  console.error('\nFatal error:', err)
  process.exit(1)
})
