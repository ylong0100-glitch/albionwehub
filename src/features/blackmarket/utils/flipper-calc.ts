// =============================================================================
// Black Market Flipper — calculation utilities
// =============================================================================

import { MARKET_SETUP_FEE, MARKET_SALES_TAX } from '@/lib/utils/constants'
import type { FlipperState } from '@/lib/stores/flipper-store'

// ---------------------------------------------------------------------------
// Equipment categories the Black Market accepts
// ---------------------------------------------------------------------------
export const BM_CATEGORIES = [
  'weapons',
  'head',
  'armors',
  'shoes',
  'offhands',
  'capes',
  'bags',
] as const

export type BMCategory = (typeof BM_CATEGORIES)[number]

// ---------------------------------------------------------------------------
// Category display names
// ---------------------------------------------------------------------------
export const BM_CATEGORY_LABELS: Record<string, string> = {
  weapons: 'Weapons',
  head: 'Head',
  armors: 'Armor',
  shoes: 'Shoes',
  offhands: 'Offhands',
  capes: 'Capes',
  bags: 'Bags',
}

// ---------------------------------------------------------------------------
// Flip opportunity type
// ---------------------------------------------------------------------------
export interface FlipOpportunity {
  itemId: string
  itemName: string
  tier: number
  enchantment: number
  category: string
  buyCity: string
  buyPrice: number       // sell_price_min in buy city (instant buy from sell order)
  buyPriceDate: string
  buyQuality: number     // quality of item available to buy
  sellPrice: number      // buy_price_max on Black Market (BM buy order price)
  sellPriceDate: string
  sellQuality: number    // quality required by BM buy order
  salesTax: number
  netProfit: number
  profitMargin: number
}

// ---------------------------------------------------------------------------
// Non-premium sales tax rate (premium = 4%, non-premium = 8%)
// ---------------------------------------------------------------------------
const NON_PREMIUM_SALES_TAX = 0.08

// ---------------------------------------------------------------------------
// Calculate net profit for a flip
// ---------------------------------------------------------------------------
/**
 * Calculate net profit for a Black Market flip.
 *
 * Flow: Buy from city sell order (instant buy, NO fees for buyer)
 *       → Walk to Black Market → Sell to BM buy order (only sales tax)
 *
 * Net Profit = BM_buy_price × (1 - salesTax) - city_sell_price
 * No setup fee — you're buying from an existing sell order (instant purchase).
 */
export function calculateFlipProfit(
  buyPrice: number,
  sellPrice: number,
  isPremium: boolean,
): {
  salesTax: number
  netProfit: number
  profitMargin: number
} {
  const taxRate = isPremium ? MARKET_SALES_TAX : NON_PREMIUM_SALES_TAX

  // Tax paid when selling to Black Market buy order
  const salesTax = sellPrice * taxRate

  // Net profit = sell revenue after tax - buy cost (no fees on buying)
  const netProfit = (sellPrice - salesTax) - buyPrice

  // Profit margin as percentage of buy cost
  const profitMargin = buyPrice > 0 ? netProfit / buyPrice : 0

  return {
    salesTax: Math.round(salesTax),
    netProfit: Math.round(netProfit),
    profitMargin,
  }
}

// ---------------------------------------------------------------------------
// Check whether a date string represents "never updated" data
// ---------------------------------------------------------------------------
export function isStaleDate(dateStr: string): boolean {
  if (!dateStr) return true
  return dateStr.startsWith('0001-01-01')
}

// ---------------------------------------------------------------------------
// Calculate data age in hours from a date string
// ---------------------------------------------------------------------------
export function getDataAgeHours(dateStr: string): number {
  if (isStaleDate(dateStr)) return Infinity
  const date = new Date(dateStr)
  if (isNaN(date.getTime())) return Infinity
  return (Date.now() - date.getTime()) / (1000 * 60 * 60)
}

// ---------------------------------------------------------------------------
// Filter and sort flip opportunities based on store filters
// ---------------------------------------------------------------------------
export function filterAndSortFlips(
  opportunities: FlipOpportunity[],
  filters: Pick<FlipperState, 'minProfit' | 'categories' | 'minTier' | 'maxTier' | 'enchantmentLevels'>,
): FlipOpportunity[] {
  return opportunities
    .filter((flip) => {
      // Minimum profit threshold
      if (flip.netProfit < filters.minProfit) return false

      // Tier range
      if (flip.tier < filters.minTier || flip.tier > filters.maxTier) return false

      // Enchantment levels
      if (!filters.enchantmentLevels.includes(flip.enchantment)) return false

      // Categories
      if (filters.categories.length > 0 && !filters.categories.includes(flip.category)) {
        return false
      }

      return true
    })
    .sort((a, b) => b.netProfit - a.netProfit)
}
