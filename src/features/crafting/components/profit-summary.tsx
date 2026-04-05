'use client'

import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Percent,
  Sparkles,
  Receipt,
} from 'lucide-react'
import { StatCard } from '@/components/shared/stat-card'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { PriceDisplay } from '@/components/shared/price-display'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import type { CraftingResult } from '@/features/crafting/utils/crafting-calc'

interface ProfitSummaryProps {
  result: CraftingResult | null
  productPrice: number
  quantity: number
  isLoading: boolean
  useFocus: boolean
}

export function ProfitSummary({
  result,
  productPrice,
  quantity,
  isLoading,
  useFocus,
}: ProfitSummaryProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Profit Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="space-y-2 rounded-lg border p-3">
                <Skeleton className="h-3 w-16" />
                <Skeleton className="h-7 w-24" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!result) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Profit Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Select a recipe and wait for prices to calculate profit.
          </p>
        </CardContent>
      </Card>
    )
  }

  const isProfitable = result.profit > 0

  return (
    <Card>
      <CardHeader>
        <CardTitle>Profit Summary</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Main profit display */}
        <div
          className={cn(
            'rounded-lg border-2 p-4 text-center',
            isProfitable
              ? 'border-green-500/30 bg-green-500/5'
              : 'border-red-500/30 bg-red-500/5',
          )}
        >
          <p className="text-sm font-medium text-muted-foreground">
            Net Profit ({quantity}x)
          </p>
          <div
            className={cn(
              'mt-1 flex items-center justify-center gap-2 text-3xl font-bold',
              isProfitable ? 'text-green-500' : 'text-red-500',
            )}
          >
            {isProfitable ? (
              <TrendingUp className="size-6" />
            ) : (
              <TrendingDown className="size-6" />
            )}
            <PriceDisplay amount={Math.round(result.profit)} showIcon />
          </div>
          <p
            className={cn(
              'mt-1 text-sm font-medium',
              isProfitable ? 'text-green-500' : 'text-red-500',
            )}
          >
            {result.profitMargin.toFixed(1)}% margin
          </p>
        </div>

        {/* Detail stats grid */}
        <div className="grid gap-3 sm:grid-cols-2">
          <StatCard
            label="Revenue"
            value={result.revenue.toLocaleString('en-US')}
            icon={<DollarSign className="size-4" />}
          />
          <StatCard
            label="Material Cost"
            value={result.materialCost.toLocaleString('en-US')}
            icon={<Receipt className="size-4" />}
          />
          <StatCard
            label="Tax & Fees"
            value={result.taxCost.toLocaleString('en-US')}
            icon={<Percent className="size-4" />}
          />
          {useFocus && (
            <StatCard
              label="Profit / Focus"
              value={result.profitPerFocus.toFixed(2)}
              icon={<Sparkles className="size-4" />}
            />
          )}
        </div>

        {/* Breakdown */}
        <div className="space-y-1.5 rounded-lg border bg-muted/30 p-3 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">
              Sell price &times; {quantity}
            </span>
            <PriceDisplay amount={result.revenue} showIcon={false} />
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Material cost</span>
            <span className="font-mono text-red-500">
              -{result.materialCost.toLocaleString('en-US')}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">
              Market tax ({((0.025 + 0.04) * 100).toFixed(1)}%)
            </span>
            <span className="font-mono text-red-500">
              -{Math.round(result.taxCost).toLocaleString('en-US')}
            </span>
          </div>
          {useFocus && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Focus used</span>
              <span className="font-mono">{result.focusCost}</span>
            </div>
          )}
          <div className="border-t pt-1.5">
            <div className="flex justify-between font-medium">
              <span>Net Profit</span>
              <span
                className={cn(
                  'font-mono',
                  isProfitable ? 'text-green-500' : 'text-red-500',
                )}
              >
                {isProfitable ? '+' : ''}
                {Math.round(result.profit).toLocaleString('en-US')}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
