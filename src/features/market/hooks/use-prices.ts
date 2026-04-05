'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import type { PriceEntry } from '@/lib/api/albion-data'

interface UsePricesOptions {
  locations?: string[]
  qualities?: number[]
  region?: string
}

interface UsePricesReturn {
  data: PriceEntry[]
  isLoading: boolean
  error: string | null
  refetch: () => void
}

export function usePrices(
  itemIds: string[],
  options: UsePricesOptions = {},
): UsePricesReturn {
  const [data, setData] = useState<PriceEntry[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const abortRef = useRef<AbortController | null>(null)

  const fetchPrices = useCallback(async () => {
    if (!itemIds.length) {
      setData([])
      return
    }

    // Cancel previous request
    abortRef.current?.abort()
    const controller = new AbortController()
    abortRef.current = controller

    setIsLoading(true)
    setError(null)

    try {
      const params = new URLSearchParams()
      params.set('items', itemIds.join(','))

      if (options.region) params.set('region', options.region)
      if (options.locations?.length) {
        params.set('locations', options.locations.join(','))
      }
      if (options.qualities?.length) {
        params.set('qualities', options.qualities.join(','))
      }

      const response = await fetch(`/api/v1/prices?${params.toString()}`, {
        signal: controller.signal,
        headers: { Accept: 'application/json' },
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const result: PriceEntry[] = await response.json()
      if (!controller.signal.aborted) {
        setData(result)
      }
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') return
      const message = err instanceof Error ? err.message : 'Failed to fetch prices'
      if (!controller.signal.aborted) {
        setError(message)
      }
    } finally {
      if (!controller.signal.aborted) {
        setIsLoading(false)
      }
    }
  }, [itemIds.join(','), options.region, options.locations?.join(','), options.qualities?.join(',')])

  // Auto-fetch when dependencies change
  useEffect(() => {
    if (itemIds.length > 0) {
      fetchPrices()
    }

    return () => {
      abortRef.current?.abort()
    }
  }, [fetchPrices])

  return { data, isLoading, error, refetch: fetchPrices }
}
