'use client'

import { useState, useMemo } from 'react'
import { Sprout } from 'lucide-react'
import { RegionSelector } from '@/components/shared/region-selector'
import { TableSkeleton, CardSkeleton } from '@/components/shared/loading-states'
import { EmptyState } from '@/components/shared/empty-state'
import { FarmingSettingsPanel } from '@/features/farming/components/farming-settings'
import { FarmingTable } from '@/features/farming/components/farming-table'
import { FarmingSummary } from '@/features/farming/components/farming-summary'
import { useFarmingPrices } from '@/features/farming/hooks/use-farming-prices'
import { CROPS } from '@/features/farming/utils/farming-data'
import {
  calculateFarmingProfit,
  type FarmingSettings,
  type FarmingResult,
} from '@/features/farming/utils/farming-calc'

export default function FarmingProfit() {
  const { prices, isLoading, error, refetch } = useFarmingPrices()

  const [settings, setSettings] = useState<FarmingSettings>({
    useFocus: false,
    isPremium: true,
    plotCount: 5,
  })

  const results: FarmingResult[] = useMemo(() => {
    if (prices.size === 0) return []

    return CROPS.map((crop) => {
      const seedPrice = prices.get(crop.seedId) ?? 0
      const cropPrice = prices.get(crop.id) ?? 0
      return calculateFarmingProfit(crop, seedPrice, cropPrice, settings)
    })
  }, [prices, settings])

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Farming Profit Calculator
          </h1>
          <p className="text-sm text-muted-foreground">
            Compare crop and herb profits to maximize your island farming
            income.
          </p>
        </div>
        <RegionSelector />
      </div>

      {/* Settings */}
      <FarmingSettingsPanel settings={settings} onChange={setSettings} />

      {/* Loading state */}
      {isLoading && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
          </div>
          <TableSkeleton rows={9} />
        </div>
      )}

      {/* Error state */}
      {error && !isLoading && (
        <EmptyState
          title="Failed to load prices"
          description={error}
          action={{ label: 'Retry', onClick: refetch }}
        />
      )}

      {/* Results */}
      {!isLoading && !error && results.length > 0 && (
        <>
          <FarmingSummary results={results} settings={settings} />
          <FarmingTable results={results} />
        </>
      )}

      {/* Empty state */}
      {!isLoading && !error && results.length === 0 && prices.size === 0 && (
        <EmptyState
          icon={<Sprout className="size-6" />}
          title="No price data"
          description="Unable to fetch market prices. Please try again."
          action={{ label: 'Retry', onClick: refetch }}
        />
      )}
    </div>
  )
}
