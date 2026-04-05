// =============================================================================
// Trade Route Calculation Utilities
// Profit calculation and route finding for city-to-city trading
// =============================================================================

import type { PriceEntry } from '@/lib/api/albion-data'
import type { ProcessedItem } from '@/types/game-data'
import { MARKET_SETUP_FEE, MARKET_SALES_TAX } from '@/lib/utils/constants'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface TradeRoute {
  itemId: string
  itemName: string
  tier: number
  enchantment: number
  category: string
  buyCity: string
  buyPrice: number
  buyPriceDate: string
  sellCity: string
  sellPrice: number
  sellPriceDate: string
  netProfit: number
  profitMargin: number
  weight: number | undefined
  profitPerWeight: number | undefined
}

export interface TradeProfitResult {
  netProfit: number
  profitMargin: number
  setupFee: number
  salesTax: number
}

// ---------------------------------------------------------------------------
// Mount carry capacities (in kg)
// ---------------------------------------------------------------------------
export const MOUNT_CAPACITIES: Record<string, number> = {
  'T3 Horse': 262,
  'T4 Horse': 353,
  'T5 Horse': 467,
  'T6 Horse': 590,
  'T7 Horse': 724,
  'T8 Horse': 871,
  'T3 Ox': 1050,
  'T4 Ox': 1380,
  'T5 Ox': 1776,
  'T6 Ox': 2244,
  'T7 Ox': 2790,
  'T8 Ox': 3420,
  'T5 Transport Mammoth': 8316,
  'T8 Transport Mammoth': 13692,
}

/** Grouped mount list for selector UI */
export const MOUNT_GROUPS = [
  {
    label: 'Horses',
    mounts: ['T3 Horse', 'T4 Horse', 'T5 Horse', 'T6 Horse', 'T7 Horse', 'T8 Horse'],
  },
  {
    label: 'Oxen',
    mounts: ['T3 Ox', 'T4 Ox', 'T5 Ox', 'T6 Ox', 'T7 Ox', 'T8 Ox'],
  },
  {
    label: 'Mammoths',
    mounts: ['T5 Transport Mammoth', 'T8 Transport Mammoth'],
  },
] as const

// ---------------------------------------------------------------------------
// Stale data threshold
// ---------------------------------------------------------------------------
const STALE_DATE = '0001-01-01'

function isStaleDate(dateStr: string): boolean {
  return !dateStr || dateStr.startsWith(STALE_DATE)
}

// ---------------------------------------------------------------------------
// Profit calculation
// ---------------------------------------------------------------------------

/**
 * Calculate net profit and margin for a trade.
 *
 * Formula:
 *   netProfit = sellPrice * (1 - salesTaxRate) - buyPrice * (1 + setupFeeRate)
 *
 * Premium players pay 4% sales tax, non-premium pay 8%.
 * Setup fee is 2.5% for everyone.
 */
export function calculateTradeProfit(
  buyPrice: number,
  sellPrice: number,
  isPremium: boolean,
): TradeProfitResult {
  const setupFeeRate = MARKET_SETUP_FEE
  const salesTaxRate = isPremium ? MARKET_SALES_TAX : MARKET_SALES_TAX * 2

  const setupFee = buyPrice * setupFeeRate
  const salesTax = sellPrice * salesTaxRate
  const totalBuyCost = buyPrice + setupFee
  const sellRevenue = sellPrice - salesTax
  const netProfit = sellRevenue - totalBuyCost
  const profitMargin = totalBuyCost > 0 ? (netProfit / totalBuyCost) * 100 : 0

  return {
    netProfit: Math.round(netProfit),
    profitMargin: Number(profitMargin.toFixed(2)),
    setupFee: Math.round(setupFee),
    salesTax: Math.round(salesTax),
  }
}

// ---------------------------------------------------------------------------
// Route filter interface
// ---------------------------------------------------------------------------

export interface RouteFilters {
  buyCity: string   // city name or 'all'
  sellCity: string  // city name or 'all'
  minTier: number
  maxTier: number
  categories: string[]
  minProfit: number
  isPremium: boolean
  maxWeight: number // 0 = no limit
}

// ---------------------------------------------------------------------------
// Find best routes from price data
// ---------------------------------------------------------------------------

/**
 * Given raw price entries from the API and item metadata, find all
 * profitable trade routes that match the provided filters.
 *
 * For each item, we look at sell_price_min in every city (the price a
 * player can BUY at -- the lowest sell order) and buy_price_max in every
 * city (the price a player can SELL at -- the highest buy order).
 *
 * A profitable route: buy at sell_price_min in city A, sell at
 * buy_price_max in city B, where A != B.
 */
