// =============================================================================
// Crafting Calculator Utilities
// Hardcoded recipe database + calculation functions
// =============================================================================

import {
  BASE_RETURN_RATE,
  FOCUS_RETURN_RATE,
  CITY_RESOURCE_BONUSES,
  MARKET_SETUP_FEE,
  MARKET_SALES_TAX,
} from '@/lib/utils/constants'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
export interface Recipe {
  itemId: string
  name: string
  tier: number
  materials: Array<{ itemId: string; quantity: number }>
  craftingFocus: number
  craftingStation: string
  category: RecipeCategory
}

export type RecipeCategory =
  | 'accessories'
  | 'cloth_armor'
  | 'leather_armor'
  | 'plate_armor'
  | 'weapons'
  | 'consumables'

export const CATEGORY_LABELS: Record<RecipeCategory, string> = {
  accessories: 'Accessories',
  cloth_armor: 'Cloth Armor',
  leather_armor: 'Leather Armor',
  plate_armor: 'Plate Armor',
  weapons: 'Weapons',
  consumables: 'Consumables',
}

export interface MaterialBreakdown {
  itemId: string
  name: string
  baseQuantity: number
  adjustedQuantity: number
  unitPrice: number
  totalPrice: number
}

export interface CraftingResult {
  revenue: number
  materialCost: number
  taxCost: number
  focusCost: number
  profit: number
  profitMargin: number
  profitPerFocus: number
  returnRate: number
  materialsNeeded: MaterialBreakdown[]
}

// ---------------------------------------------------------------------------
// Human-readable material names
// ---------------------------------------------------------------------------
const MATERIAL_NAMES: Record<string, string> = {
  T4_LEATHER: "Adept's Worked Leather",
  T5_LEATHER: "Expert's Worked Leather",
  T6_LEATHER: "Master's Worked Leather",
  T7_LEATHER: "Grandmaster's Worked Leather",
  T8_LEATHER: "Elder's Worked Leather",
  T4_CLOTH: "Adept's Cloth",
  T5_CLOTH: "Expert's Cloth",
  T6_CLOTH: "Master's Cloth",
  T7_CLOTH: "Grandmaster's Cloth",
  T8_CLOTH: "Elder's Cloth",
  T4_METALBAR: "Adept's Metal Bar",
  T5_METALBAR: "Expert's Metal Bar",
  T6_METALBAR: "Master's Metal Bar",
  T7_METALBAR: "Grandmaster's Metal Bar",
  T8_METALBAR: "Elder's Metal Bar",
  T4_PLANKS: "Adept's Planks",
  T5_PLANKS: "Expert's Planks",
  T6_PLANKS: "Master's Planks",
  T7_PLANKS: "Grandmaster's Planks",
  T8_PLANKS: "Elder's Planks",
  T4_STONEBLOCK: "Adept's Stone Block",
  T5_STONEBLOCK: "Expert's Stone Block",
  T6_STONEBLOCK: "Master's Stone Block",
}

