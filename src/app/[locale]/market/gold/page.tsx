'use client'

import { useMemo } from 'react'
import { RefreshCw } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useAppStore } from '@/lib/stores/app-store'
import { useGoldStore } from '@/lib/stores/gold-store'
import { useGoldPrices } from '@/features/gold/hooks/use-gold-prices'
import { calculateGoldStats, formatGoldPrice } from '@/features/gold/utils/gold-stats'
import { TimeRangeSelector } from '@/features/gold/components/time-range-selector'
import { GoldStatsBar } from '@/features/gold/components/gold-stats-bar'
import { GoldChart } from '@/features/gold/components/gold-chart'
import { GoldRegionCompare } from '@/features/gold/components/gold-region-compare'
import type { Region } from '@/types'
import type { GoldPrice } from '@/lib/api/albion-data'

export default function GoldPriceTracker() {
  const region = useAppStore((s) => s.region)
  const selectedRegions = useGoldStore((s) => s.selectedRegions)
  const timeRange = useGoldStore((s) => s.timeRange)

  // Primary region data (the app-level selected region)
  const {
    data: primaryData,
    isLoading: primaryLoading,
    refetch: primaryRefetch,
  } = useGoldPrices(region, timeRange)

  // Stats computed from the primary region
  const stats = useMemo(() => {
    if (primaryData.length === 0) return null
    return calculateGoldStats(primaryData)
  }, [primaryData])

  // Build chart region data: always include primary region,
  // plus any extra regions from selectedRegions
  const chartRegions = useMemo(() => {
    const set = new Set<Region>([region, ...selectedRegions])
    return Array.from(set)
  }, [region, selectedRegions])

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold tracking-tight">Gold Price Tracker</h1>
          {stats && (
            <Badge
              variant="secondary"
              className="gap-1 border-amber-500/30 bg-amber-500/10 font-mono text-sm tabular-nums text-amber-600 dark:text-amber-400"
            >
              <GoldIcon />
              {formatGoldPrice(stats.currentPrice)}
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-3">
          <TimeRangeSelector />
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5"
            onClick={primaryRefetch}
            disabled={primaryLoading}
          >
            <RefreshCw className={cn('size-3.5', primaryLoading && 'animate-spin')} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Stats bar */}
      <GoldStatsBar stats={stats} isLoading={primaryLoading} />

      {/* Main chart */}
      <ChartWithMultiRegion
        regions={chartRegions}
        primaryRegion={region}
        primaryData={primaryData}
        primaryLoading={primaryLoading}
        timeRange={timeRange}
      />

      {/* Region comparison */}
      <GoldRegionCompare />
    </div>
  )
}

// ---------------------------------------------------------------------------
// Chart wrapper that fetches additional region data
// ---------------------------------------------------------------------------
function ChartWithMultiRegion({
  regions,
  primaryRegion,
  primaryData,
  primaryLoading,
  timeRange,
}: {
  regions: Region[]
  primaryRegion: Region
  primaryData: GoldPrice[]
  primaryLoading: boolean
  timeRange: ReturnType<typeof useGoldStore.getState>['timeRange']
}) {
  // Always call hooks for all 3 regions (Rules of Hooks: no conditional/loop calls)
  const westEnabled = regions.includes('west') && primaryRegion !== 'west'
  const eastEnabled = regions.includes('east') && primaryRegion !== 'east'
  const europeEnabled = regions.includes('europe') && primaryRegion !== 'europe'

  const westResult = useGoldPrices('west', timeRange)
  const eastResult = useGoldPrices('east', timeRange)
  const europeResult = useGoldPrices('europe', timeRange)

  const regionData = useMemo(() => {
    const result: Partial<Record<Region, GoldPrice[]>> = {
      [primaryRegion]: primaryData,
    }
    if (westEnabled && westResult.data.length > 0) result.west = westResult.data
    if (eastEnabled && eastResult.data.length > 0) result.east = eastResult.data
    if (europeEnabled && europeResult.data.length > 0) result.europe = europeResult.data
    return result
  }, [primaryRegion, primaryData, westEnabled, eastEnabled, europeEnabled, westResult.data, eastResult.data, europeResult.data])

  const isLoading = primaryLoading ||
    (westEnabled && westResult.isLoading) ||
    (eastEnabled && eastResult.isLoading) ||
    (europeEnabled && europeResult.isLoading)

  return <GoldChart regionData={regionData} isLoading={isLoading} timeRange={timeRange} />
}

// ---------------------------------------------------------------------------
// Small gold icon SVG
// ---------------------------------------------------------------------------
function GoldIcon() {
  return (
    <svg className="size-4 shrink-0" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="10" fill="#f59e0b" opacity="0.3" />
      <circle cx="12" cy="12" r="8" fill="#f59e0b" />
      <text
        x="12"
        y="16"
        textAnchor="middle"
        fontSize="10"
        fontWeight="bold"
        fill="#92400e"
      >
        G
      </text>
    </svg>
  )
}
