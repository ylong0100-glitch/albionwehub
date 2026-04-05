'use client'

import {
  Wallet,
  TrendingUp,
  TrendingDown,
  DollarSign,
  BarChart3,
  Layers,
} from 'lucide-react'
import { usePortfolioStore } from '@/lib/stores/portfolio-store'
import { calcPortfolioSummary, calcRealizedPnL } from '../utils/portfolio-calc'
import { StatCard } from '@/components/shared/stat-card'

function formatSilver(amount: number): string {
  if (Math.abs(amount) >= 1_000_000) {
    return `${(amount / 1_000_000).toFixed(2)}M`
  }
  if (Math.abs(amount) >= 1_000) {
    return `${(amount / 1_000).toFixed(1)}K`
  }
  return amount.toLocaleString('en-US')
}

export function PortfolioSummary() {
  const positions = usePortfolioStore((s) => s.positions)
  const tradeLog = usePortfolioStore((s) => s.tradeLog)

  // Without live prices, use avgBuyPrice as current price (P&L = 0 for unrealized)
  const currentPrices: Record<string, number> = {}
  for (const pos of positions) {
    currentPrices[pos.id] = pos.avgBuyPrice
  }

  const summary = calcPortfolioSummary(positions, currentPrices)
  const realizedPnL = calcRealizedPnL(tradeLog)

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
      <StatCard
        label="Total Portfolio Value"
        value={`${formatSilver(summary.totalValue)} Silver`}
        icon={<Wallet className="size-5" />}
      />
      <StatCard
        label="Total Cost Basis"
        value={`${formatSilver(summary.totalCost)} Silver`}
        icon={<DollarSign className="size-5" />}
      />
      <StatCard
        label="Unrealized P&L"
        value={`${summary.totalPnL >= 0 ? '+' : ''}${formatSilver(summary.totalPnL)} Silver`}
        delta={summary.totalPnLPercent}
        icon={
          summary.totalPnL >= 0 ? (
            <TrendingUp className="size-5" />
          ) : (
            <TrendingDown className="size-5" />
          )
        }
      />
      <StatCard
        label="Realized P&L"
        value={`${realizedPnL >= 0 ? '+' : ''}${formatSilver(realizedPnL)} Silver`}
        icon={<BarChart3 className="size-5" />}
      />
      <StatCard
        label="Positions"
        value={summary.positionCount}
        icon={<Layers className="size-5" />}
      />
    </div>
  )
}
