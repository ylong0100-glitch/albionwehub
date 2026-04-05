'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useAppStore } from '@/lib/stores/app-store'
import { getAllBreedingItemIds } from '../utils/breeding-data'
import type { PriceEntry } from '@/lib/api/albion-data'

interface UseBreedingPricesReturn {
  prices: Map<string, number>
  isLoading: boolean
  error: string | null
  refetch: () => void
}

/**
 * Batch fetch prices for all breeding items (babies, adults, food) in one API call.
 * Returns a map of itemId -> sell_price_min (lowest across all cities).
 */
export function useBreedingPrices(): UseBreedingPricesReturn {
  const [prices, setPrices] = useState<Map<string, number>>(new Map())
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const abortRef = useRef<AbortController | null>(null)
  const region = useAppStore((s) => s.region)

  const fetchPrices = useCallback(async () => {
    abortRef.current?.abort()
    const controller = new AbortController()
    abortRef.current = controller

    setIsLoading(true)
    setError(null)

    try {
      const itemIds = getAllBreedingItemIds()
      const params = new URLSearchParams()
      params.set('items', itemIds.join(','))
      params.set('region', region)

      const response = await fetch(`/api/v1/prices?${params.toString()}`, {
        signal: controller.signal,
        headers: { Accept: 'application/json' },
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const data: PriceEntry[] = await response.json()

      // Build price map: for each item, use the lowest non-zero sell_price_min
      const priceMap = new Map<string, number>()
      for (const entry of data) {
        if (entry.sell_price_min <= 0) continue
        const existing = priceMap.get(entry.item_id)
        if (!existing || entry.sell_price_min < existing) {
          priceMap.set(entry.item_id, entry.sell_price_min)
        }
      }

      if (!controller.signal.aborted) {
        setPrices(priceMap)
      }
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') return
      const message =
        err instanceof Error ? err.message : 'Failed to fetch breeding prices'
      if (!controller.signal.aborted) {
        setError(message)
      }
    } finally {
      if (!controller.signal.aborted) {
        setIsLoading(false)
      }
    }
  }, [region])

  useEffect(() => {
    fetchPrices()
    return () => {
      abortRef.current?.abort()
    }
  }, [fetchPrices])

  return { prices, isLoading, error, refetch: fetchPrices }
}
