'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { ItemIcon } from '@/components/shared/item-icon'
import { PriceDisplay } from '@/components/shared/price-display'
import type { MaterialBreakdown as MaterialBreakdownType } from '@/features/crafting/utils/crafting-calc'

interface MaterialBreakdownProps {
  materials: MaterialBreakdownType[]
  totalCost: number
  isLoading: boolean
  returnRate: number
}

export function MaterialBreakdown({
  materials,
  totalCost,
  isLoading,
  returnRate,
}: MaterialBreakdownProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Materials Required</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3">
              <Skeleton className="size-8 rounded-md" />
              <div className="flex-1 space-y-1">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-20" />
              </div>
              <Skeleton className="h-5 w-16" />
            </div>
          ))}
        </CardContent>
      </Card>
    )
  }

  if (materials.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Materials Required</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Select a recipe to see materials.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Materials Required</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Table header */}
        <div className="mb-2 grid grid-cols-[auto_1fr_80px_80px_100px] items-center gap-3 text-xs font-medium text-muted-foreground">
          <span className="w-8" />
          <span>Material</span>
          <span className="text-right">Qty</span>
          <span className="text-right">Unit Price</span>
          <span className="text-right">Total</span>
        </div>

        <Separator className="mb-2" />

        {/* Material rows */}
        <div className="space-y-2">
          {materials.map((mat) => (
            <div
              key={mat.itemId}
              className="grid grid-cols-[auto_1fr_80px_80px_100px] items-center gap-3"
            >
              <ItemIcon itemId={mat.itemId} size={32} />
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">{mat.name}</p>
                <p className="text-xs text-muted-foreground">
                  Base: {mat.baseQuantity} &rarr; After RRR: {mat.adjustedQuantity}
                </p>
              </div>
              <span className="text-right font-mono text-sm">
                {mat.adjustedQuantity}
              </span>
              <span className="text-right">
                {mat.unitPrice > 0 ? (
                  <PriceDisplay amount={mat.unitPrice} showIcon={false} className="text-sm justify-end" />
                ) : (
                  <span className="text-xs text-muted-foreground">N/A</span>
                )}
              </span>
              <span className="text-right">
                {mat.totalPrice > 0 ? (
                  <PriceDisplay amount={mat.totalPrice} showIcon={false} className="text-sm justify-end" />
                ) : (
                  <span className="text-xs text-muted-foreground">N/A</span>
                )}
              </span>
            </div>
          ))}
        </div>

        <Separator className="my-3" />

        {/* Grand total */}
        <div className="flex items-center justify-between">
          <div>
            <span className="text-sm font-medium">Total Material Cost</span>
            <p className="text-xs text-muted-foreground">
              Return rate: {(returnRate * 100).toFixed(1)}%
            </p>
          </div>
          <PriceDisplay amount={totalCost} className="text-lg font-bold" />
        </div>
      </CardContent>
    </Card>
  )
}
