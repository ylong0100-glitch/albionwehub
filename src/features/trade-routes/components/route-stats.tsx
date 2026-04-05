'use client'

import { useMemo } from 'react'
import { Route, TrendingUp, Percent, Weight } from 'lucide-react'
import { StatCard } from '@/components/shared/stat-card'
import type { TradeRoute } from '../utils/trade-calc'

interface RouteStatsProps {
  routes: TradeRoute[]
  maxWeight: number
}

function formatSilver(amount: number): string {
  if (amount >= 1_000_000) return `${(amount / 1_000_000).toFixed(1)}M`
  if (amount >= 1_000) return `${(amount / 1_000).toFixed(1)}K`
  return amount.toLocaleString('en-US')
}

export function RouteStats({ routes, maxWeight }: RouteStatsProps) {
  const stats = useMemo(() => {
    if (!routes.length) {
      return {
        totalRoutes: 0,
        bestProfit: null as TradeRoute | null,
        bestMargin: null as TradeRoute | null,
        totalVolume: 0,
      }
    }

    let bestProfit = routes[0]
    let bestMargin = routes[0]

    for (const route of routes) {
      if (route.netProfit > bestProfit.netProfit) bestProfit = route
      if (route.profitMargin > bestMargin.profitMargin) bestMargin = route
    }

    // Calculate total volume if carrying max weight with best profit/kg items
    let totalVolume = 0
    if (maxWeight > 0) {
      // Sort by profitPerWeight, pick items greedily
      const weightRoutes = routes
        .filter((r) => r.weight !== undefined && r.weight > 0 && r.profitPerWeight !== undefined)
        .sort((a, b) => (b.profitPerWeight ?? 0) - (a.profitPerWeight ?? 0))

      let remainingWeight = maxWeight
      for (const route of weightRoutes) {
        if (remainingWeight <= 0) break
        if (route.weight === undefined) continue
        const qty = Math.floor(remainingWeight / route.weight)
        if (qty > 0) {
          totalVolume += qty * route.netProfit
          remainingWeight -= qty * route.weight
        }
      }
    }

    return { totalRoutes: routes.length, bestProfit, bestMargin, totalVolume }
  }, [routes, maxWeight])

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <StatCard
        label="Profitable Routes"
        value={stats.totalRoutes.toLocaleString()}
        icon={<Route className="size-5" />}
      />
      <StatCard
        label="Best Profit"
        value={
          stats.bestProfit
            ? `${formatSilver(stats.bestProfit.netProfit)} silver`
            : 'N/A'
        }
        icon={<TrendingUp className="size-5" />}
      />
      <StatCard
        label="Best Margin"
        value={
          stats.bestMargin
            ? `${stats.bestMargin.profitMargin.toFixed(1)}%`
            : 'N/A'
        }
        icon={<Percent className="size-5" />}
      />
      <StatCard
        label={maxWeight > 0 ? 'Est. Full Load Profit' : 'Avg Profit'}
        value={
          maxWeight > 0 && stats.totalVolume > 0
            ? `${formatSilver(stats.totalVolume)} silver`
            : stats.totalRoutes > 0
              ? `${formatSilver(
                  Math.round(
                    routes.reduce((sum, r) => sum + r.netProfit, 0) /
                      routes.length,
                  ),
                )} silver`
              : 'N/A'
        }
        icon={<Weight className="size-5" />}
      />
    </div>
  )
}
