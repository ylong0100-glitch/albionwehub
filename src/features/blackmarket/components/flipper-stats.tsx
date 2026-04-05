'use client'

import { TrendingUp, Coins, BarChart3, Target } from 'lucide-react'
import { cn } from '@/lib/utils'
import { StatCard } from '@/components/shared/stat-card'
import { formatSilver } from '@/lib/utils/format'
import type { FlipOpportunity } from '../utils/flipper-calc'

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------
interface FlipperStatsProps {
  opportunities: FlipOpportunity[]
  className?: string
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export function FlipperStats({ opportunities, className }: FlipperStatsProps) {
  const totalOpportunities = opportunities.length

  const bestFlip =
    opportunities.length > 0
      ? opportunities.reduce((best, curr) =>
          curr.netProfit > best.netProfit ? curr : best,
        )
      : null

  const avgMargin =
    opportunities.length > 0
      ? opportunities.reduce((sum, o) => sum + o.profitMargin, 0) /
        opportunities.length
      : 0

  const totalProfit = opportunities.reduce((sum, o) => sum + o.netProfit, 0)

  return (
    <div className={cn('grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4', className)}>
      <StatCard
        label="Total Opportunities"
        value={totalOpportunities.toLocaleString()}
        icon={<Target className="size-5" />}
      />
      <StatCard
        label="Best Flip"
        value={bestFlip ? formatSilver(bestFlip.netProfit) : '--'}
        icon={<TrendingUp className="size-5" />}
      />
      <StatCard
        label="Avg Margin"
        value={
          opportunities.length > 0
            ? `${(avgMargin * 100).toFixed(1)}%`
            : '--'
        }
        icon={<BarChart3 className="size-5" />}
      />
      <StatCard
        label="Total Potential Profit"
        value={totalProfit > 0 ? formatSilver(totalProfit) : '--'}
        icon={<Coins className="size-5" />}
      />
    </div>
  )
}
