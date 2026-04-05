'use client'

import { useMemo } from 'react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { REGIONS } from '@/lib/utils/constants'
import { useGoldStore } from '@/lib/stores/gold-store'
import { useGoldPrices } from '../hooks/use-gold-prices'
import { calculateGoldStats, formatGoldPrice, formatPercentChange } from '../utils/gold-stats'
import type { Region } from '@/types'

// ---------------------------------------------------------------------------
// Region color mapping
// ---------------------------------------------------------------------------
const REGION_BADGE_STYLES: Record<Region, string> = {
  west: 'bg-amber-500/10 text-amber-600 border-amber-500/30',
  east: 'bg-blue-500/10 text-blue-600 border-blue-500/30',
  europe: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30',
}

const REGION_DOT_COLOR: Record<Region, string> = {
  west: 'bg-amber-500',
  east: 'bg-blue-500',
  europe: 'bg-emerald-500',
}

// ---------------------------------------------------------------------------
// Single region row component
// ---------------------------------------------------------------------------
function RegionRow({ region }: { region: Region }) {
  const timeRange = useGoldStore((s) => s.timeRange)
  const { data, isLoading } = useGoldPrices(region, timeRange)

  const stats = useMemo(() => {
    if (data.length === 0) return null
    return calculateGoldStats(data)
  }, [data])

  const regionInfo = REGIONS.find((r) => r.id === region)

  if (isLoading) {
    return (
      <tr className="animate-pulse">
        <td className="p-3">
          <div className="h-4 w-16 rounded bg-muted" />
        </td>
        {Array.from({ length: 5 }).map((_, i) => (
          <td key={i} className="p-3">
            <div className="h-4 w-14 rounded bg-muted" />
          </td>
        ))}
      </tr>
    )
  }

  if (!stats) {
    return (
      <tr>
        <td className="p-3 text-sm font-medium">{regionInfo?.shortLabel ?? region}</td>
        <td colSpan={5} className="p-3 text-sm text-muted-foreground">
          No data available
        </td>
      </tr>
    )
  }

  return (
    <tr className="border-t border-border/50">
      <td className="p-3">
        <div className="flex items-center gap-2">
          <span className={cn('size-2 rounded-full', REGION_DOT_COLOR[region])} />
          <span className="text-sm font-medium">{regionInfo?.shortLabel ?? region}</span>
        </div>
      </td>
      <td className="p-3 font-mono text-sm font-semibold tabular-nums">
        {formatGoldPrice(stats.currentPrice)}
      </td>
      <td className="p-3">
        <span
          className={cn(
            'text-sm font-medium tabular-nums',
            stats.change24hPercent >= 0 ? 'text-green-500' : 'text-red-500'
          )}
        >
          {formatPercentChange(stats.change24hPercent)}
        </span>
      </td>
      <td className="p-3 font-mono text-sm tabular-nums text-green-600">
        {formatGoldPrice(stats.high24h)}
      </td>
      <td className="p-3 font-mono text-sm tabular-nums text-red-500">
        {formatGoldPrice(stats.low24h)}
      </td>
      <td className="p-3 font-mono text-sm tabular-nums">
        {formatGoldPrice(Math.round(stats.avgPrice))}
      </td>
    </tr>
  )
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------
export function GoldRegionCompare() {
  const selectedRegions = useGoldStore((s) => s.selectedRegions)
  const toggleRegion = useGoldStore((s) => s.toggleRegion)

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
        <h3 className="text-sm font-medium text-muted-foreground">Region Comparison</h3>
        <div className="flex items-center gap-1.5">
          {REGIONS.map(({ id, shortLabel }) => {
            const isActive = selectedRegions.includes(id)
            return (
              <Button
                key={id}
                variant="outline"
                size="sm"
                className={cn(
                  'h-7 gap-1.5 text-xs',
                  isActive && REGION_BADGE_STYLES[id]
                )}
                onClick={() => toggleRegion(id)}
              >
                <span className={cn('size-1.5 rounded-full', REGION_DOT_COLOR[id])} />
                {shortLabel}
              </Button>
            )
          })}
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-xs text-muted-foreground">
                <th className="p-3 font-medium">Region</th>
                <th className="p-3 font-medium">Price</th>
                <th className="p-3 font-medium">24h Change</th>
                <th className="p-3 font-medium">24h High</th>
                <th className="p-3 font-medium">24h Low</th>
                <th className="p-3 font-medium">Average</th>
              </tr>
            </thead>
            <tbody>
              {selectedRegions.map((region) => (
                <RegionRow key={region} region={region} />
              ))}
            </tbody>
          </table>
        </div>

        {/* Spread comparison when multiple regions */}
        {selectedRegions.length >= 2 && (
          <SpreadDisplay regions={selectedRegions} />
        )}
      </CardContent>
    </Card>
  )
}

// ---------------------------------------------------------------------------
// Spread display
// ---------------------------------------------------------------------------
function SpreadDisplay({ regions }: { regions: Region[] }) {
  const timeRange = useGoldStore((s) => s.timeRange)

  // Fetch all region data
  const regionData = regions.map((region) => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const { data } = useGoldPrices(region, timeRange)
    return { region, data }
  })

  const spreads = useMemo(() => {
    const result: { pair: string; spread: number }[] = []
    for (let i = 0; i < regionData.length; i++) {
      for (let j = i + 1; j < regionData.length; j++) {
        const a = regionData[i]
        const b = regionData[j]
        if (a.data.length > 0 && b.data.length > 0) {
          const labelA = REGIONS.find((r) => r.id === a.region)?.shortLabel ?? a.region
          const labelB = REGIONS.find((r) => r.id === b.region)?.shortLabel ?? b.region
          result.push({
            pair: `${labelA} / ${labelB}`,
            spread: a.data[0].price - b.data[0].price,
          })
        }
      }
    }
    return result
  }, [regionData])

  if (spreads.length === 0) return null

  return (
    <div className="mt-4 flex flex-wrap gap-3 border-t border-border/50 pt-4">
      <span className="text-xs font-medium text-muted-foreground">Spread:</span>
      {spreads.map(({ pair, spread }) => (
        <Badge
          key={pair}
          variant="secondary"
          className="gap-1 font-mono text-xs tabular-nums"
        >
          {pair}: {spread >= 0 ? '+' : ''}{formatGoldPrice(spread)}
        </Badge>
      ))}
    </div>
  )
}
