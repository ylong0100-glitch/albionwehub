'use client'

import * as React from 'react'
import {
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  AlertTriangle,
  Copy,
  Check,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { ItemIcon } from '@/components/shared/item-icon'
import { PriceDisplay } from '@/components/shared/price-display'
import { EmptyState } from '@/components/shared/empty-state'
import { formatSilver, formatTimeAgo } from '@/lib/utils/format'
import type { FlipOpportunity } from '../utils/flipper-calc'
import { getDataAgeHours } from '../utils/flipper-calc'

// Copy item name button (for pasting into in-game market search)
function CopyNameButton({ name }: { name: string }) {
  const [copied, setCopied] = React.useState(false)
  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation()
    navigator.clipboard.writeText(name)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }
  return (
    <button
      onClick={handleCopy}
      className="shrink-0 rounded p-0.5 text-muted-foreground hover:text-foreground transition-colors"
      title="Copy name for in-game market search"
    >
      {copied ? <Check className="size-3.5 text-green-500" /> : <Copy className="size-3.5" />}
    </button>
  )
}

// ---------------------------------------------------------------------------
// Sortable column keys
// ---------------------------------------------------------------------------
type SortKey =
  | 'itemName'
  | 'tier'
  | 'buyPrice'
  | 'sellPrice'
  | 'netProfit'
  | 'profitMargin'
  | 'dataAge'

interface SortConfig {
  key: SortKey
  direction: 'asc' | 'desc'
}

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------
interface FlipperTableProps {
  opportunities: FlipOpportunity[]
  isScanning: boolean
  onRowClick: (flip: FlipOpportunity) => void
  className?: string
}