// ---------------------------------------------------------------------------
// Hardcoded Recipe Database (20+ items)
// ---------------------------------------------------------------------------
export const RECIPES: Record<string, Recipe> = {
  // ---- Accessories (Bags) ----
  T4_BAG: {
    itemId: 'T4_BAG',
    name: "Adept's Bag",
    tier: 4,
    materials: [{ itemId: 'T4_LEATHER', quantity: 8 }],
    craftingFocus: 48,
    craftingStation: 'Saddler',
    category: 'accessories',
  },
  T5_BAG: {
    itemId: 'T5_BAG',
    name: "Expert's Bag",
    tier: 5,
    materials: [{ itemId: 'T5_LEATHER', quantity: 16 }],
    craftingFocus: 120,
    craftingStation: 'Saddler',
    category: 'accessories',
  },
  T6_BAG: {
    itemId: 'T6_BAG',
    name: "Master's Bag",
    tier: 6,
    materials: [{ itemId: 'T6_LEATHER', quantity: 32 }],
    craftingFocus: 240,
    craftingStation: 'Saddler',
    category: 'accessories',
  },
  T7_BAG: {
    itemId: 'T7_BAG',
    name: "Grandmaster's Bag",
    tier: 7,
    materials: [{ itemId: 'T7_LEATHER', quantity: 64 }],
    craftingFocus: 480,
    craftingStation: 'Saddler',
    category: 'accessories',
  },
  // ---- Accessories (Capes) ----
  T4_CAPE: {
    itemId: 'T4_CAPE',
    name: "Adept's Cape",
    tier: 4,
    materials: [{ itemId: 'T4_CLOTH', quantity: 4 }, { itemId: 'T4_LEATHER', quantity: 4 }],
    craftingFocus: 48,
    craftingStation: "Mage's Tower",
    category: 'accessories',
  },
  T5_CAPE: {
    itemId: 'T5_CAPE',
    name: "Expert's Cape",
    tier: 5,
    materials: [{ itemId: 'T5_CLOTH', quantity: 8 }, { itemId: 'T5_LEATHER', quantity: 8 }],
    craftingFocus: 120,
    craftingStation: "Mage's Tower",
    category: 'accessories',
  },
  T6_CAPE: {
    itemId: 'T6_CAPE',
    name: "Master's Cape",
    tier: 6,
    materials: [{ itemId: 'T6_CLOTH', quantity: 16 }, { itemId: 'T6_LEATHER', quantity: 16 }],
    craftingFocus: 240,
    craftingStation: "Mage's Tower",
    category: 'accessories',
  },

  // ---- Cloth Armor ----
  T4_HEAD_CLOTH_SET1: {
    itemId: 'T4_HEAD_CLOTH_SET1',
    name: "Adept's Scholar Cowl",
    tier: 4,
    materials: [{ itemId: 'T4_CLOTH', quantity: 8 }, { itemId: 'T4_METALBAR', quantity: 4 }],
    craftingFocus: 48,
    craftingStation: "Mage's Tower",
    category: 'cloth_armor',
  },
  T4_ARMOR_CLOTH_SET1: {
    itemId: 'T4_ARMOR_CLOTH_SET1',
    name: "Adept's Scholar Robe",
    tier: 4,
    materials: [{ itemId: 'T4_CLOTH', quantity: 16 }, { itemId: 'T4_METALBAR', quantity: 8 }],
    craftingFocus: 96,
    craftingStation: "Mage's Tower",
    category: 'cloth_armor',
  },
  T4_SHOES_CLOTH_SET1: {
    itemId: 'T4_SHOES_CLOTH_SET1',
    name: "Adept's Scholar Sandals",
    tier: 4,
    materials: [{ itemId: 'T4_CLOTH', quantity: 8 }, { itemId: 'T4_METALBAR', quantity: 4 }],
    craftingFocus: 48,
    craftingStation: "Mage's Tower",
    category: 'cloth_armor',
  },
  T5_HEAD_CLOTH_SET1: {
    itemId: 'T5_HEAD_CLOTH_SET1',
    name: "Expert's Scholar Cowl",
    tier: 5,
    materials: [{ itemId: 'T5_CLOTH', quantity: 16 }, { itemId: 'T5_METALBAR', quantity: 8 }],
    craftingFocus: 120,
    craftingStation: "Mage's Tower",
    category: 'cloth_armor',
  },
  T5_ARMOR_CLOTH_SET1: {
    itemId: 'T5_ARMOR_CLOTH_SET1',
    name: "Expert's Scholar Robe",
    tier: 5,
    materials: [{ itemId: 'T5_CLOTH', quantity: 32 }, { itemId: 'T5_METALBAR', quantity: 16 }],
    craftingFocus: 240,
    craftingStation: "Mage's Tower",
    category: 'cloth_armor',
  },

  // ---- Leather Armor ----
  T4_HEAD_LEATHER_SET1: {
    itemId: 'T4_HEAD_LEATHER_SET1',
    name: "Adept's Mercenary Hood",
    tier: 4,
    materials: [{ itemId: 'T4_LEATHER', quantity: 8 }, { itemId: 'T4_METALBAR', quantity: 4 }],
    craftingFocus: 48,
    craftingStation: "Hunter's Lodge",
    category: 'leather_armor',
  },
  T4_ARMOR_LEATHER_SET1: {
    itemId: 'T4_ARMOR_LEATHER_SET1',
    name: "Adept's Mercenary Jacket",
    tier: 4,
    materials: [{ itemId: 'T4_LEATHER', quantity: 16 }, { itemId: 'T4_METALBAR', quantity: 8 }],
    craftingFocus: 96,
    craftingStation: "Hunter's Lodge",
    category: 'leather_armor',
  },
  T4_SHOES_LEATHER_SET1: {
    itemId: 'T4_SHOES_LEATHER_SET1',
    name: "Adept's Mercenary Shoes",
    tier: 4,
    materials: [{ itemId: 'T4_LEATHER', quantity: 8 }, { itemId: 'T4_METALBAR', quantity: 4 }],
    craftingFocus: 48,
    craftingStation: "Hunter's Lodge",
    category: 'leather_armor',
  },

  // ---- Plate Armor ----
  T4_HEAD_PLATE_SET1: {
    itemId: 'T4_HEAD_PLATE_SET1',
    name: "Adept's Soldier Helmet",
    tier: 4,
    materials: [{ itemId: 'T4_METALBAR', quantity: 8 }, { itemId: 'T4_LEATHER', quantity: 4 }],
    craftingFocus: 48,
    craftingStation: "Warrior's Forge",
    category: 'plate_armor',
  },
  T4_ARMOR_PLATE_SET1: {
    itemId: 'T4_ARMOR_PLATE_SET1',
    name: "Adept's Soldier Armor",
    tier: 4,
    materials: [{ itemId: 'T4_METALBAR', quantity: 16 }, { itemId: 'T4_LEATHER', quantity: 8 }],
    craftingFocus: 96,
    craftingStation: "Warrior's Forge",
    category: 'plate_armor',
  },
  T4_SHOES_PLATE_SET1: {
    itemId: 'T4_SHOES_PLATE_SET1',
    name: "Adept's Soldier Boots",
    tier: 4,
    materials: [{ itemId: 'T4_METALBAR', quantity: 8 }, { itemId: 'T4_LEATHER', quantity: 4 }],
    craftingFocus: 48,
    craftingStation: "Warrior's Forge",
    category: 'plate_armor',
  },

  // ---- Weapons ----
  T4_MAIN_SWORD: {
    itemId: 'T4_MAIN_SWORD',
    name: "Adept's Broadsword",
    tier: 4,
    materials: [{ itemId: 'T4_METALBAR', quantity: 12 }, { itemId: 'T4_LEATHER', quantity: 4 }],
    craftingFocus: 48,
    craftingStation: "Warrior's Forge",
    category: 'weapons',
  },
  T5_MAIN_SWORD: {
    itemId: 'T5_MAIN_SWORD',
    name: "Expert's Broadsword",
    tier: 5,
    materials: [{ itemId: 'T5_METALBAR', quantity: 24 }, { itemId: 'T5_LEATHER', quantity: 8 }],
    craftingFocus: 120,
    craftingStation: "Warrior's Forge",
    category: 'weapons',
  },
  T4_MAIN_FIRESTAFF: {
    itemId: 'T4_MAIN_FIRESTAFF',
    name: "Adept's Fire Staff",
    tier: 4,
    materials: [{ itemId: 'T4_PLANKS', quantity: 12 }, { itemId: 'T4_METALBAR', quantity: 4 }],
    craftingFocus: 48,
    craftingStation: "Mage's Tower",
    category: 'weapons',
  },
  T4_2H_BOW: {
    itemId: 'T4_2H_BOW',
    name: "Adept's Bow",
    tier: 4,
    materials: [{ itemId: 'T4_PLANKS', quantity: 16 }, { itemId: 'T4_LEATHER', quantity: 8 }],
    craftingFocus: 96,
    craftingStation: "Hunter's Lodge",
    category: 'weapons',
  },
  T5_2H_BOW: {
    itemId: 'T5_2H_BOW',
    name: "Expert's Bow",
    tier: 5,
    materials: [{ itemId: 'T5_PLANKS', quantity: 32 }, { itemId: 'T5_LEATHER', quantity: 16 }],
    craftingFocus: 240,
    craftingStation: "Hunter's Lodge",
    category: 'weapons',
  },

  // ---- Consumables (Potions) ----
  T4_POTION_HEAL: {
    itemId: 'T4_POTION_HEAL',
    name: "Adept's Healing Potion",
    tier: 4,
    materials: [{ itemId: 'T4_CLOTH', quantity: 2 }],
    craftingFocus: 12,
    craftingStation: 'Alchemist',
    category: 'consumables',
  },
  T5_POTION_HEAL: {
    itemId: 'T5_POTION_HEAL',
    name: "Expert's Healing Potion",
    tier: 5,
    materials: [{ itemId: 'T5_CLOTH', quantity: 4 }],
    craftingFocus: 30,
    craftingStation: 'Alchemist',
    category: 'consumables',
  },
  T4_POTION_ENERGY: {
    itemId: 'T4_POTION_ENERGY',
    name: "Adept's Energy Potion",
    tier: 4,
    materials: [{ itemId: 'T4_CLOTH', quantity: 2 }],
    craftingFocus: 12,
    craftingStation: 'Alchemist',
    category: 'consumables',
  },
}

