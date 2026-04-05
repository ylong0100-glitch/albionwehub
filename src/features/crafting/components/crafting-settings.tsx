'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ROYAL_CITIES } from '@/lib/utils/constants'
import { calculateReturnRate, type Recipe } from '@/features/crafting/utils/crafting-calc'

interface CraftingSettingsProps {
  city: string
  quantity: number
  useFocus: boolean
  includeJournals: boolean
  selectedRecipe: Recipe | null
  onCityChange: (city: string) => void
  onQuantityChange: (qty: number) => void
  onFocusChange: (use: boolean) => void
  onJournalsChange: (include: boolean) => void
}

export function CraftingSettings({
  city,
  quantity,
  useFocus,
  includeJournals,
  selectedRecipe,
  onCityChange,
  onQuantityChange,
  onFocusChange,
  onJournalsChange,
}: CraftingSettingsProps) {
  const returnRate = selectedRecipe
    ? calculateReturnRate(city, useFocus, selectedRecipe)
    : useFocus
      ? 0.432
      : 0.152

  return (
    <Card>
      <CardHeader>
        <CardTitle>Settings</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* City selector */}
        <div className="space-y-1.5">
          <Label htmlFor="crafting-city">Crafting City</Label>
          <Select value={city} onValueChange={onCityChange}>
            <SelectTrigger className="w-full" id="crafting-city">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Royal Cities</SelectLabel>
                {ROYAL_CITIES.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>

        {/* Quantity */}
        <div className="space-y-1.5">
          <Label htmlFor="crafting-qty">Quantity</Label>
          <Input
            id="crafting-qty"
            type="number"
            min={1}
            max={999}
            value={quantity}
            onChange={(e) => {
              const val = parseInt(e.target.value, 10)
              if (!isNaN(val)) onQuantityChange(val)
            }}
          />
        </div>

        {/* Focus toggle */}
        <div className="flex items-center justify-between">
          <Label htmlFor="use-focus" className="cursor-pointer">
            Use Focus
          </Label>
          <Switch
            id="use-focus"
            checked={useFocus}
            onCheckedChange={onFocusChange}
          />
        </div>

        {/* Journal toggle */}
        <div className="flex items-center justify-between">
          <Label htmlFor="include-journals" className="cursor-pointer">
            Include Journals
          </Label>
          <Switch
            id="include-journals"
            checked={includeJournals}
            onCheckedChange={onJournalsChange}
          />
        </div>

        {/* Return Rate Display */}
        <div className="rounded-lg border bg-muted/30 p-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Return Rate</span>
            <Badge
              variant={returnRate > 0.3 ? 'default' : 'secondary'}
              className="font-mono"
            >
              {(returnRate * 100).toFixed(1)}%
            </Badge>
          </div>
          {selectedRecipe && (
            <div className="mt-2 space-y-1 text-xs text-muted-foreground">
              <div className="flex justify-between">
                <span>Base rate</span>
                <span>{useFocus ? '43.2%' : '15.2%'}</span>
              </div>
              {returnRate > (useFocus ? 0.432 : 0.152) && (
                <div className="flex justify-between text-green-500">
                  <span>City bonus</span>
                  <span>+15.0%</span>
                </div>
              )}
              {useFocus && selectedRecipe && (
                <div className="flex justify-between">
                  <span>Focus cost / craft</span>
                  <span>{selectedRecipe.craftingFocus}</span>
                </div>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
