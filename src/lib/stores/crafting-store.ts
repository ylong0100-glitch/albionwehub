// =============================================================================
// Zustand Crafting Calculator Store
// Persisted state for crafting calculator settings & saved calculations
// =============================================================================

import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
export interface SavedCalculation {
  id: string
  itemId: string
  city: string
  timestamp: string
}

interface CraftingState {
  selectedItem: string | null
  craftingCity: string
  quantity: number
  useFocus: boolean
  includeJournals: boolean
  savedCalculations: SavedCalculation[]

  setSelectedItem: (item: string | null) => void
  setCraftingCity: (city: string) => void
  setQuantity: (qty: number) => void
  setUseFocus: (use: boolean) => void
  setIncludeJournals: (include: boolean) => void
  addSavedCalculation: (calc: SavedCalculation) => void
  removeSavedCalculation: (id: string) => void
}

const MAX_SAVED = 50

// ---------------------------------------------------------------------------
// Store
// ---------------------------------------------------------------------------
export const useCraftingStore = create<CraftingState>()(
  persist(
    (set) => ({
      selectedItem: null,
      craftingCity: 'Caerleon',
      quantity: 1,
      useFocus: false,
      includeJournals: false,
      savedCalculations: [],

      setSelectedItem: (item) => set({ selectedItem: item }),
      setCraftingCity: (city) => set({ craftingCity: city }),
      setQuantity: (qty) => set({ quantity: Math.max(1, Math.min(999, qty)) }),
      setUseFocus: (use) => set({ useFocus: use }),
      setIncludeJournals: (include) => set({ includeJournals: include }),

      addSavedCalculation: (calc) =>
        set((state) => ({
          savedCalculations: [calc, ...state.savedCalculations].slice(0, MAX_SAVED),
        })),

      removeSavedCalculation: (id) =>
        set((state) => ({
          savedCalculations: state.savedCalculations.filter((c) => c.id !== id),
        })),
    }),
    {
      name: 'albionhub-crafting',
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
        craftingCity: state.craftingCity,
        useFocus: state.useFocus,
        includeJournals: state.includeJournals,
        savedCalculations: state.savedCalculations,
      }),
    },
  ),
)
