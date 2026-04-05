'use client'

import * as React from 'react'
import { Search, RotateCcw, ChevronDown, ChevronUp, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select'
import { useFlipperStore } from '@/lib/stores/flipper-store'
import { BM_CATEGORY_LABELS } from '../utils/flipper-calc'
import { ROYAL_CITIES } from '@/lib/utils/constants'

// ---------------------------------------------------------------------------
// Buy-location options (all royal cities)
// ---------------------------------------------------------------------------
const BUY_LOCATIONS = [...ROYAL_CITIES] as string[]

// ---------------------------------------------------------------------------
// Tier options
// ---------------------------------------------------------------------------
const TIER_OPTIONS = [4, 5, 6, 7, 8]

// ---------------------------------------------------------------------------
// Enchantment options
// ---------------------------------------------------------------------------
const ENCHANTMENT_OPTIONS = [
  { value: 0, label: '.0' },
  { value: 1, label: '.1' },
  { value: 2, label: '.2' },
  { value: 3, label: '.3' },
]

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------
interface FlipperFiltersProps {
  onScan: () => void
  onCancel: () => void
  isScanning: boolean
  progress: { current: number; total: number }
  className?: string
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export function FlipperFilters({
  onScan,
  onCancel,
  isScanning,
  progress,
  className,
}: FlipperFiltersProps) {
  const [expanded, setExpanded] = React.useState(true)

  const {
    buyLocation,
    minTier,
    maxTier,
    enchantmentLevels,
    categories,
    minProfit,
    isPremium,
    maxDataAgeHours,
    setBuyLocation,
    setMinTier,
    setMaxTier,
    toggleEnchantment,
    toggleCategory,
    setMinProfit,
    setIsPremium,
    setMaxDataAgeHours,
    resetFilters,
  } = useFlipperStore()

  return (
    <Card className={cn('', className)}>
      <CardContent className="space-y-4">
        {/* Header with collapse toggle */}
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold">Scan Filters</h3>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => setExpanded(!expanded)}
            className="md:hidden"
          >
            {expanded ? (
              <ChevronUp className="size-4" />
            ) : (
              <ChevronDown className="size-4" />
            )}
          </Button>
        </div>

        {/* Collapsible filter body */}
        <div
          className={cn(
            'space-y-4',
            !expanded && 'hidden md:block',
          )}
        >
          {/* Row 1: Buy location + Tier range */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {/* Buy Location */}
            <div className="space-y-1.5">
              <Label className="text-xs">Buy Location</Label>
              <Select value={buyLocation} onValueChange={setBuyLocation}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {BUY_LOCATIONS.map((city) => (
                    <SelectItem key={city} value={city}>
                      {city}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Min Tier */}
            <div className="space-y-1.5">
              <Label className="text-xs">Min Tier</Label>
              <Select
                value={String(minTier)}
                onValueChange={(v) => setMinTier(Number(v))}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TIER_OPTIONS.map((t) => (
                    <SelectItem key={t} value={String(t)}>
                      T{t}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Max Tier */}
            <div className="space-y-1.5">
              <Label className="text-xs">Max Tier</Label>
              <Select
                value={String(maxTier)}
                onValueChange={(v) => setMaxTier(Number(v))}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TIER_OPTIONS.map((t) => (
                    <SelectItem key={t} value={String(t)}>
                      T{t}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Minimum Profit */}
            <div className="space-y-1.5">
              <Label className="text-xs">Min Profit (silver)</Label>
              <Input
                type="number"
                min={0}
                step={1000}
                value={minProfit}
                onChange={(e) => setMinProfit(Number(e.target.value) || 0)}
                placeholder="0"
              />
            </div>

            {/* Max Data Age */}
            <div className="space-y-1.5">
              <Label className="text-xs">Max Data Age (hours)</Label>
              <Input
                type="number"
                min={0}
                max={168}
                step={1}
                value={maxDataAgeHours}
                onChange={(e) => setMaxDataAgeHours(Number(e.target.value) || 0)}
                placeholder="24"
              />
            </div>
          </div>

          {/* Row 2: Enchantment */}
          <div className="space-y-1.5">
            <Label className="text-xs">Enchantment</Label>
            <div className="flex flex-wrap gap-2">
              {ENCHANTMENT_OPTIONS.map((ench) => {
                const active = enchantmentLevels.includes(ench.value)
                return (
                  <Badge
                    key={ench.value}
                    variant={active ? 'default' : 'outline'}
                    className={cn(
                      'cursor-pointer select-none transition-colors',
                      active && 'bg-primary text-primary-foreground',
                    )}
                    onClick={() => toggleEnchantment(ench.value)}
                  >
                    {ench.label}
                  </Badge>
                )
              })}
            </div>
          </div>

          {/* Row 3: Categories */}
          <div className="space-y-1.5">
            <Label className="text-xs">Categories</Label>
            <div className="flex flex-wrap gap-2">
              {Object.entries(BM_CATEGORY_LABELS).map(([key, label]) => {
                const active = categories.includes(key)
                return (
                  <Badge
                    key={key}
                    variant={active ? 'default' : 'outline'}
                    className={cn(
                      'cursor-pointer select-none transition-colors',
                      active && 'bg-primary text-primary-foreground',
                    )}
                    onClick={() => toggleCategory(key)}
                  >
                    {label}
                  </Badge>
                )
              })}
            </div>
          </div>

          {/* Row 4: Premium toggle + Action buttons */}
          <div className="flex flex-wrap items-center gap-4">
            {/* Premium toggle */}
            <div className="flex items-center gap-2">
              <Switch
                checked={isPremium}
                onCheckedChange={setIsPremium}
                size="sm"
              />
              <Label className="text-xs cursor-pointer">
                Premium (4% tax)
              </Label>
            </div>

            <div className="ml-auto flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={resetFilters}
                disabled={isScanning}
              >
                <RotateCcw className="mr-1.5 size-3.5" />
                Reset
              </Button>

              {isScanning ? (
                <Button variant="destructive" size="sm" onClick={onCancel}>
                  <X className="mr-1.5 size-3.5" />
                  Cancel ({progress.current}/{progress.total})
                </Button>
              ) : (
                <Button size="sm" onClick={onScan}>
                  <Search className="mr-1.5 size-3.5" />
                  Scan Market
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Progress bar during scan */}
        {isScanning && progress.total > 0 && (
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>
                Scanning... {progress.current}/{progress.total} batches
              </span>
              <span>
                {Math.round((progress.current / progress.total) * 100)}%
              </span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-primary transition-all duration-300"
                style={{
                  width: `${(progress.current / progress.total) * 100}%`,
                }}
              />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
