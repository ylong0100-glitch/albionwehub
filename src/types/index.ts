// =============================================================================
// Core type definitions for AlbionHub
// =============================================================================

// ---------------------------------------------------------------------------
// Region & Server
// ---------------------------------------------------------------------------
export type Region = 'west' | 'east' | 'europe'
export type Theme = 'light' | 'dark' | 'system'

// ---------------------------------------------------------------------------
// Item system
// ---------------------------------------------------------------------------
export type ItemTier = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8
export type EnchantmentLevel = 0 | 1 | 2 | 3 | 4
export type QualityLevel = 1 | 2 | 3 | 4 | 5

export const QUALITY_NAMES: Record<QualityLevel, string> = {
  1: 'Normal',
  2: 'Good',
  3: 'Outstanding',
  4: 'Excellent',
  5: 'Masterpiece',
}

export interface ItemIdentifier {
  /** Full item ID, e.g. "T4_BAG@1" */
  fullId: string
  /** Base item ID without tier/enchantment, e.g. "BAG" */
  baseId: string
  /** Tier (1-8) */
  tier: ItemTier
  /** Enchantment level (0-4) */
  enchantment: EnchantmentLevel
}

export type ItemCategory =
  | 'weapon'
  | 'armor'
  | 'accessory'
  | 'consumable'
  | 'material'
  | 'resource'
  | 'mount'
  | 'farmable'
  | 'furniture'
  | 'laborer'
  | 'token'
  | 'other'

export type ItemSubCategory =
  | 'sword'
  | 'axe'
  | 'mace'
  | 'hammer'
  | 'crossbow'
  | 'bow'
  | 'spear'
  | 'dagger'
  | 'quarterstaff'
  | 'torch'
  | 'totem'
  | 'shield'
  | 'book'
  | 'orb'
  | 'nature'
  | 'holy'
  | 'fire'
  | 'frost'
  | 'arcane'
  | 'cursed'
  | 'cloth_helmet'
  | 'cloth_armor'
  | 'cloth_shoes'
  | 'leather_helmet'
  | 'leather_armor'
  | 'leather_shoes'
  | 'plate_helmet'
  | 'plate_armor'
  | 'plate_shoes'
  | 'cape'
  | 'bag'
  | 'food'
  | 'potion'
  | 'mount'
  | 'ore'
  | 'wood'
  | 'hide'
  | 'fiber'
  | 'rock'
  | string

// ---------------------------------------------------------------------------
// City & Location
// ---------------------------------------------------------------------------
export type RoyalCity =
  | 'Bridgewatch'
  | 'Fort Sterling'
  | 'Lymhurst'
  | 'Martlock'
  | 'Thetford'
  | 'Caerleon'

export type BlackMarket = 'Black Market'

export type MarketLocation = RoyalCity | BlackMarket | string

// ---------------------------------------------------------------------------
// Equipment slots
// ---------------------------------------------------------------------------
export type EquipmentSlot =
  | 'MainHand'
  | 'OffHand'
  | 'Head'
  | 'Armor'
  | 'Shoes'
  | 'Cape'
  | 'Bag'
  | 'Mount'
  | 'Food'
  | 'Potion'

// ---------------------------------------------------------------------------
// Generic API response types
// ---------------------------------------------------------------------------
export interface PaginatedResponse<T> {
  data: T[]
  total: number
  offset: number
  limit: number
}

export interface ApiErrorResponse {
  error: string
  message: string
  statusCode: number
}

// ---------------------------------------------------------------------------
// Search
// ---------------------------------------------------------------------------
export type SearchCategory = 'item' | 'player' | 'guild' | 'alliance'

export interface SearchResult {
  id: string
  name: string
  category: SearchCategory
  /** Extra context (guild name, tier, etc.) */
  description?: string
  iconUrl?: string
}

// ---------------------------------------------------------------------------
// Date range presets
// ---------------------------------------------------------------------------
export type DateRangePreset = '1h' | '6h' | '1d' | '7d' | '30d' | '90d' | 'all'

// Re-export sub-modules
export type * from './market'
export type * from './crafting'
export type * from './pvp'