export function findBestRoutes(
  priceData: PriceEntry[],
  items: Map<string, ProcessedItem>,
  filters: RouteFilters,
): TradeRoute[] {
  // Group prices by item_id
  const pricesByItem = new Map<string, PriceEntry[]>()
  for (const entry of priceData) {
    const existing = pricesByItem.get(entry.item_id)
    if (existing) {
      existing.push(entry)
    } else {
      pricesByItem.set(entry.item_id, [entry])
    }
  }

  const routes: TradeRoute[] = []

  for (const [itemId, entries] of pricesByItem) {
    const item = items.get(itemId)
    if (!item) continue

    // Tier filter
    if (item.tier < filters.minTier || item.tier > filters.maxTier) continue

    // Category filter
    if (
      filters.categories.length > 0 &&
      !filters.categories.includes(item.category)
    ) {
      continue
    }

    // Weight filter (skip items heavier than mount capacity)
    if (
      filters.maxWeight > 0 &&
      item.weight !== undefined &&
      item.weight > filters.maxWeight
    ) {
      continue
    }

    // Collect buy opportunities (lowest sell order in each city = what we pay)
    // Collect sell opportunities (highest buy order in each city = what we receive)
    const buyOptions: { city: string; price: number; date: string }[] = []
    const sellOptions: { city: string; price: number; date: string }[] = []

    for (const entry of entries) {
      // Buy opportunity: cheapest sell order
      if (
        entry.sell_price_min > 0 &&
        !isStaleDate(entry.sell_price_min_date)
      ) {
        if (
          filters.buyCity === 'all' ||
          entry.city === filters.buyCity
        ) {
          buyOptions.push({
            city: entry.city,
            price: entry.sell_price_min,
            date: entry.sell_price_min_date,
          })
        }
      }

      // Sell opportunity: highest buy order
      if (
        entry.buy_price_max > 0 &&
        !isStaleDate(entry.buy_price_max_date)
      ) {
        if (
          filters.sellCity === 'all' ||
          entry.city === filters.sellCity
        ) {
          sellOptions.push({
            city: entry.city,
            price: entry.buy_price_max,
            date: entry.buy_price_max_date,
          })
        }
      }
    }

    // Find all profitable city pairs
    for (const buy of buyOptions) {
      for (const sell of sellOptions) {
        if (buy.city === sell.city) continue

        const result = calculateTradeProfit(
          buy.price,
          sell.price,
          filters.isPremium,
        )

        if (result.netProfit < filters.minProfit) continue

        const profitPerWeight =
          item.weight !== undefined && item.weight > 0
            ? Number((result.netProfit / item.weight).toFixed(2))
            : undefined

        routes.push({
          itemId,
          itemName: item.name,
          tier: item.tier,
          enchantment: item.enchantment,
          category: item.category,
          buyCity: buy.city,
          buyPrice: buy.price,
          buyPriceDate: buy.date,
          sellCity: sell.city,
          sellPrice: sell.price,
          sellPriceDate: sell.date,
          netProfit: result.netProfit,
          profitMargin: result.profitMargin,
          weight: item.weight,
          profitPerWeight,
        })
      }
    }
  }

  // Sort by net profit descending by default
  routes.sort((a, b) => b.netProfit - a.netProfit)

  return routes
}

// ---------------------------------------------------------------------------
// Default trade categories (items commonly traded between cities)
// ---------------------------------------------------------------------------
export const TRADE_CATEGORIES = [
  'weapons',
  'head',
  'armors',
  'shoes',
  'offhands',
  'capes',
  'bags',
  'mounts',
  'tools',
  'consumables',
  'resources',
  'materials',
  'furniture',
  'farming',
  'accessories',
  'token',
  'cityresources',
  'artefacts',
  'luxurygoods',
  'trophies',
] as const

export type TradeCategory = (typeof TRADE_CATEGORIES)[number]

/** Human-readable category labels */
export const CATEGORY_LABELS: Record<string, string> = {
  weapons: 'Weapons',
  head: 'Helmets',
  armors: 'Armor',
  shoes: 'Shoes',
  offhands: 'Off-Hands',
  capes: 'Capes',
  bags: 'Bags',
  mounts: 'Mounts',
  tools: 'Tools',
  consumables: 'Consumables',
  resources: 'Resources',
  materials: 'Materials',
  furniture: 'Furniture',
  farming: 'Farming',
  accessories: 'Accessories',
  token: 'Tokens',
  cityresources: 'City Resources',
  artefacts: 'Artefacts',
  luxurygoods: 'Luxury Goods',
  trophies: 'Trophies',
}