// ---------------------------------------------------------------------------
// Get all recipe IDs needed for price lookup (materials + products)
// ---------------------------------------------------------------------------
export function getAllItemIdsForRecipe(recipe: Recipe): string[] {
  const ids = new Set<string>()
  ids.add(recipe.itemId)
  for (const mat of recipe.materials) {
    ids.add(mat.itemId)
  }
  return Array.from(ids)
}

// ---------------------------------------------------------------------------
// Get recipes grouped by category
// ---------------------------------------------------------------------------
export function getRecipesByCategory(): Record<RecipeCategory, Recipe[]> {
  const grouped: Record<RecipeCategory, Recipe[]> = {
    accessories: [],
    cloth_armor: [],
    leather_armor: [],
    plate_armor: [],
    weapons: [],
    consumables: [],
  }
  for (const recipe of Object.values(RECIPES)) {
    grouped[recipe.category].push(recipe)
  }
  return grouped
}

// ---------------------------------------------------------------------------
// Determine if a city gives bonus for a given recipe's materials
// ---------------------------------------------------------------------------
function hasCityBonus(city: string, recipe: Recipe): boolean {
  const bonusResources = CITY_RESOURCE_BONUSES[city]
  if (!bonusResources || bonusResources.length === 0) return false

  // Check if any material matches the city's bonus resources
  return recipe.materials.some((mat) => {
    const resourceType = mat.itemId.replace(/^T\d_/, '') // e.g. "LEATHER", "CLOTH"
    return bonusResources.includes(resourceType)
  })
}

