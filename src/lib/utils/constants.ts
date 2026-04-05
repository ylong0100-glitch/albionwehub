// =============================================================================
// Application constants
// =============================================================================

import type { Region } from '@/types'

// ---------------------------------------------------------------------------
// Cities & Locations
// ---------------------------------------------------------------------------
export const ROYAL_CITIES = [
  'Bridgewatch',
  'Fort Sterling',
  'Lymhurst',
  'Martlock',
  'Thetford',
  'Caerleon',
] as const

export const BLACK_MARKET = 'Black Market' as const

export const REST_CITIES = ['Brecilien'] as const

export const ALL_MARKET_LOCATIONS = [
  ...ROYAL_CITIES,
  BLACK_MARKET,
  ...REST_CITIES,
] as const

/** City biome mapping for resource bonuses */
export const CITY_BIOMES: Record<string, string> = {
  Bridgewatch: 'Steppe',
  'Fort Sterling': 'Mountain',
  Lymhurst: 'Forest',
  Martlock: 'Highland',
  Thetford: 'Swamp',
  Caerleon: 'None',
}

/** City resource bonuses (crafting return rate bonus) */
export const CITY_RESOURCE_BONUSES: Record<string, string[]> = {
  Bridgewatch: ['HIDE', 'LEATHER'],
  'Fort Sterling': ['ORE', 'METALBAR', 'STONEBLOCK', 'ROCK'],
  Lymhurst: ['WOOD', 'PLANKS'],
  Martlock: ['ROCK', 'STONEBLOCK'],
  Thetford: ['FIBER', 'CLOTH'],
  Caerleon: [],
}

// ---------------------------------------------------------------------------
// Regions
// ---------------------------------------------------------------------------
export const REGIONS: { id: Region; label: string; shortLabel: string }[] = [
  { id: 'west', label: 'Americas (West)', shortLabel: 'West' },
  { id: 'east', label: 'Asia (East)', shortLabel: 'East' },
  { id: 'europe', label: 'Europe', shortLabel: 'EU' },
]

// ---------------------------------------------------------------------------
// Item quality levels
// ---------------------------------------------------------------------------
export const QUALITIES = [
  { level: 1, name: 'Normal', color: '#b0b0b0' },
  { level: 2, name: 'Good', color: '#45a049' },
  { level: 3, name: 'Outstanding', color: '#3498db' },
  { level: 4, name: 'Excellent', color: '#9b59b6' },
  { level: 5, name: 'Masterpiece', color: '#f1c40f' },
] as const

// ---------------------------------------------------------------------------
// Item tiers
// ---------------------------------------------------------------------------
export const TIERS = [
  { level: 1, name: 'Beginner', color: '#c4c4c4' },
  { level: 2, name: 'Novice', color: '#70a340' },
  { level: 3, name: 'Journeyman', color: '#4090c8' },
  { level: 4, name: 'Adept', color: '#c8c040' },
  { level: 5, name: 'Expert', color: '#c06030' },
  { level: 6, name: 'Master', color: '#c04040' },
  { level: 7, name: 'Grandmaster', color: '#808080' },
  { level: 8, name: 'Elder', color: '#d4a520' },
] as const

export const ENCHANTMENT_LEVELS = [0, 1, 2, 3, 4] as const

export const ENCHANTMENT_NAMES: Record<number, string> = {
  0: 'Base',
  1: 'Uncommon',
  2: 'Rare',
  3: 'Exceptional',
  4: 'Pristine',
}

// ---------------------------------------------------------------------------
// Crafting & Refining
// ---------------------------------------------------------------------------
export const REFINING_RESOURCES = ['ORE', 'WOOD', 'HIDE', 'FIBER', 'ROCK'] as const
export const REFINED_RESOURCES = ['METALBAR', 'PLANKS', 'LEATHER', 'CLOTH', 'STONEBLOCK'] as const

/** Base return rate without focus */
export const BASE_RETURN_RATE = 0.152

/** Return rate with focus */
export const FOCUS_RETURN_RATE = 0.432

/** Maximum daily focus for premium users */
export const MAX_DAILY_FOCUS = 10_000

/** Tax rates */
export const MARKET_SETUP_FEE = 0.025 // 2.5%
export const MARKET_SALES_TAX = 0.04 // 4% (recently updated)
export const PREMIUM_TAX_DISCOUNT = 0.5 // Premium halves setup fee

// ---------------------------------------------------------------------------
// Crafting stations
// ---------------------------------------------------------------------------
export const CRAFTING_STATIONS = [
  'Warrior\'s Forge',
  'Hunter\'s Lodge',
  'Mage\'s Tower',
  'Toolmaker',
  'Cook',
  'Alchemist',
  'Saddler',
  'Lumbermill',
  'Smelter',
  'Tanner',
  'Weaver',
  'Stonemason',
] as const

// ---------------------------------------------------------------------------
// Resource tiers for refining chains
// ---------------------------------------------------------------------------
export const RESOURCE_TIERS: Record<string, { raw: string; refined: string }> = {
  ORE: { raw: 'ORE', refined: 'METALBAR' },
  WOOD: { raw: 'WOOD', refined: 'PLANKS' },
  HIDE: { raw: 'HIDE', refined: 'LEATHER' },
  FIBER: { raw: 'FIBER', refined: 'CLOTH' },
  ROCK: { raw: 'ROCK', refined: 'STONEBLOCK' },
}

// ---------------------------------------------------------------------------
// PvP zones
// ---------------------------------------------------------------------------
export const ZONE_TYPES = [
  'Blue Zone',
  'Yellow Zone',
  'Red Zone',
  'Black Zone',
  'Avalonian Roads',
  'Corrupted Dungeon',
  'Hellgate',
  'Crystal League',
] as const

// ---------------------------------------------------------------------------
// API rate limits
// ---------------------------------------------------------------------------
export const API_RATE_LIMIT = 150 // requests per minute
export const API_TIMEOUT_MS = 10_000

// ---------------------------------------------------------------------------
// Cache TTLs (milliseconds)
// ---------------------------------------------------------------------------
export const CACHE_TTL = {
  PRICES: 5 * 60 * 1000,       // 5 minutes
  HISTORY: 15 * 60 * 1000,     // 15 minutes
  GOLD: 10 * 60 * 1000,        // 10 minutes
  PLAYER: 30 * 60 * 1000,      // 30 minutes
  GUILD: 60 * 60 * 1000,       // 1 hour
  ITEM_DATA: 24 * 60 * 60 * 1000, // 24 hours
} as const

// ---------------------------------------------------------------------------
// Date range presets
// ---------------------------------------------------------------------------
export const DATE_RANGE_PRESETS = [
  { id: '1h', label: '1 Hour', hours: 1 },
  { id: '6h', label: '6 Hours', hours: 6 },
  { id: '1d', label: '1 Day', hours: 24 },
  { id: '7d', label: '7 Days', hours: 168 },
  { id: '30d', label: '30 Days', hours: 720 },
  { id: '90d', label: '90 Days', hours: 2160 },
] as const
