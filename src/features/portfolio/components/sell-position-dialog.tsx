'use client'

import * as React from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { usePortfolioStore, type Position } from '@/lib/stores/portfolio-store'
import { calcSellProfit } from '../utils/portfolio-calc'
import { cn } from '@/lib/utils'

interface SellPositionDialogProps {
  position: Position | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

function formatSilver(amount: number): string {
  return amount.toLocaleString('en-US', { maximumFractionDigits: 0 })
}

export function SellPositionDialog({
  position,
  open,
  onOpenChange,
}: SellPositionDialogProps) {
  const updatePosition = usePortfolioStore((s) => s.updatePosition)
  const removePosition = usePortfolioStore((s) => s.removePosition)
  const addTrade = usePortfolioStore((s) => s.addTrade)

  const [sellQuantity, setSellQuantity] = React.useState('')
  const [sellPrice, setSellPrice] = React.useState('')

  // Reset form when dialog opens with a new position
  React.useEffect(() => {
    if (open && position) {
      setSellQuantity('')
      setSellPrice('')
    }
  }, [open, position?.id])

  if (!position) return null

  const qty = Math.min(Number(sellQuantity) || 0, position.quantity)
  const price = Number(sellPrice) || 0
  const preview = calcSellProfit(position.avgBuyPrice, price, qty)
  const isValid = qty > 0 && price > 0

  const handleConfirm = () => {
    if (!isValid || !position) return

    // Log the sell trade
    addTrade({
      positionId: position.id,
      action: 'sell',
      price,
      quantity: qty,
      fees: preview.fees,
    })

    // Update or remove the position
    const remaining = position.quantity - qty
    if (remaining <= 0) {
      removePosition(position.id)
    } else {
      updatePosition(position.id, { quantity: remaining })
    }

    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Sell Position</DialogTitle>
          <DialogDescription>
            Record a sale for {position.itemName} in {position.city}.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-2">
          {/* Current position info */}
          <div className="rounded-lg border bg-muted/50 p-3 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Item</span>
              <span className="font-medium">{position.itemName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">City</span>
              <span>{position.city}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Held Quantity</span>
              <span>{position.quantity.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Avg Buy Price</span>
              <span>{formatSilver(position.avgBuyPrice)} Silver</span>
            </div>
          </div>

          {/* Sell inputs */}
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="sell-qty">Sell Quantity</Label>
              <Input
                id="sell-qty"
                type="number"
                min={1}
                max={position.quantity}
                placeholder={`Max ${position.quantity}`}
                value={sellQuantity}
                onChange={(e) => setSellQuantity(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="sell-price">Sell Price / Unit</Label>
              <Input
                id="sell-price"
                type="number"
                min={0}
                placeholder="0"
                value={sellPrice}
                onChange={(e) => setSellPrice(e.target.value)}
              />
            </div>
          </div>

          {/* Profit preview */}
          {isValid && (
            <>
              <Separator />
              <div className="space-y-1.5 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Revenue</span>
                  <span>{formatSilver(preview.revenue)} Silver</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    Fees (2.5% setup + 4% tax)
                  </span>
                  <span className="text-red-400">
                    -{formatSilver(preview.fees)} Silver
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Cost Basis</span>
                  <span>-{formatSilver(preview.cost)} Silver</span>
                </div>
                <Separator />
                <div className="flex justify-between font-medium">
                  <span>Net Profit</span>
                  <span
                    className={cn(
                      preview.profit >= 0 ? 'text-green-500' : 'text-red-500'
                    )}
                  >
                    {preview.profit >= 0 ? '+' : ''}
                    {formatSilver(preview.profit)} Silver
                  </span>
                </div>
              </div>
            </>
          )}
        </div>

        <DialogFooter>
          <Button
            onClick={handleConfirm}
            disabled={!isValid}
            variant={preview.profit >= 0 ? 'default' : 'destructive'}
          >
            Confirm Sale
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
