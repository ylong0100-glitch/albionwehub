// =============================================================================
// Item ID parser utilities
// Parses Albion Online item IDs like "T4_BAG@1", "T8_MAIN_ARCANESTAFF@3"
// =============================================================================

import type { ItemTier, EnchantmentLevel, ItemCategory } from '@/types'

// ---------------------------------------------------------------------------
// Tier parsing
// ---------------------------------------------------------------------------

/**
 * Extract the tier number from an item ID.
 * "T4_BAG" -> 4, "T8_MAIN_ARCANESTAFF@3" -> 8
 * Returns null if no tier prefix found.
 */
export function parseTier(itemId: string): ItemTier | null {
  const match = itemId.match(/^T(\d)_/)
  if (!match) return null
  const tier = parseInt(match[1], 10) as ItemTier
  if (tier < 1 || tier > 8) return null
  return tier
}

/**
 * Extract the enchantment level from an item ID.
 * "T4_BAG@1" -> 1, "T4_BAG" -> 0
 */
export function parseEnchantment(itemId: string): EnchantmentLevel {
  const match = itemId.match(/@(\d)$/)
  if (!match) return 0
  const level = parseInt(match[1], 10)
  if (level < 0 || level > 4) return 0
  return level as EnchantmentLevel
}

/**
 * Get the base item ID without tier prefix and enchantment suffix.
 * "T4_BAG@1" -> "BAG", "T8_MAIN_ARCANESTAFF@3" -> "MAIN_ARCANESTAFF"
 */
export function getBaseId(itemId: string): string {
  return itemId
    .replace(/^T\d_/, '')
    .replace(/@\d$/, '')
}

/**
 * Get the full item ID with a specific enchantment level.
 * ("T4_BAG", 2) -> "T4_BAG@2"
 * ("T4_BAG@1", 3) -> "T4_BAG@3"
 */
export function withEnchantment(itemId: string, enchantment: EnchantmentLevel): string {
  const base = itemId.replace(/@\d$/, '')
  if (enchantment === 0) return base
  return `${base}@${enchantment}`
}

/**
 * Get the full item ID with a specific tier.
 * ("T4_BAG@1", 6) -> "T6_BAG@1"
 */
export function withTier(itemId: string, tier: ItemTier): string {
  return itemId.replace(/^T\d_/, `T${tier}_`)
}

/**
 * Calculate effective tier (tier + enchantment).
 * T4@0 -> 4.0, T4@3 -> 7.0
 */
export function getEffectiveTier(itemId: string): number {
  const tier = parseTier(itemId) ?? 0
  const enchant = parseEnchantment(itemId)
  return tier + enchant
}

// ---------------------------------------------------------------------------
// Category detection
// ---------------------------------------------------------------------------

const WEAPON_PATTERNS = [
  'MAIN_', 'OFF_', '2H_',
  'SWORD', 'AXE', 'MACE', 'HAMMER', 'CROSSBOW', 'BOW', 'SPEAR',
  'DAGGER', 'QUARTERSTAFF', 'STAFF', 'TORCH', 'SHIELD', 'BOOK',
  'ORB', 'TOTEM', 'KNUCKLES', 'SHAPESHIFTER',
  'NATURE', 'HOLY', 'FIRE', 'FROST', 'ARCANE', 'CURSED',
]

const ARMOR_PATTERNS = [
  'HEAD_', 'ARMOR_', 'SHOES_',
  'CLOTH_', 'LEATHER_', 'PLATE_',
]

const ACCESSORY_PATTERNS = ['CAPE', 'BAG']

const CONSUMABLE_PATTERNS = [
  'MEAL_', 'POTION_', 'FISH_',
  'FOOD_', 'ALCHEMY_',
]

const MATERIAL_PATTERNS = [
  'METALBAR', 'PLANKS', 'LEATHER', 'CLOTH', 'STONEBLOCK',
  'ARTEFACT_', 'RUNE_', 'SOUL_', 'RELIC_', 'SHARD_',
  'JOURNAL_', 'ESSENCE_',
]

