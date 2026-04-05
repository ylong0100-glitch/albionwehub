// =============================================================================
// Refining calculation utilities
// =============================================================================

import {
  BASE_RETURN_RATE,
  FOCUS_RETURN_RATE,
  RESOURCE_TIERS,
  CITY_RESOURCE_BONUSES,
  MARKET_SETUP_FEE,
  MARKET_SALES_TAX,
} from '@/lib/utils/constants'
import type { ItemTier } from '@/types'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type RefiningResourceType = 'ORE' | 'WOOD' | 'HIDE' | 'FIBER' | 'ROCK'

export interface RefiningRecipeData {
  tier: ItemTier
  rawItemId: string
  refinedInputItemId: string | null // null for T2
  outputItemId: string
  rawCount: number
  refinedInputCount: number
  focusCost: number
}

export interface RefiningResult {
  tier: ItemTier
  rawItemId: string
  refinedInputItemId: string | null
  outputItemId: string
  rawCount: number
  refinedInputCount: number
  rawPrice: number
  refinedInputPrice: number
  outputPrice: number
  materialCost: number
  effectiveMaterialCost: number
  revenue: number
  profit: number
  profitPercent: number
  profitPerFocus: number
  returnRate: number
  focusCost: number
}

// ---------------------------------------------------------------------------
// Resource type metadata
// ---------------------------------------------------------------------------

export const RESOURCE_TYPE_INFO: Record<
  RefiningResourceType,
  { label: string; raw: string; refined: string; icon: string; cityBonus: string }
> = {
  ORE: {
    label: 'Ore',
    raw: 'ORE',
    refined: 'METALBAR',
    icon: 'T4_ORE',
    cityBonus: 'Fort Sterling',
  },
  WOOD: {
    label: 'Wood',
    raw: 'WOOD',
    refined: 'PLANKS',
    icon: 'T4_WOOD',
    cityBonus: 'Lymhurst',
  },
  HIDE: {
    label: 'Hide',
    raw: 'HIDE',
    refined: 'LEATHER',
    icon: 'T4_HIDE',
    cityBonus: 'Bridgewatch',
  },
  FIBER: {
    label: 'Fiber',
    raw: 'FIBER',
    refined: 'CLOTH',
    icon: 'T4_FIBER',
    cityBonus: 'Thetford',
  },
  ROCK: {
    label: 'Rock',
    raw: 'ROCK',
    refined: 'STONEBLOCK',
    icon: 'T4_ROCK',
    cityBonus: 'Fort Sterling',
  },
}

// Focus cost per tier for refining
const FOCUS_COSTS: Record<number, number> = {
  2: 9,
  3: 18,
  4: 45,
  5: 90,
  6: 180,
  7: 360,
  8: 720,
}

// ---------------------------------------------------------------------------
// Recipe generation
// ---------------------------------------------------------------------------

export function getRefiningRecipes(
  resourceType: RefiningResourceType,
): RefiningRecipeData[] {
  const info = RESOURCE_TIERS[resourceType]
  if (!info) return []

  const recipes: RefiningRecipeData[] = []

  for (let tier = 2; tier <= 8; tier++) {
    const t = tier as ItemTier
    const rawItemId = `T${tier}_${info.raw}`
    const outputItemId = `T${tier}_${info.refined}`
    const refinedInputItemId =
      tier > 2 ? `T${tier - 1}_${info.refined}` : null

    recipes.push({
      tier: t,
      rawItemId,
      refinedInputItemId,
      outputItemId,
      rawCount: 1,
      refinedInputCount: tier > 2 ? 1 : 0,
      focusCost: FOCUS_COSTS[tier] ?? 0,
    })
  }

  return recipes
}

// ---------------------------------------------------------------------------
// Return rate calculation
// ---------------------------------------------------------------------------

export function getReturnRate(
  useFocus: boolean,
  city: string,
  resourceType: RefiningResourceType,
): number {
  const baseRate = useFocus ? FOCUS_RETURN_RATE : BASE_RETURN_RATE

  // City bonus: +36.7% of the base rate (multiplicative)
  const cityBonuses = CITY_RESOURCE_BONUSES[city]
  const info = RESOURCE_TIERS[resourceType]
  if (!info) return baseRate

  const hasCityBonus =
    cityBonuses?.includes(info.raw) || cityBonuses?.includes(info.refined)

  if (hasCityBonus) {
    // City bonus adds a flat resource return rate bonus
    return Math.min(baseRate + 0.367, 0.7)
  }

  return baseRate
}

// ---------------------------------------------------------------------------
// Profit calculation
// ---------------------------------------------------------------------------

export function calculateRefining(
  recipe: RefiningRecipeData,
  prices: Record<string, number>,
  returnRate: number,
  quantity: number = 1,
): RefiningResult {
  const rawPrice = prices[recipe.rawItemId] ?? 0
  const refinedInputPrice = recipe.refinedInputItemId
    ? (prices[recipe.refinedInputItemId] ?? 0)
    : 0
  const outputPrice = prices[recipe.outputItemId] ?? 0

  // Material cost per single refine
  const materialCost =
    rawPrice * recipe.rawCount + refinedInputPrice * recipe.refinedInputCount

  // Effective cost accounting for return rate
  // Return rate means you get back some materials, reducing effective cost
  const effectiveMaterialCost = materialCost * (1 - returnRate)

  // Revenue per refine (after market fees)
  const marketFees = MARKET_SETUP_FEE + MARKET_SALES_TAX
  const revenue = outputPrice * (1 - marketFees)

  const profit = revenue - effectiveMaterialCost
  const profitPercent =
    effectiveMaterialCost > 0 ? (profit / effectiveMaterialCost) * 100 : 0

  const profitPerFocus =
    recipe.focusCost > 0 ? profit / recipe.focusCost : 0

  return {
    tier: recipe.tier,
    rawItemId: recipe.rawItemId,
    refinedInputItemId: recipe.refinedInputItemId,
    outputItemId: recipe.outputItemId,
    rawCount: recipe.rawCount,
    refinedInputCount: recipe.refinedInputCount,
    rawPrice,
    refinedInputPrice,
    outputPrice,
    materialCost: materialCost * quantity,
    effectiveMaterialCost: effectiveMaterialCost * quantity,
    revenue: revenue * quantity,
    profit: profit * quantity,
    profitPercent,
    profitPerFocus,
    returnRate,
    focusCost: recipe.focusCost,
  }
}

// ---------------------------------------------------------------------------
// Get all item IDs needed for a resource type
// ---------------------------------------------------------------------------

export function getItemIdsForResourceType(
  resourceType: RefiningResourceType,
): string[] {
  const info = RESOURCE_TIERS[resourceType]
  if (!info) return []

  const ids: string[] = []
  for (let tier = 2; tier <= 8; tier++) {
    ids.push(`T${tier}_${info.raw}`)
    ids.push(`T${tier}_${info.refined}`)
  }
  // Also need T1 refined for T2 recipe input? No, T2 only needs raw.
  // But we need all refined for prev-tier inputs
  return ids
}

// ---------------------------------------------------------------------------
// Find best refining opportunity
// ---------------------------------------------------------------------------

export function findBestRefining(results: RefiningResult[]): number {
  let bestIdx = -1
  let bestProfit = -Infinity
  for (let i = 0; i < results.length; i++) {
    if (results[i].profit > bestProfit) {
      bestProfit = results[i].profit
      bestIdx = i
    }
  }
  return bestIdx
}
