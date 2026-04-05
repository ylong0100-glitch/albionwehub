// =============================================================================
// Black Market Flipper Store
// Persisted filters and settings for the BM flip scanner
// =============================================================================

import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

// ---------------------------------------------------------------------------
// State interface
// ---------------------------------------------------------------------------
export interface FlipperState {
  buyLocation: string
  sellLocation: string
  minTier: number
  maxTier: number
  enchantmentLevels: number[]
  categories: string[]
  minProfit: number
  isPremium: boolean
  maxDataAgeHours: number  // only show flips with data newer than this (0 = no limit)

  // Actions
  setBuyLocation: (location: string) => void
  setSellLocation: (location: string) => void
  setMinTier: (tier: number) => void
  setMaxTier: (tier: number) => void
  setEnchantmentLevels: (levels: number[]) => void
  toggleEnchantment: (level: number) => void
  setCategories: (categories: string[]) => void
  toggleCategory: (category: string) => void
  setMinProfit: (profit: number) => void
  setIsPremium: (premium: boolean) => void
  setMaxDataAgeHours: (hours: number) => void
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
  buyLocation: 'Caerleon',
  sellLocation: 'Black Market',
  minTier: 4,
  maxTier: 8,
  enchantmentLevels: [0, 1, 2, 3],
  categories: [...DEFAULT_CATEGORIES],
  minProfit: 0,
  isPremium: true,
  maxDataAgeHours: 24,  // default: only show data from last 24 hours
}

// ---------------------------------------------------------------------------
// Store
// ---------------------------------------------------------------------------
export const useFlipperStore = create<FlipperState>()(
  persist(
    (set) => ({
      ...DEFAULT_STATE,

      setBuyLocation: (buyLocation) => set({ buyLocation }),
      setSellLocation: (sellLocation) => set({ sellLocation }),

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

      setEnchantmentLevels: (enchantmentLevels) => set({ enchantmentLevels }),

      toggleEnchantment: (level) =>
        set((state) => ({
          enchantmentLevels: state.enchantmentLevels.includes(level)
            ? state.enchantmentLevels.filter((l) => l !== level)
            : [...state.enchantmentLevels, level].sort(),
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
      setMaxDataAgeHours: (maxDataAgeHours) => set({ maxDataAgeHours }),

      resetFilters: () => set(DEFAULT_STATE),
    }),
    {
      name: 'albionhub-flipper',
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
        buyLocation: state.buyLocation,
        sellLocation: state.sellLocation,
        minTier: state.minTier,
        maxTier: state.maxTier,
        enchantmentLevels: state.enchantmentLevels,
        categories: state.categories,
        minProfit: state.minProfit,
        isPremium: state.isPremium,
        maxDataAgeHours: state.maxDataAgeHours,
      }),
    },
  ),
)
