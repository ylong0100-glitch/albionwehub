// =============================================================================
// Enchant & Flip scanner hook
// For each equipment item, fetches .0 price + .1 BM price + rune prices,
// then calculates enchant-flip profitability
// =============================================================================

'use client'

import { useState, useCallback, useRef } from 'react'
import { useGameDataStore } from '@/lib/stores/game-data-store'
import { useFlipperStore } from '@/lib/stores/flipper-store'
import { useAppStore } from '@/lib/stores/app-store'
import {
  calculateFlipProfit,
  isStaleDate,
  getDataAgeHours,
} from '../utils/flipper-calc'
import {
  calculateEnchantFlipProfit,
  getRuneCountForItem,
  type EnchantFlipOpportunity,
} from '../utils/enchant-flip-calc'

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------
const BATCH_SIZE = 30
const DELAY_BETWEEN_BATCHES_MS = 250

// ---------------------------------------------------------------------------
// API response shape
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
export interface EnchantFlipScanResult {
  opportunities: EnchantFlipOpportunity[]
  isScanning: boolean
  progress: { current: number; total: number }
  error: string | null
  scan: () => Promise<void>
  cancel: () => void
}

// ---------------------------------------------------------------------------
// Hook implementation
// ---------------------------------------------------------------------------
export function useEnchantFlipScan(): EnchantFlipScanResult {
  const [opportunities, setOpportunities] = useState<EnchantFlipOpportunity[]>([])
  const [isScanning, setIsScanning] = useState(false)
  const [progress, setProgress] = useState({ current: 0, total: 0 })
  const [error, setError] = useState<string | null>(null)

  const cancelledRef = useRef(false)

  const region = useAppStore((s) => s.region)
  const {
    buyLocation,
    minTier,
    maxTier,
    categories,
    isPremium,
    maxDataAgeHours,
  } = useFlipperStore()

  const { itemsList, loaded, getItem } = useGameDataStore()

  // -------------------------------------------------------------------------
  // Build list of base (.0) equipment item IDs
  // -------------------------------------------------------------------------
  const getBaseItemIds = useCallback((): string[] => {
    if (!loaded || itemsList.length === 0) return []

    const categorySet = new Set(categories)

    return itemsList
      .filter((item) => {
        if (item.tier < minTier || item.tier > maxTier) return false
        // Only .0 items
        if (item.enchantment !== 0) return false

        const cat = item.category?.toLowerCase() ?? ''
        const subcat = item.subcategory?.toLowerCase() ?? ''

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
  }, [loaded, itemsList, minTier, maxTier, categories])

  // -------------------------------------------------------------------------
  // Fetch rune prices for all tiers in range
  // -------------------------------------------------------------------------
  const fetchRunePrices = useCallback(
    async (): Promise<Record<string, number>> => {
      const runeIds: string[] = []
      for (let t = minTier; t <= maxTier; t++) {
        runeIds.push(`T${t}_RUNE`)
      }

      const locations = buyLocation
      const url = `/api/v1/prices?items=${runeIds.join(',')}&region=${region}&locations=${encodeURIComponent(locations)}`

      const res = await fetch(url)
      if (!res.ok) throw new Error(`Rune price fetch failed: ${res.status}`)

      const entries: PriceEntry[] = await res.json()
      const prices: Record<string, number> = {}

      for (const entry of entries) {
        if (entry.city === buyLocation && entry.sell_price_min > 0) {
          const existing = prices[entry.item_id]
          if (!existing || entry.sell_price_min < existing) {
            prices[entry.item_id] = entry.sell_price_min
          }
        }
      }

      return prices
    },
    [buyLocation, region, minTier, maxTier],
  )

  // -------------------------------------------------------------------------
  // Fetch batch of prices for .0 (buy city) and .1 (BM)
  // -------------------------------------------------------------------------
  const fetchBatch = useCallback(
    async (baseItemIds: string[]): Promise<PriceEntry[]> => {
      // We need both .0 and .1 versions
      const allIds: string[] = []
      for (const id of baseItemIds) {
        allIds.push(id)         // .0 version
        allIds.push(`${id}@1`)  // .1 version
      }

      const locations = `${buyLocation},Black Market`
      const url = `/api/v1/prices?items=${allIds.join(',')}&region=${region}&locations=${encodeURIComponent(locations)}`

      const res = await fetch(url)
      if (!res.ok) throw new Error(`API error: ${res.status}`)
      return res.json()
    },
    [buyLocation, region],
  )

  // -------------------------------------------------------------------------
  // Process batch into enchant-flip opportunities
  // -------------------------------------------------------------------------
  const processBatch = useCallback(
    (
      entries: PriceEntry[],
      runePrices: Record<string, number>,
    ): EnchantFlipOpportunity[] => {
      // Group by item_id
      const byItem = new Map<string, PriceEntry[]>()
      for (const entry of entries) {
        const list = byItem.get(entry.item_id) || []
        list.push(entry)
        byItem.set(entry.item_id, list)
      }

      const flips: EnchantFlipOpportunity[] = []

      // For each base item, find .0 city price and .1 BM price
      for (const [itemId, itemEntries] of byItem) {
        // Skip .1 items (we look them up via the base ID)
        if (itemId.includes('@')) continue

        const baseId = itemId
        const enchantedId = `${baseId}@1`

        // .0 city sell orders (what we can buy)
        const baseCityEntries = itemEntries.filter(
          (e) => e.city !== 'Black Market' && e.sell_price_min > 0 && !isStaleDate(e.sell_price_min_date),
        )
        if (baseCityEntries.length === 0) continue

        const cheapestBase = baseCityEntries.reduce((a, b) =>
          a.sell_price_min < b.sell_price_min ? a : b,
        )

        // .1 BM buy orders
        const enchantedEntries = byItem.get(enchantedId) || []
        const bmEnchantedEntries = enchantedEntries.filter(
          (e) => e.city === 'Black Market' && e.buy_price_max > 0 && !isStaleDate(e.buy_price_max_date),
        )
        if (bmEnchantedEntries.length === 0) continue

        const bestBmEnchanted = bmEnchantedEntries.reduce((a, b) =>
          a.buy_price_max > b.buy_price_max ? a : b,
        )

        // Check data age
        if (maxDataAgeHours > 0) {
          const buyAge = getDataAgeHours(cheapestBase.sell_price_min_date)
          const sellAge = getDataAgeHours(bestBmEnchanted.buy_price_max_date)
          if (buyAge > maxDataAgeHours || sellAge > maxDataAgeHours) continue
        }

        // Get rune info
        const item = getItem(baseId)
        const tier = item?.tier ?? 4
        const runeId = `T${tier}_RUNE`
        const runePrice = runePrices[runeId] ?? 0
        const runeCount = getRuneCountForItem(baseId)

        if (runePrice <= 0) continue

        const basePrice = cheapestBase.sell_price_min
        const bmPriceEnchanted = bestBmEnchanted.buy_price_max

        const result = calculateEnchantFlipProfit({
          basePrice,
          runePrice,
          runeCount,
          bmPriceEnchanted,
          isPremium,
        })

        if (result.enchantFlipProfit <= 0) continue

        // Also calculate direct flip profit for .0 item (if BM has .0 buy order)
        let directFlipProfit = 0
        const bmBaseEntries = itemEntries.filter(
          (e) => e.city === 'Black Market' && e.buy_price_max > 0 && !isStaleDate(e.buy_price_max_date),
        )
        if (bmBaseEntries.length > 0) {
          const bestBmBase = bmBaseEntries.reduce((a, b) =>
            a.buy_price_max > b.buy_price_max ? a : b,
          )
          const directResult = calculateFlipProfit(basePrice, bestBmBase.buy_price_max, isPremium)
          directFlipProfit = directResult.netProfit
        }

        flips.push({
          itemId: baseId,
          itemName: item?.name ?? baseId,
          tier,
          category: item?.category ?? '',
          buyCity: cheapestBase.city,
          basePrice,
          basePriceDate: cheapestBase.sell_price_min_date,
          runeItemId: runeId,
          runePrice,
          runeCount,
          runeTotalCost: result.runeTotalCost,
          bmPriceEnchanted,
          bmPriceDateEnchanted: bestBmEnchanted.buy_price_max_date,
          salesTax: result.salesTax,
          totalCost: result.totalCost,
          netRevenue: result.netRevenue,
          enchantFlipProfit: result.enchantFlipProfit,
          directFlipProfit,
          profitDifference: result.enchantFlipProfit - directFlipProfit,
        })
      }

      return flips
    },
    [isPremium, maxDataAgeHours, getItem],
  )

  // -------------------------------------------------------------------------
  // Main scan
  // -------------------------------------------------------------------------
  const scan = useCallback(async () => {
    if (isScanning) return

    cancelledRef.current = false
    setIsScanning(true)
    setError(null)
    setOpportunities([])

    try {
      const baseItemIds = getBaseItemIds()

      if (baseItemIds.length === 0) {
        setError('No equipment items found matching your filters. Make sure game data is loaded.')
        setIsScanning(false)
        return
      }

      // First fetch rune prices
      const runePrices = await fetchRunePrices()

      const batches: string[][] = []
      for (let i = 0; i < baseItemIds.length; i += BATCH_SIZE) {
        batches.push(baseItemIds.slice(i, i + BATCH_SIZE))
      }

      setProgress({ current: 0, total: batches.length })

      const allFlips: EnchantFlipOpportunity[] = []

      for (let i = 0; i < batches.length; i++) {
        if (cancelledRef.current) break

        try {
          const entries = await fetchBatch(batches[i])
          const batchFlips = processBatch(entries, runePrices)
          allFlips.push(...batchFlips)

          const sorted = [...allFlips].sort(
            (a, b) => b.enchantFlipProfit - a.enchantFlipProfit,
          )
          setOpportunities(sorted)
        } catch (err) {
          console.warn(`[EnchantFlip] Batch ${i + 1} failed:`, err)
        }

        setProgress({ current: i + 1, total: batches.length })

        if (i < batches.length - 1 && !cancelledRef.current) {
          await new Promise((resolve) => setTimeout(resolve, DELAY_BETWEEN_BATCHES_MS))
        }
      }

      if (!cancelledRef.current && allFlips.length === 0) {
        setError('No profitable enchant-flip opportunities found with current filters.')
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Scan failed'
      setError(message)
    } finally {
      setIsScanning(false)
    }
  }, [isScanning, getBaseItemIds, fetchRunePrices, fetchBatch, processBatch])

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