// ---------------------------------------------------------------------------
// Calculate return rate based on city, focus, and recipe
// ---------------------------------------------------------------------------
export function calculateReturnRate(
  city: string,
  useFocus: boolean,
  recipe: Recipe,
): number {
  const baseRate = useFocus ? FOCUS_RETURN_RATE : BASE_RETURN_RATE
  const cityBonus = hasCityBonus(city, recipe) ? 0.15 : 0
  // Cap at reasonable maximum (never > 70%)
  return Math.min(baseRate + cityBonus, 0.7)
}

// ---------------------------------------------------------------------------
// Calculate material cost with return rate adjustment
// ---------------------------------------------------------------------------
export function calculateMaterialCost(
  recipe: Recipe,
  quantity: number,
  returnRate: number,
  materialPrices: Record<string, number>,
): { materials: MaterialBreakdown[]; totalCost: number } {
  const materials: MaterialBreakdown[] = []
  let totalCost = 0

  for (const mat of recipe.materials) {
    const baseQty = mat.quantity * quantity
    // Actual materials needed = base * (1 - returnRate)
    // This represents the net consumption after resources are returned
    const adjustedQty = Math.ceil(baseQty * (1 - returnRate))
    const unitPrice = materialPrices[mat.itemId] ?? 0
    const total = adjustedQty * unitPrice

    materials.push({
      itemId: mat.itemId,
      name: MATERIAL_NAMES[mat.itemId] ?? mat.itemId,
      baseQuantity: baseQty,
      adjustedQuantity: adjustedQty,
      unitPrice,
      totalPrice: total,
    })

    totalCost += total
  }

  return { materials, totalCost }
}

