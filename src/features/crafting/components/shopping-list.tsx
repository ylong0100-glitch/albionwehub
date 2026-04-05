'use client'

import * as React from 'react'
import { ChevronDown, Copy, Check, ShoppingCart } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ItemIcon } from '@/components/shared/item-icon'
import { PriceDisplay } from '@/components/shared/price-display'
import { cn } from '@/lib/utils'
import type { MaterialBreakdown } from '@/features/crafting/utils/crafting-calc'

interface ShoppingListProps {
  materials: MaterialBreakdown[]
  totalCost: number
  recipeName: string
  quantity: number
}

export function ShoppingList({
  materials,
  totalCost,
  recipeName,
  quantity,
}: ShoppingListProps) {
  const [isExpanded, setIsExpanded] = React.useState(false)
  const [copied, setCopied] = React.useState(false)

  if (materials.length === 0) return null

  const handleCopy = async () => {
    const lines = [
      `Shopping List: ${recipeName} x${quantity}`,
      '---',
      ...materials.map(
        (m) =>
          `${m.name}: ${m.adjustedQuantity} (${m.unitPrice > 0 ? `${m.unitPrice.toLocaleString()} each` : 'price N/A'})`,
      ),
      '---',
      `Total: ${totalCost.toLocaleString()} silver`,
    ]
    try {
      await navigator.clipboard.writeText(lines.join('\n'))
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Clipboard not available
    }
  }

  // Estimate total weight (rough: 1 resource unit ~ 1 kg)
  const totalWeight = materials.reduce(
    (sum, m) => sum + m.adjustedQuantity,
    0,
  )

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <button
            className="flex items-center gap-2"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            <ShoppingCart className="size-4 text-muted-foreground" />
            <CardTitle className="cursor-pointer">Shopping List</CardTitle>
            <ChevronDown
              className={cn(
                'size-4 text-muted-foreground transition-transform',
                isExpanded && 'rotate-180',
              )}
            />
          </button>
          <div className="flex items-center gap-2">
            <Badge variant="secondary">{materials.length} items</Badge>
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopy}
              className="gap-1.5"
            >
              {copied ? (
                <>
                  <Check className="size-3.5" />
                  Copied
                </>
              ) : (
                <>
                  <Copy className="size-3.5" />
                  Copy
                </>
              )}
            </Button>
          </div>
        </div>
      </CardHeader>

      {isExpanded && (
        <CardContent className="space-y-3">
          {materials.map((mat) => (
            <div
              key={mat.itemId}
              className="flex items-center gap-3 rounded-lg border bg-muted/30 p-2.5"
            >
              <ItemIcon itemId={mat.itemId} size={32} />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{mat.name}</p>
              </div>
              <div className="text-right">
                <p className="font-mono text-sm font-medium">
                  &times;{mat.adjustedQuantity}
                </p>
                {mat.totalPrice > 0 && (
                  <PriceDisplay
                    amount={mat.totalPrice}
                    showIcon={false}
                    className="text-xs text-muted-foreground justify-end"
                  />
                )}
              </div>
            </div>
          ))}

          {/* Summary */}
          <div className="flex items-center justify-between rounded-lg bg-muted/50 p-3 text-sm">
            <div className="space-y-0.5">
              <p className="text-muted-foreground">
                Estimated weight: ~{totalWeight.toLocaleString()} kg
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs text-muted-foreground">Total Cost</p>
              <PriceDisplay amount={totalCost} className="font-bold" />
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  )
}
