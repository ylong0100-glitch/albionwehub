// =============================================================================
// Enchanting calculation utilities
// =============================================================================

import type { ItemTier, EnchantmentLevel } from '@/types'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type EnchantMaterialType = 'RUNE' | 'SOUL' | 'RELIC'

/** Item type categories that determine the base crafting material count */
export type EquipmentType =
  | '1h_weapon'
  | '2h_weapon'
  | 'helmet'
  | 'chest'
  | 'shoes'
  | 'offhand'
  | 'cape'
  | 'bag'

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
 * Base crafting material count per equipment type.
 * Enchantment material count = base crafting materials × 12.
 */
export const EQUIPMENT_TYPE_CRAFT_MATERIALS: Record<EquipmentType, number> = {
  '1h_weapon': 24,
  '2h_weapon': 32,
  helmet: 8,
  chest: 16,
  shoes: 8,
  offhand: 8,
  cape: 8,
  bag: 16,
}

/** Display labels for equipment types */
export const EQUIPMENT_TYPE_LABELS: Record<EquipmentType, string> = {
  '1h_weapon': '1H Weapon',
  '2h_weapon': '2H Weapon',
  helmet: 'Helmet',
  chest: 'Chest Armor',
  shoes: 'Shoes',
  offhand: 'Offhand',
  cape: 'Cape',
  bag: 'Bag',
}

/** All equipment types for iteration */
export const EQUIPMENT_TYPES: EquipmentType[] = [
  '1h_weapon',
  '2h_weapon',
  'helmet',
  'chest',
  'shoes',
  'offhand',
  'cape',
  'bag',
]

/** Multiplier to convert crafting materials to enchanting materials */
const ENCHANT_MATERIAL_MULTIPLIER = 12

/**
 * Material type required for each enchantment step.
 * .3 -> .4 is NOT possible via enchanting (must craft with .4 raw materials).
 */
const STEP_MATERIAL_TYPE: Record<string, EnchantMaterialType> = {
  '0-1': 'RUNE',
  '1-2': 'SOUL',
  '2-3': 'RELIC',
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
// Item type detection from item ID
// ---------------------------------------------------------------------------

/**
 * Determine the equipment type from an item ID string using heuristics.
 */
export function getEquipmentTypeFromItemId(itemId: string): EquipmentType | null {
  const id = itemId.toUpperCase()

  if (id.includes('_HEAD_') || id.includes('_HELMET_')) return 'helmet'
  if (id.includes('_ARMOR_')) return 'chest'
  if (id.includes('_SHOES_')) return 'shoes'
  if (id.includes('_CAPE')) return 'cape'
  if (id.includes('_BAG')) return 'bag'
  if (id.includes('_OFF_')) return 'offhand'
  if (id.includes('_2H_')) return '2h_weapon'
  if (id.includes('_MAIN_')) return '1h_weapon'

  return null
}

/**
 * Get the enchanting material count per step for an equipment type.
 * Formula: base crafting materials × 12
 */
export function getEnchantMaterialCount(equipmentType: EquipmentType): number {
  return EQUIPMENT_TYPE_CRAFT_MATERIALS[equipmentType] * ENCHANT_MATERIAL_MULTIPLIER
}

/**
 * Get the enchanting material count from an item ID.
 * Falls back to 192 (chest armor default) if type cannot be determined.
 */
export function getEnchantMaterialCountFromItemId(itemId: string): number {
  const eqType = getEquipmentTypeFromItemId(itemId)
  if (!eqType) return 192 // default fallback
  return getEnchantMaterialCount(eqType)
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
 * Get the enchantment steps needed from one level to another.
 * Note: .3 -> .4 is NOT possible via enchanting.
 * Max enchant target is .3.
 */
export function getEnchantSteps(
  tier: ItemTier,
  fromLevel: EnchantmentLevel,
  toLevel: EnchantmentLevel,
  equipmentType: EquipmentType,
): EnchantStep[] {
  if (fromLevel >= toLevel) return []
  if (tier < 4 || tier > 8) return []

  // Cap toLevel at 3 since .4 cannot be achieved via enchanting
  const effectiveToLevel = Math.min(toLevel, 3) as EnchantmentLevel

  const steps: EnchantStep[] = []
  const materialCount = getEnchantMaterialCount(equipmentType)

  for (let level = fromLevel; level < effectiveToLevel; level++) {
    const nextLevel = (level + 1) as EnchantmentLevel
    const key = `${level}-${nextLevel}`
    const materialType = STEP_MATERIAL_TYPE[key]
    if (!materialType) continue

    steps.push({
      fromLevel: level as EnchantmentLevel,
      toLevel: nextLevel,
      materialType,
      materialItemId: getMaterialItemId(tier, materialType),
      quantity: materialCount,
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
  equipmentType: EquipmentType,
): EnchantCostBreakdown {
  const steps = getEnchantSteps(tier, fromLevel, toLevel, equipmentType)

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
  equipmentType: EquipmentType,
): EnchantProfitResult {
  const costBreakdown = calculateEnchantCost(
    tier,
    fromLevel,
    toLevel,
    materialPrices,
    equipmentType,
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
