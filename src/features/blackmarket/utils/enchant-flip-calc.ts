// =============================================================================
// Enchant & Flip — calculation utilities
// Calculates profit from buying a .0 item, enchanting to .1, then selling on BM
// =============================================================================

import { MARKET_SALES_TAX } from '@/lib/utils/constants'
import {
  getEquipmentTypeFromItemId,
  getEnchantMaterialCount,
} from '@/features/enchanting/utils/enchanting-calc'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface EnchantFlipOpportunity {
  itemId: string         // base item ID (.0)
  itemName: string
  tier: number
  category: string
  buyCity: string

  // Costs
  basePrice: number      // price to buy .0 item in city
  basePriceDate: string
  runeItemId: string     // e.g. T4_RUNE
  runePrice: number      // price per rune
  runeCount: number      // number of runes needed
  runeTotalCost: number

  // Revenue
  bmPriceEnchanted: number  // BM buy price for .1 item
  bmPriceDateEnchanted: string
  salesTax: number
  totalCost: number
  netRevenue: number
  enchantFlipProfit: number

  // Comparison
  directFlipProfit: number   // profit from directly flipping .0 item (if applicable)
  profitDifference: number   // enchant flip profit - direct flip profit
}

// ---------------------------------------------------------------------------
// Non-premium sales tax rate
// ---------------------------------------------------------------------------
const NON_PREMIUM_SALES_TAX = 0.08

// ---------------------------------------------------------------------------
// Calculate enchant-flip profit
// ---------------------------------------------------------------------------
export function calculateEnchantFlipProfit(params: {
  basePrice: number
  runePrice: number
  runeCount: number
  bmPriceEnchanted: number
  isPremium: boolean
}): {
  runeTotalCost: number
  totalCost: number
  salesTax: number
  netRevenue: number
  enchantFlipProfit: number
} {
  const { basePrice, runePrice, runeCount, bmPriceEnchanted, isPremium } = params
  const taxRate = isPremium ? MARKET_SALES_TAX : NON_PREMIUM_SALES_TAX

  const runeTotalCost = runePrice * runeCount
  const totalCost = basePrice + runeTotalCost
  const salesTax = Math.round(bmPriceEnchanted * taxRate)
  const netRevenue = bmPriceEnchanted - salesTax
  const enchantFlipProfit = Math.round(netRevenue - totalCost)

  return {
    runeTotalCost,
    totalCost,
    salesTax,
    netRevenue,
    enchantFlipProfit,
  }
}

// ---------------------------------------------------------------------------
// Get rune count for an item ID
// ---------------------------------------------------------------------------
export function getRuneCountForItem(itemId: string): number {
  const eqType = getEquipmentTypeFromItemId(itemId)
  if (!eqType) return 192 // default fallback
  return getEnchantMaterialCount(eqType)
}
