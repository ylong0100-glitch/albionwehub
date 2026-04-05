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
import { usePortfolioStore, type Position } from '@/lib/stores/portfolio-store'
import { ALL_MARKET_LOCATIONS } from '@/lib/utils/constants'

interface EditPositionDialogProps {
  position: Position | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function EditPositionDialog({
  position,
  open,
  onOpenChange,
}: EditPositionDialogProps) {
  const updatePosition = usePortfolioStore((s) => s.updatePosition)

  const [itemId, setItemId] = React.useState('')
  const [itemName, setItemName] = React.useState('')
  const [city, setCity] = React.useState('')
  const [quantity, setQuantity] = React.useState('')
  const [avgBuyPrice, setAvgBuyPrice] = React.useState('')
  const [notes, setNotes] = React.useState('')

  // Populate form when position changes
  React.useEffect(() => {
    if (open && position) {
      setItemId(position.itemId)
      setItemName(position.itemName)
      setCity(position.city)
      setQuantity(String(position.quantity))
      setAvgBuyPrice(String(position.avgBuyPrice))
      setNotes(position.notes ?? '')
    }
  }, [open, position?.id])

  if (!position) return null

  const isValid =
    itemId.trim() !== '' &&
    itemName.trim() !== '' &&
    city !== '' &&
    Number(quantity) > 0 &&
    Number(avgBuyPrice) > 0

  const handleSave = () => {
    if (!isValid) return

    updatePosition(position.id, {
      itemId: itemId.trim(),
      itemName: itemName.trim(),
      city,
      quantity: Number(quantity),
      avgBuyPrice: Number(avgBuyPrice),
      notes: notes.trim() || undefined,
    })

    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Position</DialogTitle>
          <DialogDescription>
            Update the details of this position.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-2">
          <div className="grid gap-2">
            <Label htmlFor="edit-item-id">Item ID</Label>
            <Input
              id="edit-item-id"
              value={itemId}
              onChange={(e) => setItemId(e.target.value)}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="edit-item-name">Item Name</Label>
            <Input
              id="edit-item-name"
              value={itemName}
              onChange={(e) => setItemName(e.target.value)}
            />
          </div>

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

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-quantity">Quantity</Label>
              <Input
                id="edit-quantity"
                type="number"
                min={1}
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-avg-price">Avg Buy Price</Label>
              <Input
                id="edit-avg-price"
                type="number"
                min={0}
                value={avgBuyPrice}
                onChange={(e) => setAvgBuyPrice(e.target.value)}
              />
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="edit-notes">Notes</Label>
            <Textarea
              id="edit-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="min-h-12"
            />
          </div>
        </div>

        <DialogFooter>
          <Button onClick={handleSave} disabled={!isValid}>
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
