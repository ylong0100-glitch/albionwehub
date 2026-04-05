// =============================================================================
// Zustand Market Store
// Persisted state for favorites and recent searches
// =============================================================================

import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

// ---------------------------------------------------------------------------
// State interface
// ---------------------------------------------------------------------------
interface MarketState {
  // Favorites
  favorites: string[]
  addFavorite: (id: string) => void
  removeFavorite: (id: string) => void
  isFavorite: (id: string) => boolean

  // Recent searches
  recentSearches: string[]
  addRecentSearch: (id: string) => void
  clearRecentSearches: () => void
}

const MAX_RECENT_SEARCHES = 20

// ---------------------------------------------------------------------------
// Store
// ---------------------------------------------------------------------------
export const useMarketStore = create<MarketState>()(
  persist(
    (set, get) => ({
      // Favorites
      favorites: [],
      addFavorite: (id) =>
        set((state) => ({
          favorites: state.favorites.includes(id)
            ? state.favorites
            : [...state.favorites, id],
        })),
      removeFavorite: (id) =>
        set((state) => ({
          favorites: state.favorites.filter((f) => f !== id),
        })),
      isFavorite: (id) => get().favorites.includes(id),

      // Recent searches
      recentSearches: [],
      addRecentSearch: (id) =>
        set((state) => {
          const filtered = state.recentSearches.filter((s) => s !== id)
          return {
            recentSearches: [id, ...filtered].slice(0, MAX_RECENT_SEARCHES),
          }
        }),
      clearRecentSearches: () => set({ recentSearches: [] }),
    }),
    {
      name: 'albionhub-market',
      storage: createJSONStorage(() => {
        if (typeof window !== 'undefined') {
          return localStorage
        }
        return {
          getItem: () => null,
          setItem: () => {},
          removeItem: () => {},
        }
      }),
      partialize: (state) => ({
        favorites: state.favorites,
        recentSearches: state.recentSearches,
      }),
    },
  ),
)
