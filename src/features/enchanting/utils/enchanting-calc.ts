// =============================================================================
// Enchanting calculation utilities
// =============================================================================

import type { ItemTier, EnchantmentLevel } from '@/types'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type EnchantMaterialType = 'RUNE' | 'SOUL' | 'RELIC'

export interface EnchantStep {
  fromLevel: EnchantmentLevel
  toLevel: EnchantmentLevel
  materialType: EnchantMaterialType
  materialItemId: string
  quantity: number
}

export interface EnchantCostBreakdown {
  steps: EnchantStepCost[]
  totalRuneCost: number
  totalSoulCost: number
  totalRelicCost: number
  totalCost: number
}

export interface EnchantStepCost {
  step: EnchantStep
  pricePerUnit: number
  totalCost: number
}

export interface EnchantProfitResult {
  tier: ItemTier
  fromLevel: EnchantmentLevel
  toLevel: EnchantmentLevel
  costBreakdown: EnchantCostBreakdown
  itemPriceBefore: number
  itemPriceAfter: number
  enchantCost: number
  profit: number
  profitPercent: number
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/**
 * Base enchanting materials per tier
 * T4: 48, T5: 60, T6: 72, T7: 84, T8: 96
 */
const BASE_MATERIAL_COUNT: Record<number, number> = {
  4: 48,
  5: 60,
  6: 72,
  7: 84,
  8: 96,
}

/**
 * Material type required for each enchantment step
 */
const STEP_MATERIAL_TYPE: Record<string, EnchantMaterialType> = {
  '0-1': 'RUNE',
  '1-2': 'SOUL',
  '2-3': 'RELIC',
  '3-4': 'RELIC',
}

export const ENCHANT_MATERIAL_INFO: Record<
  EnchantMaterialType,
  { label: string; color: string }
> = {
  RUNE: { label: 'Rune', color: 'text-blue-400' },
  SOUL: { label: 'Soul', color: 'text-purple-400' },
  RELIC: { label: 'Relic', color: 'text-amber-400' },
}

// ---------------------------------------------------------------------------
// Material calculation
// ---------------------------------------------------------------------------

/**
 * Get the material item ID for a given tier and material type
 */
export function getMaterialItemId(
  tier: ItemTier,
  materialType: EnchantMaterialType,
): string {
  return `T${tier}_${materialType}`
}

/**
 * Get the base material count for a tier
 */
export function getBaseMaterialCount(tier: ItemTier): number {
  return BASE_MATERIAL_COUNT[tier] ?? 48
}

/**
 * Get the enchantment steps needed from one level to another
 */
export function getEnchantSteps(
  tier: ItemTier,
  fromLevel: EnchantmentLevel,
  toLevel: EnchantmentLevel,
): EnchantStep[] {
  if (fromLevel >= toLevel) return []
  if (tier < 4 || tier > 8) return []

  const steps: EnchantStep[] = []
  const baseCount = getBaseMaterialCount(tier)

  for (let level = fromLevel; level < toLevel; level++) {
    const nextLevel = (level + 1) as EnchantmentLevel
    const key = `${level}-${nextLevel}`
    const materialType = STEP_MATERIAL_TYPE[key]
    if (!materialType) continue

    steps.push({
      fromLevel: level as EnchantmentLevel,
      toLevel: nextLevel,
      materialType,
      materialItemId: getMaterialItemId(tier, materialType),
      quantity: baseCount,
    })
  }

  return steps
}

/**
 * Get all unique material item IDs needed for enchanting at a given tier
 */
export function getEnchantMaterialIds(tier: ItemTier): string[] {
  const types: EnchantMaterialType[] = ['RUNE', 'SOUL', 'RELIC']
  return types.map((t) => getMaterialItemId(tier, t))
}

/**
 * Get all material item IDs for all tiers (T4-T8)
 */
export function getAllEnchantMaterialIds(): string[] {
  const ids: string[] = []
  for (let tier = 4; tier <= 8; tier++) {
    ids.push(...getEnchantMaterialIds(tier as ItemTier))
  }
  return ids
}

// ---------------------------------------------------------------------------
// Cost calculation
// ---------------------------------------------------------------------------

/**
 * Calculate the cost of enchanting with given prices
 */
export function calculateEnchantCost(
  tier: ItemTier,
  fromLevel: EnchantmentLevel,
  toLevel: EnchantmentLevel,
  prices: Record<string, number>,
): EnchantCostBreakdown {
  const steps = getEnchantSteps(tier, fromLevel, toLevel)

  let totalRuneCost = 0
  let totalSoulCost = 0
  let totalRelicCost = 0

  const stepCosts: EnchantStepCost[] = steps.map((step) => {
    const pricePerUnit = prices[step.materialItemId] ?? 0
    const totalCost = pricePerUnit * step.quantity

    switch (step.materialType) {
      case 'RUNE':
        totalRuneCost += totalCost
        break
      case 'SOUL':
        totalSoulCost += totalCost
        break
      case 'RELIC':
        totalRelicCost += totalCost
        break
    }

    return { step, pricePerUnit, totalCost }
  })

  return {
    steps: stepCosts,
    totalRuneCost,
    totalSoulCost,
    totalRelicCost,
    totalCost: totalRuneCost + totalSoulCost + totalRelicCost,
  }
}

// ---------------------------------------------------------------------------
// Profit calculation
// ---------------------------------------------------------------------------

/**
 * Build the item ID with enchantment level suffix
 * e.g., "T4_BAG" with enchantment 2 => "T4_BAG@2"
 */
export function getEnchantedItemId(
  baseItemId: string,
  enchantment: EnchantmentLevel,
): string {
  if (enchantment === 0) return baseItemId
  return `${baseItemId}@${enchantment}`
}

/**
 * Calculate enchanting profit
 */
export function calculateEnchantProfit(
  tier: ItemTier,
  fromLevel: EnchantmentLevel,
  toLevel: EnchantmentLevel,
  materialPrices: Record<string, number>,
  itemPriceBefore: number,
  itemPriceAfter: number,
): EnchantProfitResult {
  const costBreakdown = calculateEnchantCost(
    tier,
    fromLevel,
    toLevel,
    materialPrices,
  )

  const enchantCost = costBreakdown.totalCost
  const profit = itemPriceAfter - itemPriceBefore - enchantCost
  const totalInvestment = itemPriceBefore + enchantCost
  const profitPercent = totalInvestment > 0 ? (profit / totalInvestment) * 100 : 0

  return {
    tier,
    fromLevel,
    toLevel,
    costBreakdown,
    itemPriceBefore,
    itemPriceAfter,
    enchantCost,
    profit,
    profitPercent,
  }
}