// ---------------------------------------------------------------------------
// Helper: get oldest data age between buy and sell dates
// ---------------------------------------------------------------------------
function getOldestAge(flip: FlipOpportunity): number {
  return Math.max(
    getDataAgeHours(flip.buyPriceDate),
    getDataAgeHours(flip.sellPriceDate),
  )
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export function FlipperTable({
  opportunities,
  isScanning,
  onRowClick,
  className,
}: FlipperTableProps) {
  const [sort, setSort] = React.useState<SortConfig>({
    key: 'netProfit',
    direction: 'desc',
  })
  const [search, setSearch] = React.useState('')

  // Toggle sort on column header click
  const handleSort = (key: SortKey) => {
    setSort((prev) => ({
      key,
      direction: prev.key === key && prev.direction === 'desc' ? 'asc' : 'desc',
    }))
  }

  // Filter by search term
  const filtered = React.useMemo(() => {
    if (!search.trim()) return opportunities
    const q = search.toLowerCase()
    return opportunities.filter((flip) =>
      flip.itemName.toLowerCase().includes(q),
    )
  }, [opportunities, search])

  // Sort the data
  const sorted = React.useMemo(() => {
    const arr = [...filtered]
    const dir = sort.direction === 'asc' ? 1 : -1

    arr.sort((a, b) => {
      switch (sort.key) {
        case 'itemName':
          return dir * a.itemName.localeCompare(b.itemName)
        case 'tier':
          return dir * (a.tier - b.tier || a.enchantment - b.enchantment)
        case 'buyPrice':
          return dir * (a.buyPrice - b.buyPrice)
        case 'sellPrice':
          return dir * (a.sellPrice - b.sellPrice)
        case 'netProfit':
          return dir * (a.netProfit - b.netProfit)
        case 'profitMargin':
          return dir * (a.profitMargin - b.profitMargin)
        case 'dataAge':
          return dir * (getOldestAge(a) - getOldestAge(b))
        default:
          return 0
      }
    })

    return arr
  }, [filtered, sort])

  // Sort icon component
  const SortIcon = ({ column }: { column: SortKey }) => {
    if (sort.key !== column)
      return <ArrowUpDown className="ml-1 inline size-3 opacity-40" />
    return sort.direction === 'asc' ? (
      <ArrowUp className="ml-1 inline size-3" />
    ) : (
      <ArrowDown className="ml-1 inline size-3" />
    )
  }

  // Total potential profit
  const totalProfit = filtered.reduce((s, o) => s + o.netProfit, 0)

  if (!isScanning && opportunities.length === 0) {
    return (
      <EmptyState
        title="No flip opportunities"
        description="Click 'Scan Market' to search for profitable Black Market flips."
        className={className}
      />
    )
  }

  return (
    <Card className={cn('', className)}>
      <CardHeader className="flex-row items-center justify-between gap-2 space-y-0">
        <div className="space-y-0.5">
          <h3 className="text-sm font-semibold">
            Flip Opportunities
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
        {/* Search filter */}
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
                <th className="whitespace-nowrap px-3 py-2.5">Buy City</th>
                <th
                  className="cursor-pointer whitespace-nowrap px-3 py-2.5 text-right hover:text-foreground"
                  onClick={() => handleSort('buyPrice')}
                >
                  Buy Price
                  <SortIcon column="buyPrice" />
                </th>
                <th
                  className="cursor-pointer whitespace-nowrap px-3 py-2.5 text-right hover:text-foreground"
                  onClick={() => handleSort('sellPrice')}
                >
                  BM Price
                  <SortIcon column="sellPrice" />
                </th>
                <th className="whitespace-nowrap px-3 py-2.5 text-right">
                  Fees
                </th>
                <th
                  className="cursor-pointer whitespace-nowrap px-3 py-2.5 text-right hover:text-foreground"
                  onClick={() => handleSort('netProfit')}
                >
                  Net Profit
                  <SortIcon column="netProfit" />
                </th>
                <th
                  className="cursor-pointer whitespace-nowrap px-3 py-2.5 text-right hover:text-foreground"
                  onClick={() => handleSort('profitMargin')}
                >
                  Margin
                  <SortIcon column="profitMargin" />
                </th>
                <th
                  className="cursor-pointer whitespace-nowrap px-3 py-2.5 text-right hover:text-foreground"
                  onClick={() => handleSort('dataAge')}
                >
                  Data Age
                  <SortIcon column="dataAge" />
                </th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((flip, idx) => {
                const margin = flip.profitMargin * 100
                const ageHours = getOldestAge(flip)
                const isStale = ageHours > 2

                return (
                  <tr
                    key={`${flip.itemId}-${flip.buyQuality}-${idx}`}
                    className={cn(
                      'cursor-pointer border-b transition-colors hover:bg-muted/50',
                      margin >= 10 && 'bg-green-500/5',
                      margin < 3 && margin > 0 && 'bg-red-500/5',
                    )}
                    onClick={() => onRowClick(flip)}
                  >
                    {/* Item */}
                    <td className="px-4 py-2">
                      <div className="flex items-center gap-2.5">
                        <ItemIcon
                          itemId={flip.itemId}
                          size={32}
                          quality={flip.buyQuality}
                          enchantment={flip.enchantment}
                        />
                        <span className="max-w-[180px] truncate font-medium">
                          {flip.itemName}
                        </span>
                        <CopyNameButton name={flip.itemName} />
                      </div>
                    </td>

                    {/* Tier */}
                    <td className="whitespace-nowrap px-3 py-2">
                      <Badge variant="outline" className="font-mono text-xs">
                        T{flip.tier}
                        {flip.enchantment > 0 && `.${flip.enchantment}`}
                      </Badge>
                    </td>

                    {/* Buy City */}
                    <td className="whitespace-nowrap px-3 py-2 text-muted-foreground">
                      {flip.buyCity}
                    </td>

                    {/* Buy Price */}
                    <td className="whitespace-nowrap px-3 py-2 text-right">
                      <PriceDisplay amount={flip.buyPrice} showIcon={false} />
                    </td>

                    {/* BM Price */}
                    <td className="whitespace-nowrap px-3 py-2 text-right">
                      <PriceDisplay amount={flip.sellPrice} showIcon={false} />
                    </td>

                    {/* Fees */}
                    <td className="whitespace-nowrap px-3 py-2 text-right text-muted-foreground font-mono text-xs">
                      {formatSilver(flip.salesTax)}
                    </td>

                    {/* Net Profit */}
                    <td className="whitespace-nowrap px-3 py-2 text-right">
                      <span
                        className={cn(
                          'font-semibold font-mono',
                          flip.netProfit > 0
                            ? 'text-green-500'
                            : 'text-red-500',
                        )}
                      >
                        {formatSilver(flip.netProfit, { showSign: true })}
                      </span>
                    </td>

                    {/* Margin */}
                    <td className="whitespace-nowrap px-3 py-2 text-right">
                      <span
                        className={cn(
                          'font-mono text-xs',
                          margin >= 10
                            ? 'text-green-500'
                            : margin < 3
                              ? 'text-red-500'
                              : 'text-muted-foreground',
                        )}
                      >
                        {margin.toFixed(1)}%
                      </span>
                    </td>

                    {/* Data Age */}
                    <td className="whitespace-nowrap px-3 py-2 text-right">
                      <span
                        className={cn(
                          'inline-flex items-center gap-1 text-xs',
                          isStale
                            ? 'text-amber-500'
                            : 'text-muted-foreground',
                        )}
                      >
                        {isStale && (
                          <AlertTriangle className="size-3" />
                        )}
                        {formatTimeAgo(flip.sellPriceDate)}
                      </span>
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