// ---------------------------------------------------------------------------
// Calculate full crafting profit
// ---------------------------------------------------------------------------
export function calculateProfit(
  recipe: Recipe,
  quantity: number,
  options: {
    city: string
    useFocus: boolean
    productPrice: number
    materialPrices: Record<string, number>
    taxRate?: number
  },
): CraftingResult {
  const returnRate = calculateReturnRate(options.city, options.useFocus, recipe)

  const { materials, totalCost } = calculateMaterialCost(
    recipe,
    quantity,
    returnRate,
    options.materialPrices,
  )

  const revenue = options.productPrice * quantity

  // Market taxes when selling
  const marketTax = revenue * (MARKET_SETUP_FEE + MARKET_SALES_TAX)

  // Crafting station tax (simplified: assume a flat rate based on tier)
  const stationTax = (options.taxRate ?? 0) * quantity

  const taxCost = marketTax + stationTax

  // Focus cost in silver (opportunity cost) - we track focus units used, not silver
  const focusCost = options.useFocus ? recipe.craftingFocus * quantity : 0

  const profit = revenue - totalCost - taxCost

  const profitMargin = revenue > 0 ? (profit / revenue) * 100 : 0

  const profitPerFocus = focusCost > 0 ? profit / focusCost : 0

  return {
    revenue,
    materialCost: totalCost,
    taxCost,
    focusCost,
    profit,
    profitMargin,
    profitPerFocus,
    returnRate,
    materialsNeeded: materials,
  }
}

// ---------------------------------------------------------------------------
// Format silver amount
// ---------------------------------------------------------------------------
export function formatSilver(amount: number): string {
  if (Math.abs(amount) >= 1_000_000) {
    return `${(amount / 1_000_000).toFixed(2)}M`
  }
  if (Math.abs(amount) >= 1_000) {
    return `${(amount / 1_000).toFixed(1)}K`
  }
  return amount.toLocaleString('en-US')
}

// ---------------------------------------------------------------------------
// Get material name helper
// ---------------------------------------------------------------------------
export function getMaterialName(itemId: string): string {
  return MATERIAL_NAMES[itemId] ?? itemId
}

// ---------------------------------------------------------------------------
// Bridge: Build a Recipe from game-data-store's ProcessedRecipe
// ---------------------------------------------------------------------------
import type { ProcessedItem, ProcessedRecipe } from '@/types/game-data'

/**
 * Convert a ProcessedRecipe + ProcessedItem from the game data store into
 * the Recipe format used by the crafting calculator.
 */
export function recipeFromGameData(
  processedRecipe: ProcessedRecipe,
  processedItem: ProcessedItem,
): Recipe {
  // Map shop category to our RecipeCategory type
  const categoryMap: Record<string, RecipeCategory> = {
    weapons: 'weapons',
    offhand: 'weapons',
    armor: 'cloth_armor', // will be refined below
    accessories: 'accessories',
    consumables: 'consumables',
    tools: 'accessories',
    mounts: 'accessories',
  }

  let category: RecipeCategory = categoryMap[processedItem.category] ?? 'accessories'

  // Refine armor category based on subcategory
  if (processedItem.category === 'armor') {
    const sub = processedItem.subcategory.toLowerCase()
    if (sub.includes('plate')) category = 'plate_armor'
    else if (sub.includes('leather')) category = 'leather_armor'
    else if (sub.includes('cloth')) category = 'cloth_armor'
  }

  return {
    itemId: processedItem.id,
    name: processedItem.name,
    tier: processedItem.tier,
    materials: processedRecipe.materials.map((m) => ({
      itemId: m.itemId,
      quantity: m.count,
    })),
    craftingFocus: processedRecipe.craftingFocus,
    craftingStation: '', // not available in game data dump
    category,
  }
}
