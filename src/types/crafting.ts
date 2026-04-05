// =============================================================================
// Crafting & Refining type definitions
// =============================================================================

import type { ItemTier, EnchantmentLevel, QualityLevel } from './index'

// ---------------------------------------------------------------------------
// Recipe
// ---------------------------------------------------------------------------
export interface CraftingRecipe {
  /** Output item ID */
  itemId: string
  /** Number of items produced per craft */
  outputCount: number
  /** Crafting station type required */
  craftingStation: string
  /** Focus cost per craft (0 if focus not applicable) */
  focusCost: number
  /** Silver fee per craft */
  craftingFee: number
  /** Required crafting ingredients */
  ingredients: CraftingIngredient[]
  /** Tier of the recipe */
  tier: ItemTier
  /** Enchantment level */
  enchantment: EnchantmentLevel
}

export interface CraftingIngredient {
  itemId: string
  count: number
}

// ---------------------------------------------------------------------------
// Crafting calculator result
// ---------------------------------------------------------------------------
export interface CraftingCalculation {
  recipe: CraftingRecipe
  /** Number of crafts */
  craftCount: number
  /** Cost of each ingredient */
  ingredientCosts: IngredientCost[]
  /** Total material cost */
  totalMaterialCost: number
  /** Total crafting fee */
  totalCraftingFee: number
  /** Total cost (materials + fees) */
  totalCost: number
  /** Sell price of output */
  outputSellPrice: number
  /** Total revenue from selling output */
  totalRevenue: number
  /** Gross profit */
  grossProfit: number
  /** After market tax */
  netProfit: number
  netProfitPercent: number
  /** Profit per unit of focus used */
  profitPerFocus: number
  /** Return rate applied (e.g. 15.2% at focus) */
  returnRate: number
  /** Effective materials consumed after returns */
  effectiveMaterialCost: number
}

export interface IngredientCost {
  itemId: string
  count: number
  pricePerUnit: number
  totalCost: number
  city: string
}

// ---------------------------------------------------------------------------
// Refining
// ---------------------------------------------------------------------------
export interface RefiningRecipe {
  /** Output refined resource ID */
  outputItemId: string
  outputCount: number
  /** Raw resource input */
  rawResource: CraftingIngredient
  /** Lower-tier refined resource input (for T3+) */
  refinedResource: CraftingIngredient | null
  tier: ItemTier
  enchantment: EnchantmentLevel
  focusCost: number
}

export interface RefiningCalculation {
  recipe: RefiningRecipe
  craftCount: number
  rawResourceCost: number
  refinedResourceCost: number
  totalMaterialCost: number
  outputSellPrice: number
  totalRevenue: number
  grossProfit: number
  netProfit: number
  returnRate: number
  profitPerFocus: number
}

// ---------------------------------------------------------------------------
// Return rate
// ---------------------------------------------------------------------------
export interface ReturnRateConfig {
  /** Base return rate without focus (e.g. 0.152) */
  baseRate: number
  /** Return rate with focus (e.g. 0.432) */
  focusRate: number
  /** Whether user has premium */
  premium: boolean
  /** Spec level (0-100+) affecting return rate */
  specLevel: number
}

// ---------------------------------------------------------------------------
// Focus management
// ---------------------------------------------------------------------------
export interface FocusUsage {
  activity: 'crafting' | 'refining' | 'farming' | 'study'
  itemId: string
  focusPerAction: number
  actionsPerDay: number
  totalFocusPerDay: number
  profitPerFocus: number
}

export interface FocusBudget {
  /** Total daily focus available (10000 base + premium) */
  totalDaily: number
  /** Allocated activities */
  allocations: FocusUsage[]
  /** Remaining unallocated focus */
  remaining: number
  /** Total estimated daily profit */
  totalDailyProfit: number
}

// ---------------------------------------------------------------------------
// Build / Loadout
// ---------------------------------------------------------------------------
export interface BuildSlot {
  itemId: string | null
  quality: QualityLevel
  activeSpells: string[]
  passiveSpells: string[]
}

export interface Build {
  id: string
  name: string
  description: string
  mainHand: BuildSlot
  offHand: BuildSlot
  head: BuildSlot
  armor: BuildSlot
  shoes: BuildSlot
  cape: BuildSlot
  bag: BuildSlot
  mount: BuildSlot
  food: BuildSlot
  potion: BuildSlot
  tags: string[]
  /** Total item power estimate */
  estimatedIp: number
  /** Total cost to buy all items */
  estimatedCost: number
  createdAt: string
  updatedAt: string
}

// ---------------------------------------------------------------------------
// Island / Farming
// ---------------------------------------------------------------------------
export interface FarmPlot {
  plotIndex: number
  cropType: string | null
  /** Seed item ID */
  seedId: string | null
  /** Expected yield item ID */
  yieldId: string | null
  /** Growth time in seconds */
  growthTime: number
  /** Time planted (ISO string) */
  plantedAt: string | null
  /** Focus cost for watering */
  wateringFocusCost: number
}

export interface IslandLayout {
  id: string
  name: string
  plots: FarmPlot[]
  /** Total daily focus cost for watering */
  totalFocusCost: number
  /** Estimated daily profit */
  estimatedDailyProfit: number
}