const RESOURCE_PATTERNS = [
  'ORE', 'WOOD', 'HIDE', 'FIBER', 'ROCK',
  'WOOD_LOG', 'STONEBLOCK',
]

const MOUNT_PATTERNS = ['MOUNT_', 'HORSE', 'OX', 'DIREWOLF', 'MAMMOTH', 'BEAR']

const FARMABLE_PATTERNS = [
  'SEED_', 'FARM_', 'HERB_', 'CROP_',
  'BABY_', 'GROWN_',
]

const FURNITURE_PATTERNS = ['FURNITURE_', 'TROPHY_', 'DECORATION_']

/**
 * Determine the item category from its ID.
 */
export function getItemCategory(itemId: string): ItemCategory {
  const upper = itemId.toUpperCase()

  // Remove tier prefix for pattern matching
  const withoutTier = upper.replace(/^T\d_/, '').replace(/@\d$/, '')

  if (WEAPON_PATTERNS.some((p) => withoutTier.startsWith(p) || withoutTier.includes(p))) {
    // Distinguish weapons from off-hand accessories
    if (withoutTier.startsWith('OFF_') && (withoutTier.includes('SHIELD') || withoutTier.includes('BOOK') || withoutTier.includes('ORB') || withoutTier.includes('TOTEM') || withoutTier.includes('TORCH'))) {
      return 'weapon'
    }
    return 'weapon'
  }

  if (ARMOR_PATTERNS.some((p) => withoutTier.startsWith(p) || withoutTier.includes(p))) {
    return 'armor'
  }

  if (ACCESSORY_PATTERNS.some((p) => withoutTier.startsWith(p) || withoutTier.includes(p))) {
    return 'accessory'
  }

  if (MOUNT_PATTERNS.some((p) => withoutTier.startsWith(p) || withoutTier.includes(p))) {
    return 'mount'
  }

  if (CONSUMABLE_PATTERNS.some((p) => withoutTier.startsWith(p) || withoutTier.includes(p))) {
    return 'consumable'
  }

  if (MATERIAL_PATTERNS.some((p) => withoutTier.startsWith(p) || withoutTier.includes(p))) {
    return 'material'
  }

  if (RESOURCE_PATTERNS.some((p) => withoutTier.startsWith(p) || withoutTier.includes(p))) {
    return 'resource'
  }

  if (FARMABLE_PATTERNS.some((p) => withoutTier.startsWith(p) || withoutTier.includes(p))) {
    return 'farmable'
  }

  if (FURNITURE_PATTERNS.some((p) => withoutTier.startsWith(p) || withoutTier.includes(p))) {
    return 'furniture'
  }

  if (withoutTier.includes('LABORER')) {
    return 'laborer'
  }

  if (withoutTier.includes('TOKEN') || withoutTier.includes('QUESTITEM') || withoutTier.includes('UNIQUE')) {
    return 'token'
  }

  return 'other'
}

/**
 * Parse a full item ID into its components.
 */
export function parseItemId(itemId: string): {
  tier: ItemTier | null
  enchantment: EnchantmentLevel
  baseId: string
  category: ItemCategory
  effectiveTier: number
} {
  return {
    tier: parseTier(itemId),
    enchantment: parseEnchantment(itemId),
    baseId: getBaseId(itemId),
    category: getItemCategory(itemId),
    effectiveTier: getEffectiveTier(itemId),
  }
}

/**
 * Generate all tier variants for a base item.
 * ("BAG", [4,5,6]) -> ["T4_BAG", "T5_BAG", "T6_BAG"]
 */
export function generateTierVariants(
  baseId: string,
  tiers: ItemTier[] = [4, 5, 6, 7, 8],
  enchantments: EnchantmentLevel[] = [0],
): string[] {
  const variants: string[] = []
  for (const tier of tiers) {
    for (const ench of enchantments) {
      const id = `T${tier}_${baseId}`
      variants.push(ench > 0 ? `${id}@${ench}` : id)
    }
  }
  return variants
}
