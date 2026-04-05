'use client'

import { useCallback, useEffect } from 'react'
import { useGameDataStore } from '@/lib/stores/game-data-store'
import { useTradeRoutesStore } from '@/lib/stores/trade-routes-store'
import { useRouteScanner } from '@/features/trade-routes/hooks/use-route-scanner'
import { RouteFilters } from '@/features/trade-routes/components/route-filters'
import { RouteStats } from '@/features/trade-routes/components/route-stats'
import { RouteTable } from '@/features/trade-routes/components/route-table'
import type { RouteFilters as RouteFiltersType } from '@/features/trade-routes/utils/trade-calc'

export default function TradeRoutePlanner() {
  const { loaded, loadGameData } = useGameDataStore()
  const store = useTradeRoutesStore()
  const scanner = useRouteScanner()

  // Ensure game data is loaded
  useEffect(() => {
    if (!loaded) {
      loadGameData()
    }
  }, [loaded, loadGameData])

  const handleScan = useCallback(() => {
    const filters: RouteFiltersType = {
      buyCity: store.buyCity,
      sellCity: store.sellCity,
      minTier: store.minTier,
      maxTier: store.maxTier,
      categories: store.categories,
      minProfit: store.minProfit,
      isPremium: store.isPremium,
      maxWeight: store.maxWeight,
    }
    scanner.scan(filters)
  }, [
    store.buyCity,
    store.sellCity,
    store.minTier,
    store.maxTier,
    store.categories,
    store.minProfit,
    store.isPremium,
    store.maxWeight,
    scanner.scan,
  ])

  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          Trade Route Planner
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Find the most profitable trading routes between cities
        </p>
      </div>

      {/* Error display */}
      {scanner.error && (
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {scanner.error}
        </div>
      )}

      {/* Filters */}
      <RouteFilters
        onScan={handleScan}
        isScanning={scanner.isScanning}
        progress={scanner.progress}
      />

      {/* Stats */}
      {scanner.routes.length > 0 && (
        <RouteStats routes={scanner.routes} maxWeight={store.maxWeight} />
      )}

      {/* Results table */}
      <RouteTable
        routes={scanner.routes}
        isScanning={scanner.isScanning}
      />
    </div>
  )
}
