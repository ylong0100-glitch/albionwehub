'use client'

import { useMemo } from 'react'
import { usePrices } from '@/features/market/hooks/use-prices'
import type { PriceEntry } from '@/lib/api/albion-data'
import { getAllItemIdsForRecipe, type Recipe } from '@/features/crafting/utils/crafting-calc'

interface UseCraftingPricesReturn {
  materialPrices: Record<string, number>
  productPrice: number
  isLoading: boolean
  error: string | null
  refetch: () => void
}

/**
 * Fetches prices for all materials and the product of a given recipe.
 * Batches all item IDs into a single API call.
 */
export function useCraftingPrices(
  recipe: Recipe | null,
  city: string,
): UseCraftingPricesReturn {
  const itemIds = useMemo(
    () => (recipe ? getAllItemIdsForRecipe(recipe) : []),
    [recipe],
  )

  // Map city names to API location format
  const locationMap: Record<string, string> = {
    Caerleon: 'Caerleon',
    Bridgewatch: 'Bridgewatch',
    'Fort Sterling': 'Fort Sterling',
    Lymhurst: 'Lymhurst',
    Martlock: 'Martlock',
    Thetford: 'Thetford',
  }

  const locations = useMemo(() => {
    const loc = locationMap[city] ?? city
    return [loc]
  }, [city])

  const { data, isLoading, error, refetch } = usePrices(itemIds, {
    locations,
    qualities: [1],
  })

  // Extract best sell prices per item from price data
  const { materialPrices, productPrice } = useMemo(() => {
    if (!recipe || !data.length) {
      return { materialPrices: {} as Record<string, number>, productPrice: 0 }
    }

    const priceMap: Record<string, number> = {}

    for (const entry of data) {
      const current = priceMap[entry.item_id]
      const price = entry.sell_price_min > 0 ? entry.sell_price_min : 0

      // Take the lowest non-zero sell price
      if (price > 0 && (current === undefined || price < current)) {
        priceMap[entry.item_id] = price
      }
    }

    const matPrices: Record<string, number> = {}
    for (const mat of recipe.materials) {
      matPrices[mat.itemId] = priceMap[mat.itemId] ?? 0
    }

    return {
      materialPrices: matPrices,
      productPrice: priceMap[recipe.itemId] ?? 0,
    }
  }, [recipe, data])

  return {
    materialPrices,
    productPrice,
    isLoading,
    error,
    refetch,
  }
}
