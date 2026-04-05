'use client'

import { cn } from '@/lib/utils'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { ItemIcon } from '@/components/shared/item-icon'
import { PriceDisplay } from '@/components/shared/price-display'
import type { EnchantCostBreakdown } from '../utils/enchanting-calc'
import { ENCHANT_MATERIAL_INFO } from '../utils/enchanting-calc'
import { ENCHANTMENT_NAMES } from '@/lib/utils/constants'

interface EnchantMaterialDisplayProps {
  costBreakdown: EnchantCostBreakdown | null
  isLoading: boolean
  className?: string
}

export function EnchantMaterialDisplay({
  costBreakdown,
  isLoading,
  className,
}: EnchantMaterialDisplayProps) {
  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <Skeleton className="h-5 w-40" />
        </CardHeader>
        <CardContent className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4">
              <Skeleton className="size-12 rounded-md" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-3 w-32" />
              </div>
              <Skeleton className="h-6 w-20" />
            </div>
          ))}
        </CardContent>
      </Card>
    )
  }

  if (!costBreakdown || costBreakdown.steps.length === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <h3 className="text-base font-semibold">Required Materials</h3>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Select enchantment levels to see required materials.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={className}>
      <CardHeader>
        <h3 className="text-base font-semibold">Required Materials</h3>
        <p className="text-xs text-muted-foreground">
          Materials needed for each enchantment step
        </p>
      </CardHeader>
      <CardContent className="space-y-3">
        {costBreakdown.steps.map((stepCost, idx) => {
          const { step } = stepCost
          const materialInfo = ENCHANT_MATERIAL_INFO[step.materialType]

          return (
            <div
              key={idx}
              className="flex items-center gap-3 rounded-lg border p-3"
            >
              {/* Material icon */}
              <ItemIcon
                itemId={step.materialItemId}
                size={48}
                className="shrink-0 rounded-md border-0"
              />

              {/* Info */}
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className={cn('text-sm font-semibold', materialInfo.color)}>
                    {materialInfo.label}
                  </span>
                  <Badge variant="outline" className="text-[10px]">
                    .{step.fromLevel} → .{step.toLevel}
                  </Badge>
                </div>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {ENCHANTMENT_NAMES[step.fromLevel]} → {ENCHANTMENT_NAMES[step.toLevel]}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {step.quantity}x {step.materialItemId}
                  {stepCost.pricePerUnit > 0 && (
                    <span className="ml-1">
                      @ <PriceDisplay amount={stepCost.pricePerUnit} showIcon={false} className="inline text-xs" /> each
                    </span>
                  )}
                </p>
              </div>

              {/* Total cost */}
              <div className="shrink-0 text-right">
                {stepCost.totalCost > 0 ? (
                  <PriceDisplay
                    amount={Math.round(stepCost.totalCost)}
                    className="text-sm font-semibold"
                  />
                ) : (
                  <span className="text-sm text-muted-foreground">N/A</span>
                )}
              </div>
            </div>
          )
        })}

        {/* Total */}
        <div className="flex items-center justify-between border-t pt-3">
          <span className="text-sm font-semibold">Total Material Cost</span>
          {costBreakdown.totalCost > 0 ? (
            <PriceDisplay
              amount={Math.round(costBreakdown.totalCost)}
              className="text-base font-bold"
            />
          ) : (
            <span className="text-sm text-muted-foreground">N/A</span>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
