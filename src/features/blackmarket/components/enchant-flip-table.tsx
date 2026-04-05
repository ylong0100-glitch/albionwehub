'use client'

import * as React from 'react'
import {
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  AlertTriangle,
  Sparkles,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { ItemIcon } from '@/components/shared/item-icon'
import { PriceDisplay } from '@/components/shared/price-display'
import { EmptyState } from '@/components/shared/empty-state'
import { formatSilver, formatTimeAgo } from '@/lib/utils/format'
import { getDataAgeHours } from '../utils/flipper-calc'
import type { EnchantFlipOpportunity } from '../utils/enchant-flip-calc'

// ---------------------------------------------------------------------------
// Sort keys
// ---------------------------------------------------------------------------
type SortKey =
  | 'itemName'
  | 'tier'
  | 'basePrice'
  | 'runeCost'
  | 'totalCost'
  | 'bmPrice'
  | 'enchantFlipProfit'
  | 'profitDifference'

interface SortConfig {
  key: SortKey
  direction: 'asc' | 'desc'
}

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------
interface EnchantFlipTableProps {
  opportunities: EnchantFlipOpportunity[]
  isScanning: boolean
  className?: string
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export function EnchantFlipTable({
  opportunities,
  isScanning,
  className,
}: EnchantFlipTableProps) {
  const [sort, setSort] = React.useState<SortConfig>({
    key: 'enchantFlipProfit',
    direction: 'desc',
  })
  const [search, setSearch] = React.useState('')

  const handleSort = (key: SortKey) => {
    setSort((prev) => ({
      key,
      direction: prev.key === key && prev.direction === 'desc' ? 'asc' : 'desc',
    }))
  }

  // Filter by search
  const filtered = React.useMemo(() => {
    if (!search.trim()) return opportunities
    const q = search.toLowerCase()
    return opportunities.filter((f) => f.itemName.toLowerCase().includes(q))
  }, [opportunities, search])

  // Sort
  const sorted = React.useMemo(() => {
    const arr = [...filtered]
    const dir = sort.direction === 'asc' ? 1 : -1

    arr.sort((a, b) => {
      switch (sort.key) {
        case 'itemName':
          return dir * a.itemName.localeCompare(b.itemName)
        case 'tier':
          return dir * (a.tier - b.tier)
        case 'basePrice':
          return dir * (a.basePrice - b.basePrice)
        case 'runeCost':
          return dir * (a.runeTotalCost - b.runeTotalCost)
        case 'totalCost':
          return dir * (a.totalCost - b.totalCost)
        case 'bmPrice':
          return dir * (a.bmPriceEnchanted - b.bmPriceEnchanted)
        case 'enchantFlipProfit':
          return dir * (a.enchantFlipProfit - b.enchantFlipProfit)
        case 'profitDifference':
          return dir * (a.profitDifference - b.profitDifference)
        default:
          return 0
      }
    })

    return arr
  }, [filtered, sort])

  const SortIcon = ({ column }: { column: SortKey }) => {
    if (sort.key !== column)
      return <ArrowUpDown className="ml-1 inline size-3 opacity-40" />
    return sort.direction === 'asc' ? (
      <ArrowUp className="ml-1 inline size-3" />
    ) : (
      <ArrowDown className="ml-1 inline size-3" />
    )
  }

  const totalProfit = filtered.reduce((s, o) => s + o.enchantFlipProfit, 0)

  if (!isScanning && opportunities.length === 0) {
    return (
      <EmptyState
        title="No enchant-flip opportunities"
        description="Click 'Scan Market' to search for profitable enchant-flip opportunities."
        className={className}
      />
    )
  }

  return (
    <Card className={cn('', className)}>
      <CardHeader className="flex-row items-center justify-between gap-2 space-y-0">
        <div className="space-y-0.5">
          <h3 className="text-sm font-semibold">
            <Sparkles className="mr-1.5 inline size-4" />
            Enchant & Flip Opportunities
            {filtered.length > 0 && (
              <Badge variant="secondary" className="ml-2 font-mono">
                {filtered.length}
              </Badge>
            )}
          </h3>
          {totalProfit > 0 && (
            <p className="text-xs text-muted-foreground">
              Total potential profit:{' '}
              <span className="font-semibold text-green-500">
                {formatSilver(totalProfit)}
              </span>
            </p>
          )}
        </div>
        <div className="w-48">
          <Input
            type="text"
            placeholder="Search items..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-8 text-xs"
          />
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50 text-left text-xs font-medium text-muted-foreground">
                <th
                  className="cursor-pointer whitespace-nowrap px-4 py-2.5 hover:text-foreground"
                  onClick={() => handleSort('itemName')}
                >
                  Item
                  <SortIcon column="itemName" />
                </th>
                <th
                  className="cursor-pointer whitespace-nowrap px-3 py-2.5 hover:text-foreground"
                  onClick={() => handleSort('tier')}
                >
                  Tier
                  <SortIcon column="tier" />
                </th>
                <th
                  className="cursor-pointer whitespace-nowrap px-3 py-2.5 text-right hover:text-foreground"
                  onClick={() => handleSort('basePrice')}
                >
                  Base Price (.0)
                  <SortIcon column="basePrice" />
                </th>
                <th
                  className="cursor-pointer whitespace-nowrap px-3 py-2.5 text-right hover:text-foreground"
                  onClick={() => handleSort('runeCost')}
                >
                  Rune Cost
                  <SortIcon column="runeCost" />
                </th>
                <th
                  className="cursor-pointer whitespace-nowrap px-3 py-2.5 text-right hover:text-foreground"
                  onClick={() => handleSort('totalCost')}
                >
                  Total Cost
                  <SortIcon column="totalCost" />
                </th>
                <th
                  className="cursor-pointer whitespace-nowrap px-3 py-2.5 text-right hover:text-foreground"
                  onClick={() => handleSort('bmPrice')}
                >
                  BM Price (.1)
                  <SortIcon column="bmPrice" />
                </th>
                <th className="whitespace-nowrap px-3 py-2.5 text-right">
                  Tax
                </th>
                <th
                  className="cursor-pointer whitespace-nowrap px-3 py-2.5 text-right hover:text-foreground"
                  onClick={() => handleSort('enchantFlipProfit')}
                >
                  Net Profit
                  <SortIcon column="enchantFlipProfit" />
                </th>
                <th
                  className="cursor-pointer whitespace-nowrap px-3 py-2.5 text-right hover:text-foreground"
                  onClick={() => handleSort('profitDifference')}
                >
                  vs Direct Flip
                  <SortIcon column="profitDifference" />
                </th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((flip, idx) => {
                const ageHours = getDataAgeHours(flip.bmPriceDateEnchanted)
                const isStale = ageHours > 2
                const isBetterThanDirect = flip.profitDifference > 0

                return (
                  <tr
                    key={`${flip.itemId}-${idx}`}
                    className={cn(
                      'border-b transition-colors hover:bg-muted/50',
                      isBetterThanDirect && 'bg-green-500/5',
                    )}
                  >
                    {/* Item */}
                    <td className="px-4 py-2">
                      <div className="flex items-center gap-2.5">
                        <ItemIcon
                          itemId={flip.itemId}
                          size={32}
                          quality={1}
                          enchantment={0}
                        />
                        <span className="max-w-[200px] truncate font-medium">
                          {flip.itemName}
                        </span>
                      </div>
                    </td>

                    {/* Tier */}
                    <td className="whitespace-nowrap px-3 py-2">
                      <Badge variant="outline" className="font-mono text-xs">
                        T{flip.tier}
                      </Badge>
                    </td>

                    {/* Base Price (.0) */}
                    <td className="whitespace-nowrap px-3 py-2 text-right">
                      <PriceDisplay amount={flip.basePrice} showIcon={false} />
                    </td>

                    {/* Rune Cost */}
                    <td className="whitespace-nowrap px-3 py-2 text-right">
                      <div>
                        <PriceDisplay amount={flip.runeTotalCost} showIcon={false} />
                        <div className="text-[10px] text-muted-foreground">
                          {flip.runeCount} x {formatSilver(flip.runePrice)}
                        </div>
                      </div>
                    </td>

                    {/* Total Cost */}
                    <td className="whitespace-nowrap px-3 py-2 text-right font-medium">
                      <PriceDisplay amount={flip.totalCost} showIcon={false} />
                    </td>

                    {/* BM Price (.1) */}
                    <td className="whitespace-nowrap px-3 py-2 text-right">
                      <PriceDisplay amount={flip.bmPriceEnchanted} showIcon={false} />
                    </td>

                    {/* Tax */}
                    <td className="whitespace-nowrap px-3 py-2 text-right text-muted-foreground font-mono text-xs">
                      {formatSilver(flip.salesTax)}
                    </td>

                    {/* Net Profit */}
                    <td className="whitespace-nowrap px-3 py-2 text-right">
                      <span
                        className={cn(
                          'font-semibold font-mono',
                          flip.enchantFlipProfit > 0
                            ? 'text-green-500'
                            : 'text-red-500',
                        )}
                      >
                        {formatSilver(flip.enchantFlipProfit, { showSign: true })}
                      </span>
                    </td>

                    {/* vs Direct Flip */}
                    <td className="whitespace-nowrap px-3 py-2 text-right">
                      <span
                        className={cn(
                          'font-mono text-xs',
                          flip.profitDifference > 0
                            ? 'text-green-500'
                            : flip.profitDifference < 0
                              ? 'text-red-500'
                              : 'text-muted-foreground',
                        )}
                      >
                        {flip.profitDifference > 0 ? '+' : ''}
                        {formatSilver(flip.profitDifference)}
                      </span>
                      {flip.directFlipProfit > 0 && (
                        <div className="text-[10px] text-muted-foreground">
                          Direct: {formatSilver(flip.directFlipProfit)}
                        </div>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )
}
