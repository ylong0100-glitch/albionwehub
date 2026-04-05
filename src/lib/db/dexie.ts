// =============================================================================
// Dexie IndexedDB Database
// Client-side persistent storage for caching, builds, timers, and more
// =============================================================================

import Dexie, { type Table } from 'dexie'

// ---------------------------------------------------------------------------
// Table interfaces
// ---------------------------------------------------------------------------

/** Cached market price from AODP */
export interface CachedPrice {
  id?: number
  itemId: string
  city: string
  quality: number
  sellPriceMin: number
  sellPriceMinDate: string
  sellPriceMax: number
  sellPriceMaxDate: string
  buyPriceMin: number
  buyPriceMinDate: string
  buyPriceMax: number
  buyPriceMaxDate: string
  fetchedAt: number // Unix timestamp (ms)
}

/** Cached price history data point */
export interface CachedPriceHistory {
  id?: number
  itemId: string
  city: string
  quality: number
  timeScale: number
  dataPoints: Array<{
    itemCount: number
    avgPrice: number
    timestamp: string
  }>
  fetchedAt: number
}

/** Cached gold price */
export interface CachedGoldPrice {
  id?: number
  price: number
  timestamp: string
  fetchedAt: number
}

/** Saved equipment build / loadout */
export interface SavedBuild {
  id?: string
  name: string
  description: string
  mainHand: string | null
  offHand: string | null
  head: string | null
  armor: string | null
  shoes: string | null
  cape: string | null
  bag: string | null
  mount: string | null
  food: string | null
  potion: string | null
  /** Spell selections per slot */
  spells: Record<string, string[]>
  tags: string[]
  createdAt: number
  updatedAt: number
}

/** Island / hideout farm configuration */
export interface IslandConfig {
  id?: string
  name: string
  region: string
  type: 'personal' | 'guild' | 'hideout'
  plots: PlotConfig[]
  createdAt: number
  updatedAt: number
}

export interface PlotConfig {
  plotIndex: number
  buildingType: string
  tier: number
  /** Resource being produced, if applicable */
  resource: string | null
  /** Seconds until next harvest */
  cycleDuration: number
  lastHarvestAt: number | null
}

/** Countdown / crafting / focus timer */
export interface Timer {
  id?: string
  label: string
  type: 'crafting' | 'farming' | 'laborers' | 'focus' | 'custom'
  /** When the timer ends (Unix ms) */
  endsAt: number
  /** Duration in ms (for display / recreation) */
  duration: number
  /** Item ID if related to crafting */
  itemId: string | null
  /** Whether to send browser notification */
  notify: boolean
  createdAt: number
}

/** Portfolio / investment tracking position */
export interface PortfolioPosition {
  id?: string
  itemId: string
  city: string
  quantity: number
  /** Average cost per unit in silver */
  avgCost: number
  /** Optional notes */
  notes: string
  createdAt: number
  updatedAt: number
}

/** Trade log entry for profit tracking */
export interface TradeLogEntry {
  id?: string
  type: 'buy' | 'sell'
  itemId: string
  city: string
  quality: number
  quantity: number
  pricePerUnit: number
  /** Total silver (quantity * pricePerUnit) */
  totalSilver: number
  /** Optional link to portfolio position */
  positionId: string | null
  notes: string
  tradedAt: number
  createdAt: number
}

/** Avalon roads / tunnels map data */
export interface AvalonMap {
  id?: string
  name: string
  tier: number
  type: string
  connections: AvalonConnection[]
  notes: string
  discoveredAt: number
  expiresAt: number
  createdAt: number
  updatedAt: number
}

export interface AvalonConnection {
  targetMapId: string
  targetMapName: string
  portalType: 'zone' | 'city' | 'hideout'
  position: { x: number; y: number }
}

/** User favorites (items, players, guilds, etc.) */
export interface Favorite {
  id?: string
  type: 'item' | 'player' | 'guild' | 'alliance' | 'recipe'
  targetId: string
  label: string
  /** Extra metadata (region, etc.) */
  meta: Record<string, string>
  createdAt: number
}

/** Notification / alert configuration */
export interface PriceAlert {
  id?: string
  itemId: string
  city: string
  quality: number
  condition: 'above' | 'below'
  threshold: number
  enabled: boolean
  lastTriggeredAt: number | null
  createdAt: number
}

/** Cached search history */
export interface SearchHistory {
  id?: number
  query: string
  type: 'item' | 'player' | 'guild'
  resultId: string
  resultLabel: string
  searchedAt: number
}

