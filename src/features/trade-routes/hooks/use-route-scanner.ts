'use client'

// =============================================================================
// Trade Route Scanner Hook
// Progressive batched scanning for profitable city-to-city trade routes
// =============================================================================

import { useState, useCallback, useRef } from 'react'
import type { PriceEntry } from '@/lib/api/albion-data'
import { useGameDataStore } from '@/lib/stores/game-data-store'
import {
  findBestRoutes,
  type TradeRoute,
  type RouteFilters,
} from '../utils/trade-calc'

// ---------------------------------------------------------------------------
// All tradeable market locations (API uses no spaces in Fort Sterling)
// ---------------------------------------------------------------------------
const API_LOCATIONS = [
  'Caerleon',
  'Bridgewatch',
  'Fort Sterling',
  'Lymhurst',
  'Martlock',
  'Thetford',
  'Brecilien',
]

const BATCH_SIZE = 40
const BATCH_DELAY_MS = 200

// ---------------------------------------------------------------------------
// Hook interface
// ---------------------------------------------------------------------------

export interface RouteScannerState {
  routes: TradeRoute[]
  isScanning: boolean
  progress: number       // 0-100
  totalBatches: number
  completedBatches: number
  error: string | null
  scan: (filters: RouteFilters) => Promise<void>
  cancel: () => void
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export function useRouteScanner(): RouteScannerState {
  const [routes, setRoutes] = useState<TradeRoute[]>([])
  const [isScanning, setIsScanning] = useState(false)
  const [progress, setProgress] = useState(0)
  const [totalBatches, setTotalBatches] = useState(0)
  const [completedBatches, setCompletedBatches] = useState(0)
  const [error, setError] = useState<string | null>(null)

  const abortRef = useRef<AbortController | null>(null)

  const cancel = useCallback(() => {
    abortRef.current?.abort()
    setIsScanning(false)
  }, [])

  const scan = useCallback(async (filters: RouteFilters) => {
    // Cancel any previous scan
    abortRef.current?.abort()
    const controller = new AbortController()
    abortRef.current = controller

    setIsScanning(true)
    setRoutes([])
    setProgress(0)
    setCompletedBatches(0)
    setError(null)

    try {
      // 1. Get filtered item IDs from game-data-store
      const { items, itemsList } = useGameDataStore.getState()

      if (!itemsList.length) {
        throw new Error('Game data not loaded. Please wait for game data to finish loading.')
      }

      const filteredItems = itemsList.filter((item) => {
        if (item.tier < filters.minTier || item.tier > filters.maxTier) return false
        if (
          filters.categories.length > 0 &&
          !filters.categories.includes(item.category)
        ) {
          return false
        }
        // Weight pre-filter
        if (
          filters.maxWeight > 0 &&
          item.weight !== undefined &&
          item.weight > filters.maxWeight
        ) {
          return false
        }
        return true
      })

      const itemIds = filteredItems.map((item) => item.id)

      if (!itemIds.length) {
        setIsScanning(false)
        setProgress(100)
        return
      }

      // 2. Split into batches
      const batches: string[][] = []
      for (let i = 0; i < itemIds.length; i += BATCH_SIZE) {
        batches.push(itemIds.slice(i, i + BATCH_SIZE))
      }

      setTotalBatches(batches.length)

      // 3. Fetch prices batch by batch
      const allPriceData: PriceEntry[] = []

      for (let i = 0; i < batches.length; i++) {
        if (controller.signal.aborted) return

        const batch = batches[i]
        const params = new URLSearchParams()
        params.set('items', batch.join(','))
        params.set('locations', API_LOCATIONS.join(','))

        try {
          const response = await fetch(`/api/v1/prices?${params.toString()}`, {
            signal: controller.signal,
            headers: { Accept: 'application/json' },
          })

          if (!response.ok) {
            console.warn(`Batch ${i + 1} failed: HTTP ${response.status}`)
            continue
          }

          const batchData: PriceEntry[] = await response.json()
          allPriceData.push(...batchData)
        } catch (err) {
          if (err instanceof DOMException && err.name === 'AbortError') return
          console.warn(`Batch ${i + 1} fetch error:`, err)
        }

        // Update progress
        const completed = i + 1
        setCompletedBatches(completed)
        setProgress(Math.round((completed / batches.length) * 100))

        // Progressive results: compute routes so far
        if (completed % 5 === 0 || completed === batches.length) {
          const currentRoutes = findBestRoutes(allPriceData, items, filters)
          if (!controller.signal.aborted) {
            setRoutes(currentRoutes)
          }
        }

        // Rate limit delay
        if (i < batches.length - 1) {
          await new Promise((resolve) => setTimeout(resolve, BATCH_DELAY_MS))
        }
      }

      // 4. Final route calculation
      if (!controller.signal.aborted) {
        const finalRoutes = findBestRoutes(allPriceData, items, filters)
        setRoutes(finalRoutes)
        setProgress(100)
      }
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') return
      const message = err instanceof Error ? err.message : 'Scan failed'
      if (!controller.signal.aborted) {
        setError(message)
      }
    } finally {
      if (!controller.signal.aborted) {
        setIsScanning(false)
      }
    }
  }, [])

  return {
    routes,
    isScanning,
    progress,
    totalBatches,
    completedBatches,
    error,
    scan,
    cancel,
  }
}
