// =============================================================================
// Black Market Flipper — scanner hook
// Fetches prices in batches and finds profitable flip opportunities
// =============================================================================

'use client'

import { useState, useCallback, useRef } from 'react'
import { useGameDataStore } from '@/lib/stores/game-data-store'
import { useFlipperStore } from '@/lib/stores/flipper-store'
import { useAppStore } from '@/lib/stores/app-store'
import {
  BM_CATEGORIES,
  calculateFlipProfit,
  isStaleDate,
  getDataAgeHours,
  type FlipOpportunity,
} from '../utils/flipper-calc'

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------
const BATCH_SIZE = 40 // items per API call to stay under URL limit
const DELAY_BETWEEN_BATCHES_MS = 200 // throttle to avoid rate limits

// ---------------------------------------------------------------------------
// API response shape (from Albion Data Project)
// ---------------------------------------------------------------------------
interface PriceEntry {
  item_id: string
  city: string
  quality: number
  sell_price_min: number
  sell_price_min_date: string
  sell_price_max: number
  sell_price_max_date: string
  buy_price_min: number
  buy_price_min_date: string
  buy_price_max: number
  buy_price_max_date: string
}

// ---------------------------------------------------------------------------
// Hook return type
// ---------------------------------------------------------------------------
export interface FlipperScanResult {
  opportunities: FlipOpportunity[]
  isScanning: boolean
  progress: { current: number; total: number }
  error: string | null
  scan: () => Promise<void>
  cancel: () => void
}

