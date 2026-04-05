'use client'

import * as React from 'react'
import { Star, X, ChevronDown, ChevronUp, RefreshCw } from 'lucide-react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import { ItemIcon } from '@/components/shared/item-icon'
import { useMarketStore } from '@/lib/stores/market-store'
import { usePrices } from '../hooks/use-prices'
import { formatSilver, formatRelativeTime, formatItemName } from '../utils/format'

interface FavoritesPanelProps {
  region: string
  locations: string[]
  onSelectItem: (itemId: string) => void
  className?: string
}

export function FavoritesPanel({
  region,
  locations,
  onSelectItem,
  className,
}: FavoritesPanelProps) {
  const [collapsed, setCollapsed] = React.useState(false)
  const { favorites, removeFavorite } = useMarketStore()

  const {
    data: priceData,
    isLoading,
    refetch,
  } = usePrices(favorites, {
    region,
    locations,
    qualities: [1],
  })

  // Best sell price per item (lowest sell_price_min across cities)
  const bestPrices = React.useMemo(() => {
    const map = new Map<string, { price: number; city: string; date: string }>()
    for (const entry of priceData) {
      const existing = map.get(entry.item_id)
      if (
        entry.sell_price_min > 0 &&
        (!existing || entry.sell_price_min < existing.price)
      ) {
        map.set(entry.item_id, {
          price: entry.sell_price_min,
          city: entry.city,
          date: entry.sell_price_min_date,
        })
      }
    }
    return map
  }, [priceData])

  if (favorites.length === 0) {
    return (
      <Card className={className}>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Star className="size-4 text-amber-400" />
            <h3 className="text-sm font-semibold">Favorites</h3>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-center text-sm text-muted-foreground">
            No favorites yet. Click the star icon on any item to add it here.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Star className="size-4 fill-amber-400 text-amber-400" />
            <h3 className="text-sm font-semibold">Favorites</h3>
            <Badge variant="secondary" className="text-xs">
              {favorites.length}
            </Badge>
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="size-7"
              onClick={() => refetch()}
              disabled={isLoading}
            >
              <RefreshCw className={cn('size-3', isLoading && 'animate-spin')} />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="size-7"
              onClick={() => setCollapsed((c) => !c)}
            >
              {collapsed ? (
                <ChevronDown className="size-3" />
              ) : (
                <ChevronUp className="size-3" />
              )}
            </Button>
          </div>
        </div>
      </CardHeader>

      {!collapsed && (
        <CardContent className="space-y-1 pt-0">
          {favorites.map((itemId) => {
            const best = bestPrices.get(itemId)

            return (
              <div
                key={itemId}
                onClick={() => onSelectItem(itemId)}
                className="flex cursor-pointer items-center justify-between rounded-md px-2 py-1.5 transition-colors hover:bg-accent/50"
              >
                <div className="flex items-center gap-2">
                  <ItemIcon itemId={itemId} size={24} className="shrink-0" />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">
                      {formatItemName(itemId)}
                    </p>
                    {best && (
                      <p className="text-xs text-muted-foreground">
                        {best.city} &middot; {formatRelativeTime(best.date)}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {isLoading ? (
                    <Skeleton className="h-4 w-14" />
                  ) : best ? (
                    <span className="font-mono text-sm tabular-nums text-foreground">
                      {formatSilver(best.price)}
                    </span>
                  ) : (
                    <span className="text-xs text-muted-foreground">-</span>
                  )}
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      removeFavorite(itemId)
                    }}
                    className="shrink-0 text-muted-foreground hover:text-destructive"
                  >
                    <X className="size-3.5" />
                  </button>
                </div>
              </div>
            )
          })}
        </CardContent>
      )}
    </Card>
  )
}
