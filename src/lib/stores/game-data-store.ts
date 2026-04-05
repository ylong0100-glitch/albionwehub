// =============================================================================
// Game Data Store
// Loads processed game data and provides search + lookup capabilities
// =============================================================================

import { create } from 'zustand'
import Fuse from 'fuse.js'
import type { ProcessedItem, ProcessedRecipe } from '@/types/game-data'

// ---------------------------------------------------------------------------
// State interface
// ---------------------------------------------------------------------------
interface GameDataState {
  items: Map<string, ProcessedItem>
  recipes: Map<string, ProcessedRecipe>
  itemsList: ProcessedItem[]
  loaded: boolean
  loading: boolean
  error: string | null

  // Actions
  loadGameData: () => Promise<void>
  searchItems: (query: string, limit?: number) => ProcessedItem[]
  getItem: (id: string) => ProcessedItem | undefined
  getRecipe: (id: string) => ProcessedRecipe | undefined
  getItemName: (id: string, locale?: string) => string
}

// ---------------------------------------------------------------------------
// Fuse.js index (module-level singleton so it survives re-renders)
// ---------------------------------------------------------------------------
let fuseIndex: Fuse<ProcessedItem> | null = null
let itemNamesCache: Record<string, Record<string, string>> | null = null

function buildFuseIndex(items: ProcessedItem[]): Fuse<ProcessedItem> {
  return new Fuse(items, {
    keys: [
      { name: 'name', weight: 0.5 },
      { name: 'nameZH', weight: 0.3 },
      { name: 'id', weight: 0.2 },
    ],
    threshold: 0.35,
    distance: 100,
    minMatchCharLength: 2,
    includeScore: true,
  })
}

// ---------------------------------------------------------------------------
// Store
// ---------------------------------------------------------------------------
export const useGameDataStore = create<GameDataState>()((set, get) => ({
  items: new Map(),
  recipes: new Map(),
  itemsList: [],
  loaded: false,
  loading: false,
  error: null,

  loadGameData: async () => {
    const state = get()
    if (state.loaded || state.loading) return

    set({ loading: true, error: null })

    try {
      const [itemsRes, recipesRes, namesRes] = await Promise.all([
        fetch('/game-data/items.json'),
        fetch('/game-data/recipes.json'),
        fetch('/game-data/item-names.json'),
      ])

      if (!itemsRes.ok) throw new Error(`Failed to load items: ${itemsRes.status}`)
      if (!recipesRes.ok) throw new Error(`Failed to load recipes: ${recipesRes.status}`)

      const [itemsArr, recipesArr]: [ProcessedItem[], ProcessedRecipe[]] =
        await Promise.all([itemsRes.json(), recipesRes.json()])

      // Load item names (optional — don't fail if missing)
      if (namesRes.ok) {
        itemNamesCache = await namesRes.json()
      }

      // Build maps
      const itemsMap = new Map<string, ProcessedItem>()
      for (const item of itemsArr) {
        itemsMap.set(item.id, item)
      }

      const recipesMap = new Map<string, ProcessedRecipe>()
      for (const recipe of recipesArr) {
        recipesMap.set(recipe.itemId, recipe)
      }

      // Build search index
      fuseIndex = buildFuseIndex(itemsArr)

      set({
        items: itemsMap,
        recipes: recipesMap,
        itemsList: itemsArr,
        loaded: true,
        loading: false,
        error: null,
      })

      console.log(
        `[GameData] Loaded ${itemsMap.size} items, ${recipesMap.size} recipes`,
      )
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error'
      console.error('[GameData] Failed to load:', message)
      set({ loading: false, error: message })
    }
  },

  searchItems: (query: string, limit = 20): ProcessedItem[] => {
    if (!fuseIndex || !query.trim()) return []
    const results = fuseIndex.search(query, { limit })
    return results.map((r) => r.item)
  },

  getItem: (id: string): ProcessedItem | undefined => {
    return get().items.get(id)
  },

  getRecipe: (id: string): ProcessedRecipe | undefined => {
    return get().recipes.get(id)
  },

  getItemName: (id: string, locale?: string): string => {
    // If a specific locale is requested, check the names cache
    if (locale && itemNamesCache) {
      const names = itemNamesCache[id]
      if (names?.[locale]) return names[locale]
    }

    // Fall back to the main item data
    const item = get().items.get(id)
    if (item) {
      if (locale === 'ZH-CN' && item.nameZH) return item.nameZH
      return item.name
    }

    return id
  },
}))
