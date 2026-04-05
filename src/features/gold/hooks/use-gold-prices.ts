// =============================================================================
// Gold Price Data Hook
// Fetches gold prices with SWR-like caching via useEffect + state
// =============================================================================

'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { getGoldPrices, type GoldPrice } from '@/lib/api/albion-data'
import type { Region } from '@/types'
import { TIME_RANGE_COUNT, type GoldTimeRange } from '@/lib/stores/gold-store'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
interface UseGoldPricesResult {
  data: GoldPrice[]
  isLoading: boolean
  error: Error | null
  refetch: () => void
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------
export function useGoldPrices(
  region: Region,
  timeRange: GoldTimeRange,
): UseGoldPricesResult {
  const [data, setData] = useState<GoldPrice[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const abortRef = useRef<AbortController | null>(null)

  const fetchData = useCallback(async () => {
    // Abort previous request
    abortRef.current?.abort()
    const controller = new AbortController()
    abortRef.current = controller

    setIsLoading(true)
    setError(null)

    try {
      const count = TIME_RANGE_COUNT[timeRange]
      const result = await getGoldPrices({ count, region })

      if (!controller.signal.aborted) {
        setData(result)
        setIsLoading(false)
      }
    } catch (err) {
      if (!controller.signal.aborted) {
        setError(err instanceof Error ? err : new Error(String(err)))
        setIsLoading(false)
      }
    }
  }, [region, timeRange])

  useEffect(() => {
    fetchData()

    return () => {
      abortRef.current?.abort()
    }
  }, [fetchData])

  return { data, isLoading, error, refetch: fetchData }
}
