// =============================================================================
// Zustand Portfolio Store
// Persisted local state for portfolio positions and trade logs
// =============================================================================

import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
export interface Position {
  id: string
  itemId: string
  itemName: string
  city: string
  quantity: number
  avgBuyPrice: number
  openedAt: string // ISO timestamp
  notes?: string
}

export interface TradeLog {
  id: string
  positionId: string
  action: 'buy' | 'sell'
  price: number
  quantity: number
  fees: number
  timestamp: string
}

// ---------------------------------------------------------------------------
// State interface
// ---------------------------------------------------------------------------
interface PortfolioState {
  positions: Position[]
  tradeLog: TradeLog[]
  addPosition: (pos: Omit<Position, 'id' | 'openedAt'>) => void
  removePosition: (id: string) => void
  updatePosition: (id: string, updates: Partial<Position>) => void
  addTrade: (trade: Omit<TradeLog, 'id' | 'timestamp'>) => void
  clearAll: () => void
}

// ---------------------------------------------------------------------------
// Store
// ---------------------------------------------------------------------------
export const usePortfolioStore = create<PortfolioState>()(
  persist(
    (set) => ({
      positions: [],
      tradeLog: [],

      addPosition: (pos) =>
        set((state) => ({
          positions: [
            ...state.positions,
            {
              ...pos,
              id: crypto.randomUUID(),
              openedAt: new Date().toISOString(),
            },
          ],
        })),

      removePosition: (id) =>
        set((state) => ({
          positions: state.positions.filter((p) => p.id !== id),
        })),

      updatePosition: (id, updates) =>
        set((state) => ({
          positions: state.positions.map((p) =>
            p.id === id ? { ...p, ...updates } : p
          ),
        })),

      addTrade: (trade) =>
        set((state) => ({
          tradeLog: [
            ...state.tradeLog,
            {
              ...trade,
              id: crypto.randomUUID(),
              timestamp: new Date().toISOString(),
            },
          ],
        })),

      clearAll: () => set({ positions: [], tradeLog: [] }),
    }),
    {
      name: 'albionhub-portfolio',
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
    }
  )
)
