'use client'

import { useState, useMemo } from 'react'
import { PawPrint, TrendingUp, Zap } from 'lucide-react'
import { RegionSelector } from '@/components/shared/region-selector'
import { StatCard } from '@/components/shared/stat-card'
import { TableSkeleton, CardSkeleton } from '@/components/shared/loading-states'
import { EmptyState } from '@/components/shared/empty-state'
import { BreedingSettingsPanel } from '@/features/breeding/components/breeding-settings'
import { BreedingTable } from '@/features/breeding/components/breeding-table'
import { useBreedingPrices } from '@/features/breeding/hooks/use-breeding-prices'
import { ANIMALS } from '@/features/breeding/utils/breeding-data'
import {
  calculateBreedingProfit,
  findBestAnimal,
  type BreedingSettings,
  type BreedingResult,
} from '@/features/breeding/utils/breeding-calc'

function formatNumber(n: number): string {
  return Math.round(n).toLocaleString('en-US')
}

export default function BreedingCalculator() {
  const { prices, isLoading, error, refetch } = useBreedingPrices()

  const [settings, setSettings] = useState<BreedingSettings>({
    useFocus: false,
    isPremium: true,
    pastureCount: 3,
  })

  const results: BreedingResult[] = useMemo(() => {
    if (prices.size === 0) return []

    return ANIMALS.map((animal) => {
      const babyPrice = prices.get(animal.id) ?? 0
      const adultPrice = prices.get(animal.adultId) ?? 0
      const foodPrice = prices.get(animal.foodType) ?? 0
      return calculateBreedingProfit(
        animal,
        babyPrice,
        adultPrice,
        foodPrice,
        settings,
      )
    })
  }, [prices, settings])

  const best = useMemo(() => findBestAnimal(results), [results])

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Breeding Calculator
          </h1>
          <p className="text-sm text-muted-foreground">
            Compare animal breeding profits to optimize your pasture income.
          </p>
        </div>
        <RegionSelector />
      </div>

      {/* Settings */}
      <BreedingSettingsPanel settings={settings} onChange={setSettings} />

      {/* Loading state */}
      {isLoading && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
          </div>
          <TableSkeleton rows={8} />
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
          {/* Summary cards */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <StatCard
              label="Best Animal"
              value={best?.animal.name ?? 'N/A'}
              icon={<PawPrint className="size-5" />}
            />
            <StatCard
              label="Best Daily Profit"
              value={
                best ? `${formatNumber(best.dailyProfit)} silver` : 'N/A'
              }
              icon={<TrendingUp className="size-5" />}
            />
            <StatCard
              label="Profit per Focus"
              value={
                best && best.profitPerFocus > 0
                  ? best.profitPerFocus.toFixed(2)
                  : 'N/A'
              }
              icon={<Zap className="size-5" />}
            />
          </div>

          <BreedingTable results={results} />
        </>
      )}

      {/* Empty state */}
      {!isLoading && !error && results.length === 0 && prices.size === 0 && (
        <EmptyState
          icon={<PawPrint className="size-6" />}
          title="No price data"
          description="Unable to fetch market prices. Please try again."
          action={{ label: 'Retry', onClick: refetch }}
        />
      )}
    </div>
  )
}
