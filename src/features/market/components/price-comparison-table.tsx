'use client'

import * as React from 'react'
import { ArrowUpDown, Star, StarOff, ChevronDown, ChevronUp } from 'lucide-react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'
import { ItemIcon } from '@/components/shared/item-icon'
import { useMarketStore } from '@/lib/stores/market-store'
import type { PriceEntry } from '@/lib/api/albion-data'
import {
  formatSilver,
  formatRelativeTime,
  CITY_COLORS,
  getCityShortName,
  formatItemName,
} from '../utils/format'

interface PriceComparisonTableProps {
  data: PriceEntry[]
  isLoading: boolean
  cities: string[]
  onSelectItem: (itemId: string) => void
  selectedItemId?: string
  className?: string
}

type SortKey = 'item' | string // 'item' or city name
type SortDir = 'asc' | 'desc'

export function PriceComparisonTable({
  data,
  isLoading,
  cities,
  onSelectItem,
  selectedItemId,
  className,
}: PriceComparisonTableProps) {
  const [sortKey, setSortKey] = React.useState<SortKey>('item')
  const [sortDir, setSortDir] = React.useState<SortDir>('asc')

  const { addFavorite, removeFavorite, favorites } = useMarketStore()

  // Group data by item_id
  const grouped = React.useMemo(() => {
    const map = new Map<string, Map<string, PriceEntry>>()
    for (const entry of data) {
      if (!map.has(entry.item_id)) {
        map.set(entry.item_id, new Map())
      }
      map.get(entry.item_id)!.set(entry.city, entry)
    }
    return map
  }, [data])

  // All unique items
  const itemIds = React.useMemo(() => Array.from(grouped.keys()), [grouped])

  // Find min/max prices per item across cities
  const priceExtremes = React.useMemo(() => {
    const extremes = new Map<string, { min: number; max: number; minCity: string; maxCity: string }>()
    for (const [itemId, cityMap] of grouped) {
      let min = Infinity
      let max = 0
      let minCity = ''
      let maxCity = ''
      for (const [city, entry] of cityMap) {
        const price = entry.sell_price_min
        if (price > 0 && price < min) {
          min = price
          minCity = city
        }
        if (price > max) {
          max = price
          maxCity = city
        }
      }
      extremes.set(itemId, {
        min: min === Infinity ? 0 : min,
        max,
        minCity,
        maxCity,
      })
    }
    return extremes
  }, [grouped])

  // Sorting
  const sortedItems = React.useMemo(() => {
    const items = [...itemIds]
    items.sort((a, b) => {
      if (sortKey === 'item') {
        const cmp = a.localeCompare(b)
        return sortDir === 'asc' ? cmp : -cmp
      }
      // Sort by city price
      const aEntry = grouped.get(a)?.get(sortKey)
      const bEntry = grouped.get(b)?.get(sortKey)
      const aPrice = aEntry?.sell_price_min ?? 0
      const bPrice = bEntry?.sell_price_min ?? 0
      return sortDir === 'asc' ? aPrice - bPrice : bPrice - aPrice
    })
    return items
  }, [itemIds, sortKey, sortDir, grouped])

  const handleSort = React.useCallback(
    (key: SortKey) => {
      if (sortKey === key) {
        setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
      } else {
        setSortKey(key)
        setSortDir('asc')
      }
    },
    [sortKey],
  )

  const toggleFavorite = React.useCallback(
    (itemId: string, e: React.MouseEvent) => {
      e.stopPropagation()
      if (favorites.includes(itemId)) {
        removeFavorite(itemId)
      } else {
        addFavorite(itemId)
      }
    },
    [favorites, addFavorite, removeFavorite],
  )

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <Skeleton className="h-5 w-48" />
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex gap-4">
                {Array.from({ length: cities.length + 1 }).map((_, j) => (
                  <Skeleton key={j} className="h-10 flex-1" />
                ))}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (sortedItems.length === 0) {
    return null
  }

  const SortIcon = ({ column }: { column: SortKey }) => {
    if (sortKey !== column) return <ArrowUpDown className="ml-1 size-3 opacity-40" />
    return sortDir === 'asc' ? (
      <ChevronUp className="ml-1 size-3" />
    ) : (
      <ChevronDown className="ml-1 size-3" />
    )
  }

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold">Cross-City Price Comparison</h3>
          <Badge variant="secondary" className="text-xs">
            {sortedItems.length} item{sortedItems.length !== 1 ? 's' : ''}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="sticky left-0 z-10 bg-muted/50 px-4 py-2 text-left">
                  <button
                    onClick={() => handleSort('item')}
                    className="inline-flex items-center text-xs font-medium uppercase text-muted-foreground hover:text-foreground"
                  >
                    Item <SortIcon column="item" />
                  </button>
                </th>
                {cities.map((city) => (
                  <th key={city} className="px-3 py-2 text-right">
                    <button
                      onClick={() => handleSort(city)}
                      className="inline-flex items-center justify-end gap-1 text-xs font-medium uppercase hover:text-foreground"
                      style={{ color: CITY_COLORS[city] ?? undefined }}
                    >
                      <span
                        className="size-2 rounded-full"
                        style={{ backgroundColor: CITY_COLORS[city] ?? '#888' }}
                      />
                      {getCityShortName(city)}
                      <SortIcon column={city} />
                    </button>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sortedItems.map((itemId) => {
                const extreme = priceExtremes.get(itemId)
                const isFav = favorites.includes(itemId)

                return (
                  <tr
                    key={itemId}
                    onClick={() => onSelectItem(itemId)}
                    className={cn(
                      'cursor-pointer border-b border-border transition-colors hover:bg-accent/50',
                      selectedItemId === itemId && 'bg-accent',
                    )}
                  >
                    <td className="sticky left-0 z-10 bg-background px-4 py-2">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={(e) => toggleFavorite(itemId, e)}
                          className="shrink-0 text-muted-foreground hover:text-amber-400"
                        >
                          {isFav ? (
                            <Star className="size-4 fill-amber-400 text-amber-400" />
                          ) : (
                            <StarOff className="size-4" />
                          )}
                        </button>
                        <ItemIcon itemId={itemId} size={28} className="shrink-0" />
                        <span className="truncate font-medium text-foreground">
                          {formatItemName(itemId)}
                        </span>
                      </div>
                    </td>
                    {cities.map((city) => {
                      const entry = grouped.get(itemId)?.get(city)
                      const price = entry?.sell_price_min ?? 0
                      const isMin = price > 0 && extreme?.min === price
                      const isMax = price > 0 && extreme?.max === price && extreme.min !== extreme.max

                      return (
                        <td key={city} className="px-3 py-2 text-right">
                          {price > 0 ? (
                            <TooltipProvider delayDuration={200}>
                              <Tooltip>
                                <TooltipTrigger>
                                  <span
                                    className={cn(
                                      'font-mono text-sm tabular-nums',
                                      isMin && 'font-bold text-green-500',
                                      isMax && 'font-bold text-red-500',
                                    )}
                                  >
                                    {formatSilver(price)}
                                  </span>
                                  <p className="text-xs text-muted-foreground">
                                    {formatRelativeTime(
                                      entry?.sell_price_min_date ?? '',
                                    )}
                                  </p>
                                </TooltipTrigger>
                                <TooltipContent side="top" className="text-xs">
                                  <div className="space-y-1">
                                    <p>
                                      Sell: {formatSilver(entry?.sell_price_min ?? 0)} -{' '}
                                      {formatSilver(entry?.sell_price_max ?? 0)}
                                    </p>
                                    <p>
                                      Buy: {formatSilver(entry?.buy_price_max ?? 0)} -{' '}
                                      {formatSilver(entry?.buy_price_min ?? 0)}
                                    </p>
                                    <p>
                                      Updated: {formatRelativeTime(entry?.sell_price_min_date ?? '')}
                                    </p>
                                  </div>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </td>
                      )
                    })}
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )
}
