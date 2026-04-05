'use client'

import { useState, useCallback, useRef, useEffect, useMemo } from 'react'
import type { PriceEntry } from '@/lib/api/albion-data'
import {
  type RefiningResourceType,
  getItemIdsForResourceType,
} from '../utils/refining-calc'

interface UseRefiningPricesReturn {
  prices: Record<string, number>
  isLoading: boolean
  error: string | null
  refetch: () => void
}

export function useRefiningPrices(
  resourceType: RefiningResourceType,
  city: string,
  region: string = 'west',
): UseRefiningPricesReturn {
  const [data, setData] = useState<PriceEntry[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const abortRef = useRef<AbortController | null>(null)

  const itemIds = useMemo(
    () => getItemIdsForResourceType(resourceType),
    [resourceType],
  )

  const fetchPrices = useCallback(async () => {
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
      params.set('region', region)
      if (city) params.set('locations', city)

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
      const message =
        err instanceof Error ? err.message : 'Failed to fetch prices'
      if (!controller.signal.aborted) {
        setError(message)
      }
    } finally {
      if (!controller.signal.aborted) {
        setIsLoading(false)
      }
    }
  }, [itemIds.join(','), city, region])

  useEffect(() => {
    if (itemIds.length > 0) {
      fetchPrices()
    }
    return () => {
      abortRef.current?.abort()
    }
  }, [fetchPrices])

  // Convert PriceEntry[] to Record<itemId, price>
  // Use sell_price_min as the primary price
  const prices = useMemo(() => {
    const map: Record<string, number> = {}
    for (const entry of data) {
      // If we have multiple entries for same item (different cities),
      // use the lowest sell price
      const existing = map[entry.item_id]
      const price = entry.sell_price_min
      if (price > 0 && (existing === undefined || price < existing)) {
        map[entry.item_id] = price
      }
    }
    return map
  }, [data])

  return { prices, isLoading, error, refetch: fetchPrices }
}
