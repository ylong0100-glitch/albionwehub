'use client'

import * as React from 'react'
import { X, Star, StarOff, RefreshCw } from 'lucide-react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import { ItemIcon } from '@/components/shared/item-icon'
import { StatCard } from '@/components/shared/stat-card'
import { useMarketStore } from '@/lib/stores/market-store'
import { usePrices } from '../hooks/use-prices'
import { usePriceHistory } from '../hooks/use-price-history'
import {
  formatSilver,
  formatRelativeTime,
  formatItemName,
  CITY_COLORS,
} from '../utils/format'
import type { PriceEntry } from '@/lib/api/albion-data'

interface PriceDetailPanelProps {
  itemId: string
  region: string
  locations: string[]
  onClose: () => void
  className?: string
}

export function PriceDetailPanel({
  itemId,
  region,
  locations,
  onClose,
  className,
}: PriceDetailPanelProps) {
  const { addFavorite, removeFavorite, favorites } = useMarketStore()
  const isFav = favorites.includes(itemId)

  // Fetch all qualities for this item
  const {
    data: priceData,
    isLoading: pricesLoading,
    refetch: refetchPrices,
  } = usePrices([itemId], {
    region,
    locations,
    qualities: [1, 2, 3, 4, 5],
  })

  const {
    data: historyData,
    isLoading: historyLoading,
  } = usePriceHistory([itemId], {
    region,
    locations,
    timeScale: 6,
  })

  // Group prices by quality
  const qualityPrices = React.useMemo(() => {
    const map = new Map<number, PriceEntry[]>()
    for (const entry of priceData) {
      if (!map.has(entry.quality)) {
        map.set(entry.quality, [])
      }
      map.get(entry.quality)!.push(entry)
    }
    return map
  }, [priceData])

  // Find best buy/sell locations
  const bestLocations = React.useMemo(() => {
    // Quality 1 only for the summary
    const q1 = priceData.filter((e) => e.quality === 1)
    let bestSell: PriceEntry | null = null
    let bestBuy: PriceEntry | null = null

    for (const entry of q1) {
      if (
        entry.sell_price_min > 0 &&
        (!bestSell || entry.sell_price_min < bestSell.sell_price_min)
      ) {
        bestSell = entry
      }
      if (
        entry.buy_price_max > 0 &&
        (!bestBuy || entry.buy_price_max > bestBuy.buy_price_max)
      ) {
        bestBuy = entry
      }
    }

    return { bestSell, bestBuy }
  }, [priceData])

  // Build chart data
  const chartData = React.useMemo(() => {
    if (!historyData.length) return []

    // Merge all city history into a single timeline
    const timeMap = new Map<
      string,
      { name: string; _ts: number; [city: string]: string | number }
    >()

    for (const series of historyData) {
      for (const point of series.data) {
        const rawTs = new Date(point.timestamp).getTime()
        const label = new Date(point.timestamp).toLocaleString('en-US', {
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        })
        if (!timeMap.has(label)) {
          timeMap.set(label, { name: label, _ts: rawTs })
        }
        const row = timeMap.get(label)!
        row[series.location] = point.avg_price
      }
    }

    return Array.from(timeMap.values()).sort((a, b) => a._ts - b._ts)
  }, [historyData])

  const chartCities = React.useMemo(
    () => historyData.map((s) => s.location).filter((v, i, a) => a.indexOf(v) === i),
    [historyData],
  )

  const qualityNames: Record<number, string> = {
    1: 'Normal',
    2: 'Good',
    3: 'Outstanding',
    4: 'Excellent',
    5: 'Masterpiece',
  }

  const qualityColors: Record<number, string> = {
    1: '#b0b0b0',
    2: '#45a049',
    3: '#3498db',
    4: '#9b59b6',
    5: '#f1c40f',
  }

  return (
    <Card className={cn('overflow-hidden', className)}>
      <CardHeader className="flex flex-row items-center justify-between gap-4 pb-3">
        <div className="flex items-center gap-3">
          <ItemIcon itemId={itemId} size={40} />
          <div>
            <h3 className="text-lg font-bold">{formatItemName(itemId)}</h3>
            <p className="text-xs text-muted-foreground">{itemId}</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => (isFav ? removeFavorite(itemId) : addFavorite(itemId))}
          >
            {isFav ? (
              <Star className="size-4 fill-amber-400 text-amber-400" />
            ) : (
              <StarOff className="size-4" />
            )}
          </Button>
          <Button variant="ghost" size="icon" onClick={() => refetchPrices()}>
            <RefreshCw className="size-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="size-4" />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Summary stats */}
        {!pricesLoading && (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <StatCard
              label="Best Buy (Sell Order)"
              value={
                bestLocations.bestSell
                  ? formatSilver(bestLocations.bestSell.sell_price_min)
                  : 'N/A'
              }
            />
            <StatCard
              label="Best Buy Location"
              value={bestLocations.bestSell?.city ?? 'N/A'}
            />
            <StatCard
              label="Best Sell (Buy Order)"
              value={
                bestLocations.bestBuy
                  ? formatSilver(bestLocations.bestBuy.buy_price_max)
                  : 'N/A'
              }
            />
            <StatCard
              label="Best Sell Location"
              value={bestLocations.bestBuy?.city ?? 'N/A'}
            />
          </div>
        )}

        <Tabs defaultValue="prices" className="w-full">
          <TabsList>
            <TabsTrigger value="prices">All Qualities</TabsTrigger>
            <TabsTrigger value="history">Price History</TabsTrigger>
          </TabsList>

          {/* Quality breakdown tab */}
          <TabsContent value="prices" className="mt-4">
            {pricesLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {[1, 2, 3, 4, 5].map((quality) => {
                  const entries = qualityPrices.get(quality)
                  if (!entries?.length) return null

                  return (
                    <div key={quality} className="rounded-lg border border-border p-3">
                      <div className="mb-2 flex items-center gap-2">
                        <Badge
                          style={{
                            backgroundColor: qualityColors[quality],
                            color: quality === 5 ? '#000' : '#fff',
                          }}
                        >
                          {qualityNames[quality]}
                        </Badge>
                      </div>
                      <div className="overflow-x-auto">
                        <table className="w-full text-xs">
                          <thead>
                            <tr className="text-muted-foreground">
                              <th className="px-2 py-1 text-left font-medium">City</th>
                              <th className="px-2 py-1 text-right font-medium">Sell Min</th>
                              <th className="px-2 py-1 text-right font-medium">Sell Max</th>
                              <th className="px-2 py-1 text-right font-medium">Buy Max</th>
                              <th className="px-2 py-1 text-right font-medium">Spread</th>
                              <th className="px-2 py-1 text-right font-medium">Updated</th>
                            </tr>
                          </thead>
                          <tbody>
                            {entries.map((entry) => {
                              const spread =
                                entry.sell_price_min > 0 && entry.buy_price_max > 0
                                  ? entry.sell_price_min - entry.buy_price_max
                                  : 0
                              return (
                                <tr key={entry.city} className="border-t border-border/50">
                                  <td className="px-2 py-1.5">
                                    <span
                                      className="font-medium"
                                      style={{ color: CITY_COLORS[entry.city] }}
                                    >
                                      {entry.city}
                                    </span>
                                  </td>
                                  <td className="px-2 py-1.5 text-right font-mono tabular-nums">
                                    {formatSilver(entry.sell_price_min)}
                                  </td>
                                  <td className="px-2 py-1.5 text-right font-mono tabular-nums">
                                    {formatSilver(entry.sell_price_max)}
                                  </td>
                                  <td className="px-2 py-1.5 text-right font-mono tabular-nums">
                                    {formatSilver(entry.buy_price_max)}
                                  </td>
                                  <td
                                    className={cn(
                                      'px-2 py-1.5 text-right font-mono tabular-nums',
                                      spread > 0 ? 'text-green-500' : 'text-muted-foreground',
                                    )}
                                  >
                                    {spread > 0 ? formatSilver(spread) : '-'}
                                  </td>
                                  <td className="px-2 py-1.5 text-right text-muted-foreground">
                                    {formatRelativeTime(entry.sell_price_min_date)}
                                  </td>
                                </tr>
                              )
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </TabsContent>

          {/* History chart tab */}
          <TabsContent value="history" className="mt-4">
            {historyLoading ? (
              <Skeleton className="h-72 w-full" />
            ) : chartData.length > 0 ? (
              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis
                      dataKey="name"
                      tick={{ fontSize: 10 }}
                      stroke="hsl(var(--muted-foreground))"
                    />
                    <YAxis
                      tick={{ fontSize: 10 }}
                      stroke="hsl(var(--muted-foreground))"
                      tickFormatter={(v: number) => formatSilver(v)}
                    />
                    <RechartsTooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--popover))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                        fontSize: '12px',
                      }}
                      formatter={(value: number | string, name: string) => [
                        typeof value === 'number' ? formatSilver(value) : value,
                        name,
                      ]}
                    />
                    <Legend />
                    {chartCities.map((city) => (
                      <Line
                        key={city}
                        type="monotone"
                        dataKey={city}
                        stroke={CITY_COLORS[city] ?? '#888'}
                        strokeWidth={2}
                        dot={false}
                        connectNulls
                      />
                    ))}
                  </LineChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="flex h-48 items-center justify-center text-sm text-muted-foreground">
                No history data available
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
