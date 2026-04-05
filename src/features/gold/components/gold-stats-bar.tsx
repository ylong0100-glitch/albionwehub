'use client'

import {
  TrendingUp,
  TrendingDown,
  ArrowUp,
  ArrowDown,
  BarChart3,
  Activity,
} from 'lucide-react'
import { StatCard } from '@/components/shared/stat-card'
import { CardSkeleton } from '@/components/shared/loading-states'
import { type GoldStats, formatGoldPrice, formatPercentChange } from '../utils/gold-stats'

interface GoldStatsBarProps {
  stats: GoldStats | null
  isLoading: boolean
}

export function GoldStatsBar({ stats, isLoading }: GoldStatsBarProps) {
  if (isLoading || !stats) {
    return (
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <CardSkeleton key={i} />
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
      <StatCard
        label="Current Price"
        value={formatGoldPrice(stats.currentPrice)}
        icon={<span className="text-lg font-bold text-amber-500">G</span>}
        className="border-amber-500/20"
      />
      <StatCard
        label="24h Change"
        value={`${stats.change24h >= 0 ? '+' : ''}${formatGoldPrice(stats.change24h)}`}
        delta={stats.change24hPercent}
        icon={
          stats.change24h >= 0 ? (
            <TrendingUp className="size-5 text-green-500" />
          ) : (
            <TrendingDown className="size-5 text-red-500" />
          )
        }
      />
      <StatCard
        label="24h High"
        value={formatGoldPrice(stats.high24h)}
        icon={<ArrowUp className="size-5 text-green-500" />}
      />
      <StatCard
        label="24h Low"
        value={formatGoldPrice(stats.low24h)}
        icon={<ArrowDown className="size-5 text-red-500" />}
      />
      <StatCard
        label="Average"
        value={formatGoldPrice(Math.round(stats.avgPrice))}
        icon={<BarChart3 className="size-5 text-amber-500" />}
      />
      <StatCard
        label="Volatility"
        value={`\u00B1${stats.volatility.toFixed(0)}`}
        icon={<Activity className="size-5 text-blue-500" />}
      />
    </div>
  )
}
