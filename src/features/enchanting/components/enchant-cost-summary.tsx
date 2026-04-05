'use client'

import { cn } from '@/lib/utils'
import { StatCard } from '@/components/shared/stat-card'
import { Coins, TrendingUp, TrendingDown, Gem, ArrowUpDown } from 'lucide-react'
import type { EnchantProfitResult } from '../utils/enchanting-calc'

interface EnchantCostSummaryProps {
  result: EnchantProfitResult | null
  isLoading: boolean
  className?: string
}

function formatSilver(amount: number): string {
  if (Math.abs(amount) >= 1_000_000) {
    return `${(amount / 1_000_000).toFixed(1)}M`
  }
  if (Math.abs(amount) >= 1_000) {
    return `${(amount / 1_000).toFixed(1)}K`
  }
  return amount.toFixed(0)
}

export function EnchantCostSummary({
  result,
  isLoading,
  className,
}: EnchantCostSummaryProps) {
  if (isLoading || !result) {
    return (
      <div className={cn('grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4', className)}>
        <StatCard label="Enchanting Cost" value="--" icon={<Gem className="size-5" />} />
        <StatCard label="Item Value Before" value="--" icon={<Coins className="size-5" />} />
        <StatCard label="Item Value After" value="--" icon={<Coins className="size-5" />} />
        <StatCard label="Profit / Loss" value="--" icon={<ArrowUpDown className="size-5" />} />
      </div>
    )
  }

  const hasValidPrices = result.itemPriceBefore > 0 && result.itemPriceAfter > 0

  return (
    <div className={cn('grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4', className)}>
      <StatCard
        label="Enchanting Cost"
        value={
          result.enchantCost > 0
            ? formatSilver(result.enchantCost)
            : 'N/A'
        }
        icon={<Gem className="size-5" />}
      />
      <StatCard
        label="Item Value Before"
        value={
          result.itemPriceBefore > 0
            ? formatSilver(result.itemPriceBefore)
            : 'N/A'
        }
        icon={<Coins className="size-5" />}
      />
      <StatCard
        label="Item Value After"
        value={
          result.itemPriceAfter > 0
            ? formatSilver(result.itemPriceAfter)
            : 'N/A'
        }
        icon={<Coins className="size-5" />}
      />
      <StatCard
        label="Profit / Loss"
        value={
          hasValidPrices && result.enchantCost > 0
            ? `${result.profit >= 0 ? '+' : ''}${formatSilver(Math.round(result.profit))}`
            : 'N/A'
        }
        delta={hasValidPrices && result.enchantCost > 0 ? result.profitPercent : undefined}
        icon={
          result.profit >= 0 ? (
            <TrendingUp className="size-5" />
          ) : (
            <TrendingDown className="size-5" />
          )
        }
      />
    </div>
  )
}
