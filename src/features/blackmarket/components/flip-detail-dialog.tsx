'use client'

import { AlertTriangle, ArrowRight, ExternalLink } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { ItemIcon } from '@/components/shared/item-icon'
import { PriceDisplay } from '@/components/shared/price-display'
import { formatSilver, formatTimeAgo } from '@/lib/utils/format'
import { getDataAgeHours, type FlipOpportunity } from '../utils/flipper-calc'

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------
interface FlipDetailDialogProps {
  flip: FlipOpportunity | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export function FlipDetailDialog({
  flip,
  open,
  onOpenChange,
}: FlipDetailDialogProps) {
  if (!flip) return null

  const margin = flip.profitMargin * 100
  const buyAgeHours = getDataAgeHours(flip.buyPriceDate)
  const sellAgeHours = getDataAgeHours(flip.sellPriceDate)
  const isStale = buyAgeHours > 2 || sellAgeHours > 2
  const totalCost = flip.buyPrice
  const totalRevenue = flip.sellPrice - flip.salesTax

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <ItemIcon
              itemId={flip.itemId}
              size={48}
              quality={flip.buyQuality}
              enchantment={flip.enchantment}
            />
            <div className="min-w-0">
              <div className="truncate text-base font-semibold">
                {flip.itemName}
              </div>
              <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <Badge variant="outline" className="font-mono text-xs">
                  T{flip.tier}
                  {flip.enchantment > 0 && `.${flip.enchantment}`}
                </Badge>
                <span className="capitalize">{flip.category}</span>
              </div>
            </div>
          </DialogTitle>
          <DialogDescription className="sr-only">
            Flip detail breakdown for {flip.itemName}
          </DialogDescription>
        </DialogHeader>

        {/* Stale data warning */}
        {isStale && (
          <div className="flex items-start gap-2 rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-600 dark:text-amber-400">
            <AlertTriangle className="mt-0.5 size-4 shrink-0" />
            <div>
              <p className="font-medium">Price data may be outdated</p>
              <p className="mt-0.5 text-amber-600/80 dark:text-amber-400/80">
                Buy price: {formatTimeAgo(flip.buyPriceDate)} | BM price:{' '}
                {formatTimeAgo(flip.sellPriceDate)}
              </p>
            </div>
          </div>
        )}

        {/* Route */}
        <div className="flex items-center justify-center gap-3 rounded-lg bg-muted/50 p-3">
          <div className="text-center">
            <p className="text-xs text-muted-foreground">Buy in</p>
            <p className="font-semibold">{flip.buyCity}</p>
          </div>
          <ArrowRight className="size-5 text-muted-foreground" />
          <div className="text-center">
            <p className="text-xs text-muted-foreground">Sell on</p>
            <p className="font-semibold">Black Market</p>
          </div>
        </div>

        <Separator />

        {/* Cost breakdown */}
        <div className="space-y-2">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Buy Cost
          </h4>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Item price (instant buy from sell order)</span>
              <PriceDisplay amount={flip.buyPrice} showIcon={false} />
            </div>
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>No fees — buying from existing sell order</span>
            </div>
          </div>
        </div>

        <Separator />

        {/* Revenue breakdown */}
        <div className="space-y-2">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Sell Revenue
          </h4>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">BM buy price</span>
              <PriceDisplay amount={flip.sellPrice} showIcon={false} />
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">
                Sales tax ({((flip.salesTax / flip.sellPrice) * 100).toFixed(0)}%)
              </span>
              <span className="font-mono text-red-500">
                -{formatSilver(flip.salesTax)}
              </span>
            </div>
            <Separator className="my-1" />
            <div className="flex justify-between font-medium">
              <span>Net revenue</span>
              <PriceDisplay amount={totalRevenue} showIcon={false} />
            </div>
          </div>
        </div>

        <Separator />

        {/* Net Profit */}
        <div className="rounded-lg bg-muted/50 p-4 text-center">
          <p className="text-xs text-muted-foreground">Net Profit</p>
          <p
            className={cn(
              'text-2xl font-bold',
              flip.netProfit > 0 ? 'text-green-500' : 'text-red-500',
            )}
          >
            {formatSilver(flip.netProfit, { showSign: true, compact: false })}
          </p>
          <p
            className={cn(
              'text-sm font-medium',
              margin >= 10
                ? 'text-green-500'
                : margin < 3
                  ? 'text-red-500'
                  : 'text-muted-foreground',
            )}
          >
            {margin.toFixed(1)}% margin
          </p>
        </div>

        {/* Data freshness */}
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>Buy data: {formatTimeAgo(flip.buyPriceDate)}</span>
          <span>Sell data: {formatTimeAgo(flip.sellPriceDate)}</span>
        </div>

        <DialogFooter showCloseButton />
      </DialogContent>
    </Dialog>
  )
}
