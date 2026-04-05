'use client'

import { cn } from '@/lib/utils'
import { Card, CardContent } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectGroup,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import {
  type RefiningResourceType,
  getReturnRate,
  RESOURCE_TYPE_INFO,
} from '../utils/refining-calc'

const CRAFTING_CITIES = [
  { value: 'Bridgewatch', label: 'Bridgewatch' },
  { value: 'Fort Sterling', label: 'Fort Sterling' },
  { value: 'Lymhurst', label: 'Lymhurst' },
  { value: 'Martlock', label: 'Martlock' },
  { value: 'Thetford', label: 'Thetford' },
  { value: 'Caerleon', label: 'Caerleon' },
]

interface RefiningSettingsProps {
  city: string
  onCityChange: (city: string) => void
  useFocus: boolean
  onFocusChange: (useFocus: boolean) => void
  quantity: number
  onQuantityChange: (quantity: number) => void
  resourceType: RefiningResourceType
  className?: string
}

export function RefiningSettings({
  city,
  onCityChange,
  useFocus,
  onFocusChange,
  quantity,
  onQuantityChange,
  resourceType,
  className,
}: RefiningSettingsProps) {
  const returnRate = getReturnRate(useFocus, city, resourceType)
  const bonusCity = RESOURCE_TYPE_INFO[resourceType].cityBonus
  const hasCityBonus = city === bonusCity

  return (
    <Card className={cn('', className)}>
      <CardContent className="flex flex-wrap items-end gap-4">
        {/* City */}
        <div className="space-y-1.5">
          <Label className="text-xs">Crafting City</Label>
          <Select value={city} onValueChange={onCityChange}>
            <SelectTrigger className="w-[160px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Royal Cities</SelectLabel>
                {CRAFTING_CITIES.map((c) => (
                  <SelectItem key={c.value} value={c.value}>
                    {c.label}
                    {c.value === bonusCity && (
                      <span className="ml-1 text-xs text-green-500">+bonus</span>
                    )}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>

        {/* Focus toggle */}
        <div className="space-y-1.5">
          <Label className="text-xs">Use Focus</Label>
          <div className="flex items-center gap-2 pt-1">
            <Switch
              checked={useFocus}
              onCheckedChange={onFocusChange}
            />
            <span className="text-sm text-muted-foreground">
              {useFocus ? 'On' : 'Off'}
            </span>
          </div>
        </div>

        {/* Quantity */}
        <div className="space-y-1.5">
          <Label className="text-xs">Quantity</Label>
          <Input
            type="number"
            min={1}
            max={9999}
            value={quantity}
            onChange={(e) =>
              onQuantityChange(Math.max(1, parseInt(e.target.value) || 1))
            }
            className="w-[100px]"
          />
        </div>

        {/* Return rate display */}
        <div className="space-y-1.5">
          <Label className="text-xs">Return Rate</Label>
          <div className="flex items-center gap-2 pt-1">
            <Badge
              variant={hasCityBonus ? 'default' : 'secondary'}
              className="font-mono"
            >
              {(returnRate * 100).toFixed(1)}%
            </Badge>
            {hasCityBonus && (
              <span className="text-xs text-green-500">City Bonus Active</span>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