// ---------------------------------------------------------------------------
// Database class
// ---------------------------------------------------------------------------
export class AlbionHubDB extends Dexie {
  prices!: Table<CachedPrice>
  priceHistory!: Table<CachedPriceHistory>
  goldPrices!: Table<CachedGoldPrice>
  builds!: Table<SavedBuild>
  islands!: Table<IslandConfig>
  timers!: Table<Timer>
  portfolioPositions!: Table<PortfolioPosition>
  tradeLogs!: Table<TradeLogEntry>
  avalonMaps!: Table<AvalonMap>
  favorites!: Table<Favorite>
  priceAlerts!: Table<PriceAlert>
  searchHistory!: Table<SearchHistory>

  constructor() {
    super('albionhub')

    this.version(1).stores({
      // ++id = auto-increment primary key
      // Compound indexes for fast lookups
      prices: '++id, [itemId+city+quality], itemId, city, fetchedAt',
      priceHistory: '++id, [itemId+city+quality+timeScale], itemId, fetchedAt',
      goldPrices: '++id, timestamp, fetchedAt',
      builds: 'id, name, createdAt, updatedAt, *tags',
      islands: 'id, name, type, createdAt',
      timers: 'id, type, endsAt, createdAt',
      portfolioPositions: 'id, itemId, city, createdAt',
      tradeLogs: 'id, type, itemId, city, positionId, tradedAt, createdAt',
      avalonMaps: 'id, name, tier, type, expiresAt, createdAt',
      favorites: 'id, type, targetId, createdAt',
      priceAlerts: 'id, itemId, city, enabled, createdAt',
      searchHistory: '++id, query, type, searchedAt',
    })
  }
}

// ---------------------------------------------------------------------------
// Singleton instance
// ---------------------------------------------------------------------------
export const db = new AlbionHubDB()

// ---------------------------------------------------------------------------
// Cache helpers
// ---------------------------------------------------------------------------

/** Maximum age for cached prices (5 minutes) */
const PRICE_CACHE_TTL = 5 * 60 * 1000

/** Maximum age for cached history (15 minutes) */
const HISTORY_CACHE_TTL = 15 * 60 * 1000

/** Maximum age for cached gold prices (10 minutes) */
const GOLD_CACHE_TTL = 10 * 60 * 1000

/**
 * Get cached prices if still fresh, otherwise return null
 */
export async function getCachedPrices(
  itemId: string,
  city?: string,
  quality?: number,
): Promise<CachedPrice[] | null> {
  const cutoff = Date.now() - PRICE_CACHE_TTL

  let query = db.prices.where('itemId').equals(itemId).and((p) => p.fetchedAt > cutoff)

  const results = await query.toArray()
  let filtered = results

  if (city) {
    filtered = filtered.filter((p) => p.city === city)
  }
  if (quality !== undefined) {
    filtered = filtered.filter((p) => p.quality === quality)
  }

  return filtered.length > 0 ? filtered : null
}

/**
 * Store prices in the cache, replacing old entries for the same item/city/quality
 */
export async function cachePrices(prices: CachedPrice[]): Promise<void> {
  await db.transaction('rw', db.prices, async () => {
    for (const price of prices) {
      // Remove stale entries
      await db.prices
        .where('[itemId+city+quality]')
        .equals([price.itemId, price.city, price.quality])
        .delete()
      // Insert fresh
      await db.prices.add(price)
    }
  })
}

/**
 * Purge all cached data older than the given TTL
 */
export async function purgeStaleCache(): Promise<void> {
  const now = Date.now()
  await Promise.all([
    db.prices.where('fetchedAt').below(now - PRICE_CACHE_TTL).delete(),
    db.priceHistory.where('fetchedAt').below(now - HISTORY_CACHE_TTL).delete(),
    db.goldPrices.where('fetchedAt').below(now - GOLD_CACHE_TTL).delete(),
  ])
}

/**
 * Clear the search history, keeping only the most recent N entries
 */
export async function trimSearchHistory(keep: number = 50): Promise<void> {
  const count = await db.searchHistory.count()
  if (count <= keep) return

  const oldest = await db.searchHistory.orderBy('searchedAt').limit(count - keep).toArray()
  const ids = oldest.map((h) => h.id).filter((id): id is number => id !== undefined)
  await db.searchHistory.bulkDelete(ids)
}
