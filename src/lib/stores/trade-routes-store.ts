// =============================================================================
// Trade Routes Store
// Persisted filters and settings for the trade route planner
// =============================================================================

import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

// ---------------------------------------------------------------------------
// State interface
// ---------------------------------------------------------------------------
export interface TradeRoutesState {
  buyCity: string       // city name or 'all' to scan all buy cities
  sellCity: string      // city name or 'all'
  minTier: number
  maxTier: number
  categories: string[]  // item categories to scan
  minProfit: number
  isPremium: boolean
  maxWeight: number     // mount carry capacity (0 = no limit)
  selectedMount: string // mount name or '' for no mount

  // Actions
  setBuyCity: (city: string) => void
  setSellCity: (city: string) => void
  setMinTier: (tier: number) => void
  setMaxTier: (tier: number) => void
  setCategories: (categories: string[]) => void
  toggleCategory: (category: string) => void
  setMinProfit: (profit: number) => void
  setIsPremium: (premium: boolean) => void
  setMaxWeight: (weight: number) => void
  setSelectedMount: (mount: string) => void
  resetFilters: () => void
}

// ---------------------------------------------------------------------------
// Default values
// ---------------------------------------------------------------------------
const DEFAULT_CATEGORIES = [
  'weapons',
  'head',
  'armors',
  'shoes',
  'offhands',
  'capes',
  'bags',
]

const DEFAULT_STATE = {
  buyCity: 'all',
  sellCity: 'all',
  minTier: 4,
  maxTier: 8,
  categories: [...DEFAULT_CATEGORIES],
  minProfit: 1000,
  isPremium: true,
  maxWeight: 0,
  selectedMount: '',
}

// ---------------------------------------------------------------------------
// Store
// ---------------------------------------------------------------------------
export const useTradeRoutesStore = create<TradeRoutesState>()(
  persist(
    (set) => ({
      ...DEFAULT_STATE,

      setBuyCity: (buyCity) => set({ buyCity }),
      setSellCity: (sellCity) => set({ sellCity }),

      setMinTier: (minTier) =>
        set((state) => ({
          minTier,
          maxTier: Math.max(state.maxTier, minTier),
        })),

      setMaxTier: (maxTier) =>
        set((state) => ({
          maxTier,
          minTier: Math.min(state.minTier, maxTier),
        })),

      setCategories: (categories) => set({ categories }),

      toggleCategory: (category) =>
        set((state) => ({
          categories: state.categories.includes(category)
            ? state.categories.filter((c) => c !== category)
            : [...state.categories, category],
        })),

      setMinProfit: (minProfit) => set({ minProfit }),
      setIsPremium: (isPremium) => set({ isPremium }),
      setMaxWeight: (maxWeight) => set({ maxWeight }),
      setSelectedMount: (selectedMount) => set({ selectedMount }),

      resetFilters: () => set(DEFAULT_STATE),
    }),
    {
      name: 'albionhub-trade-routes',
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
        buyCity: state.buyCity,
        sellCity: state.sellCity,
        minTier: state.minTier,
        maxTier: state.maxTier,
        categories: state.categories,
        minProfit: state.minProfit,
        isPremium: state.isPremium,
        maxWeight: state.maxWeight,
        selectedMount: state.selectedMount,
      }),
    },
  ),
)