// ---------------------------------------------------------------------------
// Hook implementation
// ---------------------------------------------------------------------------
export function useFlipperScan(): FlipperScanResult {
  const [opportunities, setOpportunities] = useState<FlipOpportunity[]>([])
  const [isScanning, setIsScanning] = useState(false)
  const [progress, setProgress] = useState({ current: 0, total: 0 })
  const [error, setError] = useState<string | null>(null)

  const cancelledRef = useRef(false)

  const region = useAppStore((s) => s.region)
  const {
    buyLocation,
    minTier,
    maxTier,
    enchantmentLevels,
    categories,
    isPremium,
    maxDataAgeHours,
  } = useFlipperStore()

  const { itemsList, loaded, getItem } = useGameDataStore()

  // -------------------------------------------------------------------------
  // Build the list of equipment item IDs matching current filters
  // -------------------------------------------------------------------------
  const getFilteredItemIds = useCallback((): string[] => {
    if (!loaded || itemsList.length === 0) return []

    // Map our BM category names to ProcessedItem.category/subcategory values
    const categorySet = new Set(categories)

    return itemsList
      .filter((item) => {
        // Tier range
        if (item.tier < minTier || item.tier > maxTier) return false

        // Enchantment filter
        if (!enchantmentLevels.includes(item.enchantment)) return false

        // Category filter — match against the item's category or subcategory
        const cat = item.category?.toLowerCase() ?? ''
        const subcat = item.subcategory?.toLowerCase() ?? ''

        // Map ProcessedItem categories to our BM categories
        let matchesCategory = false
        for (const bmCat of categorySet) {
          switch (bmCat) {
            case 'weapons':
              if (cat === 'weapon' || cat === 'weapons') matchesCategory = true
              break
            case 'head':
              if (
                subcat.includes('helmet') ||
                subcat.includes('head') ||
                subcat.includes('hood') ||
                subcat.includes('cowl') ||
                subcat === 'cloth_helmet' ||
                subcat === 'leather_helmet' ||
                subcat === 'plate_helmet'
              )
                matchesCategory = true
              break
            case 'armors':
              if (
                (cat === 'armor' || cat === 'armors') &&
                !subcat.includes('helmet') &&
                !subcat.includes('head') &&
                !subcat.includes('hood') &&
                !subcat.includes('cowl') &&
                !subcat.includes('shoes') &&
                !subcat.includes('boots') &&
                !subcat.includes('sandals') &&
                subcat !== 'cloth_helmet' &&
                subcat !== 'leather_helmet' &&
                subcat !== 'plate_helmet' &&
                subcat !== 'cloth_shoes' &&
                subcat !== 'leather_shoes' &&
                subcat !== 'plate_shoes' &&
                subcat !== 'cape' &&
                subcat !== 'bag'
              )
                matchesCategory = true
              if (
                subcat === 'cloth_armor' ||
                subcat === 'leather_armor' ||
                subcat === 'plate_armor'
              )
                matchesCategory = true
              break
            case 'shoes':
              if (
                subcat.includes('shoes') ||
                subcat.includes('boots') ||
                subcat.includes('sandals') ||
                subcat === 'cloth_shoes' ||
                subcat === 'leather_shoes' ||
                subcat === 'plate_shoes'
              )
                matchesCategory = true
              break
            case 'offhands':
              if (
                cat === 'accessory' ||
                cat === 'offhand' ||
                cat === 'offhands' ||
                subcat === 'shield' ||
                subcat === 'book' ||
                subcat === 'orb' ||
                subcat === 'torch' ||
                subcat === 'totem'
              )
                matchesCategory = true
              break
            case 'capes':
              if (subcat === 'cape' || subcat === 'capes')
                matchesCategory = true
              break
            case 'bags':
              if (subcat === 'bag' || subcat === 'bags')
                matchesCategory = true
              break
          }
        }

        return matchesCategory
      })
      .map((item) => item.id)
  }, [loaded, itemsList, minTier, maxTier, enchantmentLevels, categories])

  // -------------------------------------------------------------------------
  // Batch item IDs into groups
  // -------------------------------------------------------------------------
  const batchIds = useCallback(
    (ids: string[]): string[][] => {
      const batches: string[][] = []
      for (let i = 0; i < ids.length; i += BATCH_SIZE) {
        batches.push(ids.slice(i, i + BATCH_SIZE))
      }
      return batches
    },
    [],
  )

  // -------------------------------------------------------------------------
  // Fetch a single batch of prices
  // -------------------------------------------------------------------------
  const fetchBatch = useCallback(
    async (itemIds: string[]): Promise<PriceEntry[]> => {
      const locations = `${buyLocation},Black Market`
      const itemsParam = itemIds.join(',')
      const url = `/api/v1/prices?items=${itemsParam}&region=${region}&locations=${encodeURIComponent(locations)}`

      const res = await fetch(url)
      if (!res.ok) {
        throw new Error(`API error: ${res.status}`)
      }
      return res.json()
    },
    [buyLocation, region],
  )

  // -------------------------------------------------------------------------
  // Process a batch of price data into flip opportunities
  // -------------------------------------------------------------------------
  const processBatch = useCallback(
    (entries: PriceEntry[]): FlipOpportunity[] => {
      // Group entries by item_id
      const byItem = new Map<string, PriceEntry[]>()
      for (const entry of entries) {
        const list = byItem.get(entry.item_id) || []
        list.push(entry)
        byItem.set(entry.item_id, list)
      }

      const flips: FlipOpportunity[] = []

      for (const [itemId, itemEntries] of byItem) {
        // Separate buy city entries and BM entries
        const buyEntries = itemEntries.filter((e) => e.city !== 'Black Market')
        const bmEntries = itemEntries.filter((e) => e.city === 'Black Market')

        // For each BM buy order (per quality), find matching buy opportunity
        for (const bmEntry of bmEntries) {
          if (bmEntry.buy_price_max <= 0) continue
          if (isStaleDate(bmEntry.buy_price_max_date)) continue

          const bmQuality = bmEntry.quality // BM wants this quality

          // Find cheapest sell order in buy city with quality >= BM required quality
          // (higher quality can fill lower quality BM orders)
          const validBuyEntries = buyEntries.filter(
            (e) => e.quality >= bmQuality && e.sell_price_min > 0 && !isStaleDate(e.sell_price_min_date)
          )

          if (validBuyEntries.length === 0) continue

          // Pick the cheapest
          const cheapest = validBuyEntries.reduce((a, b) =>
            a.sell_price_min < b.sell_price_min ? a : b
          )

          const cityPrice = cheapest.sell_price_min
          const bmPrice = bmEntry.buy_price_max

          // Filter by data age if configured
          if (maxDataAgeHours > 0) {
            const buyAge = getDataAgeHours(cheapest.sell_price_min_date)
            const sellAge = getDataAgeHours(bmEntry.buy_price_max_date)
            if (buyAge > maxDataAgeHours || sellAge > maxDataAgeHours) continue
          }

          const { salesTax, netProfit, profitMargin } =
            calculateFlipProfit(cityPrice, bmPrice, isPremium)

          if (netProfit <= 0) continue

          const item = getItem(itemId)

          flips.push({
            itemId,
            itemName: item?.name ?? itemId,
            tier: item?.tier ?? 0,
            enchantment: item?.enchantment ?? 0,
            category: item?.category ?? '',
            buyCity: cheapest.city,
            buyPrice: cityPrice,
            buyPriceDate: cheapest.sell_price_min_date,
            buyQuality: cheapest.quality,
            sellPrice: bmPrice,
            sellPriceDate: bmEntry.buy_price_max_date,
            sellQuality: bmQuality,
            salesTax,
            netProfit,
            profitMargin,
          })
        }
      }

      return flips
    },
    [isPremium, maxDataAgeHours, getItem],
  )

  // -------------------------------------------------------------------------
  // Main scan function
  // -------------------------------------------------------------------------
  const scan = useCallback(async () => {
    if (isScanning) return

    cancelledRef.current = false
    setIsScanning(true)
    setError(null)
    setOpportunities([])

    try {
      const itemIds = getFilteredItemIds()

      if (itemIds.length === 0) {
        setError('No equipment items found matching your filters. Make sure game data is loaded.')
        setIsScanning(false)
        return
      }

      const batches = batchIds(itemIds)
      setProgress({ current: 0, total: batches.length })

      const allFlips: FlipOpportunity[] = []

      for (let i = 0; i < batches.length; i++) {
        if (cancelledRef.current) break

        try {
          const entries = await fetchBatch(batches[i])
          const batchFlips = processBatch(entries)
          allFlips.push(...batchFlips)

          // Progressively update results sorted by profit
          const sorted = [...allFlips].sort((a, b) => b.netProfit - a.netProfit)
          setOpportunities(sorted)
        } catch (err) {
          console.warn(`[Flipper] Batch ${i + 1} failed:`, err)
          // Continue scanning remaining batches
        }

        setProgress({ current: i + 1, total: batches.length })

        // Small delay to avoid overwhelming the API
        if (i < batches.length - 1 && !cancelledRef.current) {
          await new Promise((resolve) => setTimeout(resolve, DELAY_BETWEEN_BATCHES_MS))
        }
      }

      if (!cancelledRef.current && allFlips.length === 0) {
        setError('No profitable flips found with current filters. Try adjusting your settings.')
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Scan failed'
      setError(message)
    } finally {
      setIsScanning(false)
    }
  }, [isScanning, getFilteredItemIds, batchIds, fetchBatch, processBatch])

  // -------------------------------------------------------------------------
  // Cancel scanning
  // -------------------------------------------------------------------------
  const cancel = useCallback(() => {
    cancelledRef.current = true
  }, [])

  return {
    opportunities,
    isScanning,
    progress,
    error,
    scan,
    cancel,
  }
}
