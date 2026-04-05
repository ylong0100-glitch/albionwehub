'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import type { HistoryEntry } from '@/lib/api/albion-data'

interface UsePriceHistoryOptions {
  locations?: string[]
  qualities?: number[]
  region?: string
  timeScale?: 1 | 6 | 24
}

interface UsePriceHistoryReturn {
  data: HistoryEntry[]
  isLoading: boolean
  error: string | null
  refetch: () => void
}

export function usePriceHistory(
  itemIds: string[],
  options: UsePriceHistoryOptions = {},
): UsePriceHistoryReturn {
  const [data, setData] = useState<HistoryEntry[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const abortRef = useRef<AbortController | null>(null)

  const fetchHistory = useCallback(async () => {
    if (!itemIds.length) {
      setData([])
      return
    }

    abortRef.current?.abort()
    const controller = new AbortController()
    abortRef.current = controller

    setIsLoading(true)
    setError(null)

    try {
      const params = new URLSearchParams()
      params.set('items', itemIds.join(','))
      params.set('time-scale', String(options.timeScale ?? 6))

      if (options.region) params.set('region', options.region)
      if (options.locations?.length) {
        params.set('locations', options.locations.join(','))
      }
      if (options.qualities?.length) {
        params.set('qualities', options.qualities.join(','))
      }

      const response = await fetch(`/api/v1/history?${params.toString()}`, {
        signal: controller.signal,
        headers: { Accept: 'application/json' },
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const result: HistoryEntry[] = await response.json()
      if (!controller.signal.aborted) {
        setData(result)
      }
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') return
      const message =
        err instanceof Error ? err.message : 'Failed to fetch price history'
      if (!controller.signal.aborted) {
        setError(message)
      }
    } finally {
      if (!controller.signal.aborted) {
        setIsLoading(false)
      }
    }
  }, [itemIds.join(','), options.region, options.locations?.join(','), options.qualities?.join(','), options.timeScale])

  useEffect(() => {
    if (itemIds.length > 0) {
      fetchHistory()
    }

    return () => {
      abortRef.current?.abort()
    }
  }, [fetchHistory])

  return { data, isLoading, error, refetch: fetchHistory }
}
