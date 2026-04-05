'use client'

import { useCallback } from 'react'
import { Search, RotateCcw, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useTradeRoutesStore } from '@/lib/stores/trade-routes-store'
import { MountSelector } from './mount-selector'
import {
  TRADE_CATEGORIES,
  CATEGORY_LABELS,
  MOUNT_CAPACITIES,
} from '../utils/trade-calc'

// ---------------------------------------------------------------------------
// City options for buy/sell selectors
// ---------------------------------------------------------------------------
const CITY_OPTIONS = [
  { value: 'all', label: 'All Cities' },
  { value: 'Bridgewatch', label: 'Bridgewatch', color: 'text-orange-500' },
  { value: 'Caerleon', label: 'Caerleon', color: 'text-red-500' },
  { value: 'Fort Sterling', label: 'Fort Sterling', color: 'text-slate-400' },
  { value: 'Lymhurst', label: 'Lymhurst', color: 'text-green-500' },
  { value: 'Martlock', label: 'Martlock', color: 'text-amber-700' },
  { value: 'Thetford', label: 'Thetford', color: 'text-purple-500' },
  { value: 'Brecilien', label: 'Brecilien', color: 'text-teal-500' },
]

const TIER_OPTIONS = [1, 2, 3, 4, 5, 6, 7, 8]

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

interface RouteFiltersProps {
  onScan: () => void
  isScanning: boolean
  progress: number
}

export function RouteFilters({ onScan, isScanning, progress }: RouteFiltersProps) {
  const store = useTradeRoutesStore()

  const handleMountChange = useCallback(
    (mount: string, capacity: number) => {
      store.setSelectedMount(mount)
      store.setMaxWeight(capacity)
    },
    [store],
  )

  const handleToggleCategory = useCallback(
    (category: string) => {
      store.toggleCategory(category)
    },
    [store],
  )

  const handleSelectAll = useCallback(() => {
    store.setCategories([...TRADE_CATEGORIES])
  }, [store])

  const handleClearAll = useCallback(() => {
    store.setCategories([])
  }, [store])

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold">Filters</h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => store.resetFilters()}
            className="h-7 gap-1 text-xs"
          >
            <RotateCcw className="size-3" />
            Reset
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-5">
        {/* City selectors */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label className="text-xs">Buy City</Label>
            <Select value={store.buyCity} onValueChange={(v) => v && store.setBuyCity(v)}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CITY_OPTIONS.map((city) => (
                  <SelectItem key={city.value} value={city.value}>
                    <span className={city.color}>{city.label}</span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Sell City</Label>
            <Select value={store.sellCity} onValueChange={(v) => v && store.setSellCity(v)}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CITY_OPTIONS.map((city) => (
                  <SelectItem key={city.value} value={city.value}>
                    <span className={city.color}>{city.label}</span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Tier range */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label className="text-xs">Min Tier</Label>
            <Select
              value={String(store.minTier)}
              onValueChange={(v) => v && store.setMinTier(Number(v))}
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
          <div className="space-y-1.5">
            <Label className="text-xs">Max Tier</Label>
            <Select
              value={String(store.maxTier)}
              onValueChange={(v) => v && store.setMaxTier(Number(v))}
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
        </div>

        {/* Categories */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-xs">Categories</Label>
            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSelectAll}
                className="h-5 px-1.5 text-[10px]"
              >
                All
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearAll}
                className="h-5 px-1.5 text-[10px]"
              >
                None
              </Button>
            </div>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {TRADE_CATEGORIES.map((cat) => {
              const isActive = store.categories.includes(cat)
              return (
                <Badge
                  key={cat}
                  variant={isActive ? 'default' : 'outline'}
                  className={cn(
                    'cursor-pointer select-none text-xs transition-colors',
                    isActive
                      ? ''
                      : 'opacity-50 hover:opacity-75',
                  )}
                  onClick={() => handleToggleCategory(cat)}
                >
                  {CATEGORY_LABELS[cat] ?? cat}
                </Badge>
              )
            })}
          </div>
        </div>

        {/* Min profit & Premium */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label className="text-xs">Minimum Profit (Silver)</Label>
            <Input
              type="number"
              min={0}
              step={100}
              value={store.minProfit}
              onChange={(e) => store.setMinProfit(Number(e.target.value) || 0)}
              className="h-8"
            />
          </div>
          <div className="flex items-end gap-3 pb-0.5">
            <div className="flex items-center gap-2">
              <Switch
                checked={store.isPremium}
                onCheckedChange={store.setIsPremium}
                size="sm"
              />
              <Label className="text-xs">
                Premium ({store.isPremium ? '6.5%' : '10.5%'} tax)
              </Label>
            </div>
          </div>
        </div>

        {/* Mount / Weight */}
        <div className="space-y-1.5">
          <Label className="text-xs">Mount (Carry Capacity)</Label>
          <MountSelector
            value={store.selectedMount}
            onValueChange={handleMountChange}
          />
        </div>

        {/* Scan button */}
        <Button
          onClick={onScan}
          disabled={isScanning || store.categories.length === 0}
          className="w-full gap-2"
        >
          {isScanning ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              Scanning... {progress}%
            </>
          ) : (
            <>
              <Search className="size-4" />
              Find Routes
            </>
          )}
        </Button>

        {/* Progress bar */}
        {isScanning && (
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-primary transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}
      </CardContent>
    </Card>
  )
}
