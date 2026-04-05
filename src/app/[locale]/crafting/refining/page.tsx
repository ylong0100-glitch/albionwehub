'use client'

import { useState } from 'react'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { StatCard } from '@/components/shared/stat-card'
import { Flame, TrendingUp, Coins, Zap } from 'lucide-react'
import { ResourceTypeSelector } from '@/features/refining/components/resource-type-selector'
import { RefiningSettings } from '@/features/refining/components/refining-settings'
import { RefiningTable } from '@/features/refining/components/refining-table'
import { useRefiningPrices } from '@/features/refining/hooks/use-refining-prices'
import {
  type RefiningResourceType,
  RESOURCE_TYPE_INFO,
  getRefiningRecipes,
  calculateRefining,
  getReturnRate,
  findBestRefining,
} from '@/features/refining/utils/refining-calc'

export default function RefiningCalculator() {
  const [resourceType, setResourceType] = useState<RefiningResourceType>('ORE')
  const [city, setCity] = useState('Fort Sterling')
  const [useFocus, setUseFocus] = useState(true)
  const [quantity, setQuantity] = useState(1)

  const { prices, isLoading, error, refetch } = useRefiningPrices(
    resourceType,
    city,
  )

  // Calculate summary stats
  const returnRate = getReturnRate(useFocus, city, resourceType)
  const recipes = getRefiningRecipes(resourceType)
  const results = recipes.map((r) =>
    calculateRefining(r, prices, returnRate, quantity),
  )
  const bestIdx = findBestRefining(results)
  const bestResult = bestIdx >= 0 ? results[bestIdx] : null

  const totalProfit = results.reduce(
    (sum, r) => sum + (r.profit > 0 ? r.profit : 0),
    0,
  )
  const avgProfitPerFocus =
    useFocus && results.length > 0
      ? results.reduce((sum, r) => sum + r.profitPerFocus, 0) / results.length
      : 0

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          Refining Calculator
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Calculate refining profits for all resource types. Compare tiers and
          find the best opportunities.
        </p>
      </div>

      <Separator />

      {/* Resource type selector */}
      <ResourceTypeSelector
        selected={resourceType}
        onChange={(type) => {
          setResourceType(type)
          // Auto-set best city for the resource
          setCity(RESOURCE_TYPE_INFO[type].cityBonus)
        }}
      />

      {/* Settings */}
      <RefiningSettings
        city={city}
        onCityChange={setCity}
        useFocus={useFocus}
        onFocusChange={setUseFocus}
        quantity={quantity}
        onQuantityChange={setQuantity}
        resourceType={resourceType}
      />

      {/* Summary stat cards */}
      {!isLoading && Object.keys(prices).length > 0 && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            label="Best Tier"
            value={bestResult ? `T${bestResult.tier}` : '--'}
            icon={<TrendingUp className="size-5" />}
          />
          <StatCard
            label="Best Profit"
            value={
              bestResult && bestResult.profit > 0
                ? `${bestResult.profit >= 1000 ? `${(bestResult.profit / 1000).toFixed(1)}K` : bestResult.profit.toFixed(0)}`
                : '0'
            }
            icon={<Coins className="size-5" />}
          />
          <StatCard
            label="Return Rate"
            value={`${(returnRate * 100).toFixed(1)}%`}
            icon={<Flame className="size-5" />}
          />
          <StatCard
            label="Avg Silver/Focus"
            value={
              useFocus ? avgProfitPerFocus.toFixed(1) : '--'
            }
            icon={<Zap className="size-5" />}
          />
        </div>
      )}

      {/* Error state */}
      {error && (
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4">
          <p className="text-sm text-destructive">{error}</p>
          <button
            onClick={refetch}
            className="mt-2 text-xs font-medium text-destructive underline"
          >
            Retry
          </button>
        </div>
      )}

      {/* Refining table */}
      <RefiningTable
        resourceType={resourceType}
        prices={prices}
        isLoading={isLoading}
        city={city}
        useFocus={useFocus}
        quantity={quantity}
      />
    </div>
  )
}
