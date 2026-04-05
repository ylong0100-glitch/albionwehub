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
  buyPrice: number
  buyPriceDate: string
  sellPrice: number
  sellPriceDate: string
  setupFee: number
  salesTax: number
  netProfit: number
  profitMargin: number
  quality: number
}

// ---------------------------------------------------------------------------
// Non-premium sales tax rate (premium = 4%, non-premium = 8%)
// ---------------------------------------------------------------------------
const NON_PREMIUM_SALES_TAX = 0.08

// ---------------------------------------------------------------------------
// Calculate net profit for a flip
// ---------------------------------------------------------------------------
export function calculateFlipProfit(
  buyPrice: number,
  sellPrice: number,
  isPremium: boolean,
): {
  setupFee: number
  salesTax: number
  netProfit: number
  profitMargin: number
} {
  const taxRate = isPremium ? MARKET_SALES_TAX : NON_PREMIUM_SALES_TAX

  // Fees paid when buying (setup fee on buy order in city market)
  const setupFee = buyPrice * MARKET_SETUP_FEE

  // Tax paid when selling on Black Market
  const salesTax = sellPrice * taxRate

  // Net profit = sell revenue after tax - buy cost including setup fee
  const netProfit = (sellPrice - salesTax) - (buyPrice + setupFee)

  // Profit margin as percentage of buy cost
  const totalCost = buyPrice + setupFee
  const profitMargin = totalCost > 0 ? netProfit / totalCost : 0

  return {
    setupFee: Math.round(setupFee),
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
