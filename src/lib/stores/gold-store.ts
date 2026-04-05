// =============================================================================
// Zustand Gold Price Store
// State for gold price tracker: selected regions and time range
// =============================================================================

import { create } from 'zustand'
import type { Region } from '@/types'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
export type GoldTimeRange = '1d' | '7d' | '30d' | '90d'

interface GoldState {
  selectedRegions: Region[]
  timeRange: GoldTimeRange
  setSelectedRegions: (regions: Region[]) => void
  toggleRegion: (region: Region) => void
  setTimeRange: (range: GoldTimeRange) => void
}

// ---------------------------------------------------------------------------
// Time range to API count mapping
// ---------------------------------------------------------------------------
export const TIME_RANGE_COUNT: Record<GoldTimeRange, number> = {
  '1d': 24,
  '7d': 168,
  '30d': 720,
  '90d': 2160,
}

// ---------------------------------------------------------------------------
// Store
// ---------------------------------------------------------------------------
export const useGoldStore = create<GoldState>()((set) => ({
  selectedRegions: ['west'],
  timeRange: '7d',

  setSelectedRegions: (regions) => set({ selectedRegions: regions }),

  toggleRegion: (region) =>
    set((state) => {
      const exists = state.selectedRegions.includes(region)
      if (exists) {
        // Don't allow deselecting last region
        if (state.selectedRegions.length <= 1) return state
        return {
          selectedRegions: state.selectedRegions.filter((r) => r !== region),
        }
      }
      return {
        selectedRegions: [...state.selectedRegions, region],
      }
    }),

  setTimeRange: (range) => set({ timeRange: range }),
}))
