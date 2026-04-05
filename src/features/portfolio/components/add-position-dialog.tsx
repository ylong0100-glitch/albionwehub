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
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Plus } from 'lucide-react'
import { usePortfolioStore } from '@/lib/stores/portfolio-store'
import { ALL_MARKET_LOCATIONS } from '@/lib/utils/constants'

interface AddPositionDialogProps {
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

export function AddPositionDialog({
  open: controlledOpen,
  onOpenChange,
}: AddPositionDialogProps) {
  const addPosition = usePortfolioStore((s) => s.addPosition)
  const addTrade = usePortfolioStore((s) => s.addTrade)

  const [itemId, setItemId] = React.useState('')
  const [itemName, setItemName] = React.useState('')
  const [city, setCity] = React.useState<string>('')
  const [quantity, setQuantity] = React.useState('')
  const [buyPrice, setBuyPrice] = React.useState('')
  const [notes, setNotes] = React.useState('')

  const resetForm = () => {
    setItemId('')
    setItemName('')
    setCity('')
    setQuantity('')
    setBuyPrice('')
    setNotes('')
  }

  const isValid =
    itemId.trim() !== '' &&
    itemName.trim() !== '' &&
    city !== '' &&
    Number(quantity) > 0 &&
    Number(buyPrice) > 0

  const handleSave = () => {
    if (!isValid) return

    const qty = Number(quantity)
    const price = Number(buyPrice)

    addPosition({
      itemId: itemId.trim(),
      itemName: itemName.trim(),
      city,
      quantity: qty,
      avgBuyPrice: price,
      notes: notes.trim() || undefined,
    })

    // Also log a buy trade for the new position
    // We need the position ID, but addPosition generates it internally.
    // We'll add the trade log after getting positions from the store.
    // For simplicity, we create the trade using a timeout to get the latest state.
    setTimeout(() => {
      const positions = usePortfolioStore.getState().positions
      const latest = positions[positions.length - 1]
      if (latest) {
        addTrade({
          positionId: latest.id,
          action: 'buy',
          price,
          quantity: qty,
          fees: 0,
        })
      }
    }, 0)

    resetForm()
    onOpenChange?.(false)
  }

  return (
    <Dialog open={controlledOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Position</DialogTitle>
          <DialogDescription>
            Record a new portfolio position for an item you purchased.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-2">
          {/* Item ID */}
          <div className="grid gap-2">
            <Label htmlFor="item-id">Item ID</Label>
            <Input
              id="item-id"
              placeholder="e.g. T6_BAG"
              value={itemId}
              onChange={(e) => setItemId(e.target.value)}
            />
          </div>

          {/* Item Name */}
          <div className="grid gap-2">
            <Label htmlFor="item-name">Item Name</Label>
            <Input
              id="item-name"
              placeholder="e.g. Expert's Bag"
              value={itemName}
              onChange={(e) => setItemName(e.target.value)}
            />
          </div>

          {/* City */}
          <div className="grid gap-2">
            <Label>City</Label>
            <Select value={city} onValueChange={setCity}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select city" />
              </SelectTrigger>
              <SelectContent>
                {ALL_MARKET_LOCATIONS.map((loc) => (
                  <SelectItem key={loc} value={loc}>
                    {loc}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Quantity & Price */}
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="quantity">Quantity</Label>
              <Input
                id="quantity"
                type="number"
                min={1}
                placeholder="0"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="buy-price">Buy Price / Unit</Label>
              <Input
                id="buy-price"
                type="number"
                min={0}
                placeholder="0"
                value={buyPrice}
                onChange={(e) => setBuyPrice(e.target.value)}
              />
            </div>
          </div>

          {/* Notes */}
          <div className="grid gap-2">
            <Label htmlFor="notes">Notes (optional)</Label>
            <Textarea
              id="notes"
              placeholder="Any notes about this purchase..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="min-h-12"
            />
          </div>
        </div>

        <DialogFooter>
          <Button onClick={handleSave} disabled={!isValid}>
            <Plus className="mr-1.5 size-4" />
            Add Position
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
