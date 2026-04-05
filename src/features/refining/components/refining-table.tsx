'use client'

import { useMemo } from 'react'
import { cn } from '@/lib/utils'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { ItemIcon } from '@/components/shared/item-icon'
import { PriceDisplay } from '@/components/shared/price-display'
import { TIERS } from '@/lib/utils/constants'
import {
  type RefiningResourceType,
  type RefiningResult,
  getRefiningRecipes,
  calculateRefining,
  findBestRefining,
  getReturnRate,
} from '../utils/refining-calc'

interface RefiningTableProps {
  resourceType: RefiningResourceType
  prices: Record<string, number>
  isLoading: boolean
  city: string
  useFocus: boolean
  quantity: number
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

export function RefiningTable({
  resourceType,
  prices,
  isLoading,
  city,
  useFocus,
  quantity,
  className,
}: RefiningTableProps) {
  const recipes = useMemo(() => getRefiningRecipes(resourceType), [resourceType])

  const returnRate = getReturnRate(useFocus, city, resourceType)

  const results: RefiningResult[] = useMemo(() => {
    return recipes.map((recipe) =>
      calculateRefining(recipe, prices, returnRate, quantity),
    )
  }, [recipes, prices, returnRate, quantity])

  const bestIdx = useMemo(() => findBestRefining(results), [results])

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <Skeleton className="h-5 w-40" />
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Array.from({ length: 7 }).map((_, i) => (
              <div key={i} className="flex gap-4">
                {Array.from({ length: 7 }).map((_, j) => (
                  <Skeleton key={j} className="h-10 flex-1" />
                ))}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={className}>
      <CardHeader>
        <h3 className="text-base font-semibold">Refining Profit Table</h3>
        <p className="text-xs text-muted-foreground">
          Showing per-batch results ({quantity}x). Market fees (
          {((0.025 + 0.04) * 100).toFixed(1)}%) included.
        </p>
      </CardHeader>
      <CardContent className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-left text-xs text-muted-foreground">
              <th className="pb-2 pr-3 font-medium">Tier</th>
              <th className="pb-2 pr-3 font-medium">Raw Material</th>
              <th className="pb-2 pr-3 font-medium">Prev Refined</th>
              <th className="pb-2 pr-3 font-medium">Product</th>
              <th className="pb-2 pr-3 font-medium text-right">Cost</th>
              <th className="pb-2 pr-3 font-medium text-right">Revenue</th>
              <th className="pb-2 pr-3 font-medium text-right">Profit</th>
              <th className="pb-2 font-medium text-right">Silver/Focus</th>
            </tr>
          </thead>
          <tbody>
            {results.map((result, idx) => {
              const isBest = idx === bestIdx && result.profit > 0
              const tierInfo = TIERS.find((t) => t.level === result.tier)

              return (
                <tr
                  key={result.tier}
                  className={cn(
                    'border-b transition-colors last:border-0',
                    isBest && 'bg-green-500/5',
                  )}
                >
                  {/* Tier */}
                  <td className="py-2.5 pr-3">
                    <div className="flex items-center gap-2">
                      <Badge
                        variant="outline"
                        className="font-mono text-xs"
                        style={{ color: tierInfo?.color }}
                      >
                        T{result.tier}
                      </Badge>
                      {isBest && (
                        <Badge variant="default" className="text-[10px]">
                          Best
                        </Badge>
                      )}
                    </div>
                  </td>

                  {/* Raw Material */}
                  <td className="py-2.5 pr-3">
                    <div className="flex items-center gap-2">
                      <ItemIcon
                        itemId={result.rawItemId}
                        size={28}
                        className="rounded-sm border-0"
                      />
                      <div>
                        <p className="text-xs font-medium">
                          {result.rawCount}x
                        </p>
                        <p className="font-mono text-xs text-muted-foreground">
                          {result.rawPrice > 0
                            ? formatSilver(result.rawPrice)
                            : 'N/A'}
                        </p>
                      </div>
                    </div>
                  </td>

                  {/* Previous Refined */}
                  <td className="py-2.5 pr-3">
                    {result.refinedInputItemId ? (
                      <div className="flex items-center gap-2">
                        <ItemIcon
                          itemId={result.refinedInputItemId}
                          size={28}
                          className="rounded-sm border-0"
                        />
                        <div>
                          <p className="text-xs font-medium">
                            {result.refinedInputCount}x
                          </p>
                          <p className="font-mono text-xs text-muted-foreground">
                            {result.refinedInputPrice > 0
                              ? formatSilver(result.refinedInputPrice)
                              : 'N/A'}
                          </p>
                        </div>
                      </div>
                    ) : (
                      <span className="text-xs text-muted-foreground">--</span>
                    )}
                  </td>

                  {/* Product */}
                  <td className="py-2.5 pr-3">
                    <div className="flex items-center gap-2">
                      <ItemIcon
                        itemId={result.outputItemId}
                        size={28}
                        className="rounded-sm border-0"
                      />
                      <p className="font-mono text-xs">
                        {result.outputPrice > 0
                          ? formatSilver(result.outputPrice)
                          : 'N/A'}
                      </p>
                    </div>
                  </td>

                  {/* Cost */}
                  <td className="py-2.5 pr-3 text-right">
                    <p className="font-mono text-xs">
                      {result.effectiveMaterialCost > 0 ? (
                        <PriceDisplay
                          amount={Math.round(result.effectiveMaterialCost)}
                          className="justify-end text-xs"
                        />
                      ) : (
                        <span className="text-muted-foreground">N/A</span>
                      )}
                    </p>
                  </td>

                  {/* Revenue */}
                  <td className="py-2.5 pr-3 text-right">
                    <p className="font-mono text-xs">
                      {result.revenue > 0 ? (
                        <PriceDisplay
                          amount={Math.round(result.revenue)}
                          className="justify-end text-xs"
                        />
                      ) : (
                        <span className="text-muted-foreground">N/A</span>
                      )}
                    </p>
                  </td>

                  {/* Profit */}
                  <td className="py-2.5 pr-3 text-right">
                    <span
                      className={cn(
                        'font-mono text-xs font-semibold',
                        result.profit > 0
                          ? 'text-green-500'
                          : result.profit < 0
                            ? 'text-red-500'
                            : 'text-muted-foreground',
                      )}
                    >
                      {result.outputPrice > 0 && result.effectiveMaterialCost > 0
                        ? `${result.profit >= 0 ? '+' : ''}${formatSilver(Math.round(result.profit))}`
                        : 'N/A'}
                    </span>
                  </td>

                  {/* Silver per Focus */}
                  <td className="py-2.5 text-right">
                    {useFocus && result.focusCost > 0 ? (
                      <span
                        className={cn(
                          'font-mono text-xs',
                          result.profitPerFocus > 0
                            ? 'text-green-500'
                            : result.profitPerFocus < 0
                              ? 'text-red-500'
                              : 'text-muted-foreground',
                        )}
                      >
                        {result.outputPrice > 0
                          ? `${result.profitPerFocus >= 0 ? '+' : ''}${result.profitPerFocus.toFixed(1)}`
                          : 'N/A'}
                      </span>
                    ) : (
                      <span className="text-xs text-muted-foreground">--</span>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </CardContent>
    </Card>
  )
}
