'use client'

import { Sprout, TrendingUp, Zap } from 'lucide-react'
import { StatCard } from '@/components/shared/stat-card'
import type { FarmingResult } from '../utils/farming-calc'
import type { FarmingSettings } from '../utils/farming-calc'
import {
  findBestCrop,
  calculateTotalFocusNeeded,
} from '../utils/farming-calc'

function formatNumber(n: number): string {
  return Math.round(n).toLocaleString('en-US')
}

interface FarmingSummaryProps {
  results: FarmingResult[]
  settings: FarmingSettings
}

export function FarmingSummary({ results, settings }: FarmingSummaryProps) {
  const best = findBestCrop(results)
  const totalFocusNeeded = calculateTotalFocusNeeded(results, settings)

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <StatCard
        label="Best Crop"
        value={best?.crop.name ?? 'N/A'}
        icon={<Sprout className="size-5" />}
      />
      <StatCard
        label="Best Daily Profit"
        value={best ? `${formatNumber(best.dailyProfit)} silver` : 'N/A'}
        icon={<TrendingUp className="size-5" />}
      />
      <StatCard
        label="Focus Needed / Day"
        value={
          settings.useFocus
            ? formatNumber(totalFocusNeeded)
            : 'N/A (no focus)'
        }
        icon={<Zap className="size-5" />}
      />
    </div>
  )
}
