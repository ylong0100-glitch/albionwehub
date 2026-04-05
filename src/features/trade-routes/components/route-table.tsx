'use client'

import { useState, useMemo } from 'react'
import { ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ItemIcon } from '@/components/shared/item-icon'
import { EmptyState } from '@/components/shared/empty-state'
import type { TradeRoute } from '../utils/trade-calc'
import { CITY_COLORS } from '@/features/market/utils/format'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type SortKey =
  | 'itemName'
  | 'buyCity'
  | 'buyPrice'
  | 'sellCity'
  | 'sellPrice'
  | 'netProfit'
  | 'profitMargin'
  | 'weight'
  | 'profitPerWeight'

type SortDir = 'asc' | 'desc'

interface RouteTableProps {
  routes: TradeRoute[]
  isScanning: boolean
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatSilver(amount: number): string {
  return amount.toLocaleString('en-US')
}

function CityBadge({ city }: { city: string }) {
  const color = CITY_COLORS[city] ?? '#888'
  return (
    <span className="inline-flex items-center gap-1.5 text-xs font-medium">
      <span
        className="size-2 rounded-full shrink-0"
        style={{ backgroundColor: color }}
      />
      <span style={{ color }}>{city}</span>
    </span>
  )
}

// ---------------------------------------------------------------------------
// Column definitions
// ---------------------------------------------------------------------------

const COLUMNS: {
  key: SortKey
  label: string
  className?: string
  hideOnMobile?: boolean
}[] = [
  { key: 'itemName', label: 'Item' },
  { key: 'buyCity', label: 'Buy City', hideOnMobile: true },
  { key: 'buyPrice', label: 'Buy Price' },
  { key: 'sellCity', label: 'Sell City', hideOnMobile: true },
  { key: 'sellPrice', label: 'Sell Price' },
  { key: 'netProfit', label: 'Profit' },
  { key: 'profitMargin', label: 'Margin %', hideOnMobile: true },
  { key: 'weight', label: 'Weight', hideOnMobile: true },
  { key: 'profitPerWeight', label: 'Profit/kg', hideOnMobile: true },
]

const PAGE_SIZE = 50

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function RouteTable({ routes, isScanning }: RouteTableProps) {
  const [sortKey, setSortKey] = useState<SortKey>('netProfit')
  const [sortDir, setSortDir] = useState<SortDir>('desc')
  const [page, setPage] = useState(0)

  // Sort
  const sorted = useMemo(() => {
    const copy = [...routes]
    copy.sort((a, b) => {
      let aVal: number | string
      let bVal: number | string

      switch (sortKey) {
        case 'itemName':
          aVal = a.itemName.toLowerCase()
          bVal = b.itemName.toLowerCase()
          break
        case 'buyCity':
          aVal = a.buyCity
          bVal = b.buyCity
          break
        case 'sellCity':
          aVal = a.sellCity
          bVal = b.sellCity
          break
        case 'buyPrice':
          aVal = a.buyPrice
          bVal = b.buyPrice
          break
        case 'sellPrice':
          aVal = a.sellPrice
          bVal = b.sellPrice
          break
        case 'netProfit':
          aVal = a.netProfit
          bVal = b.netProfit
          break
        case 'profitMargin':
          aVal = a.profitMargin
          bVal = b.profitMargin
          break
        case 'weight':
          aVal = a.weight ?? -1
          bVal = b.weight ?? -1
          break
        case 'profitPerWeight':
          aVal = a.profitPerWeight ?? -1
          bVal = b.profitPerWeight ?? -1
          break
        default:
          return 0
      }

      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return sortDir === 'asc'
          ? aVal.localeCompare(bVal)
          : bVal.localeCompare(aVal)
      }

      return sortDir === 'asc'
        ? (aVal as number) - (bVal as number)
        : (bVal as number) - (aVal as number)
    })
    return copy
  }, [routes, sortKey, sortDir])

  // Pagination
  const totalPages = Math.ceil(sorted.length / PAGE_SIZE)
  const paginated = sorted.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE)

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortKey(key)
      setSortDir(key === 'itemName' || key === 'buyCity' || key === 'sellCity' ? 'asc' : 'desc')
    }
    setPage(0)
  }

  const SortIcon = ({ colKey }: { colKey: SortKey }) => {
    if (sortKey !== colKey) return <ArrowUpDown className="size-3 opacity-30" />
    return sortDir === 'asc' ? (
      <ArrowUp className="size-3" />
    ) : (
      <ArrowDown className="size-3" />
    )
  }

  if (!routes.length && !isScanning) {
    return (
      <EmptyState
        title="No routes found"
        description="Adjust your filters and click 'Find Routes' to scan for profitable trade routes between cities."
      />
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold">
            Trade Routes
            {routes.length > 0 && (
              <span className="ml-2 text-xs font-normal text-muted-foreground">
                ({routes.length.toLocaleString()} results)
              </span>
            )}
          </h3>
          {totalPages > 1 && (
            <div className="flex items-center gap-2 text-xs">
              <Button
                variant="outline"
                size="sm"
                className="h-6 px-2 text-xs"
                disabled={page === 0}
                onClick={() => setPage((p) => p - 1)}
              >
                Prev
              </Button>
              <span className="text-muted-foreground">
                {page + 1} / {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                className="h-6 px-2 text-xs"
                disabled={page >= totalPages - 1}
                onClick={() => setPage((p) => p + 1)}
              >
                Next
              </Button>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="overflow-x-auto p-0">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/50">
              {COLUMNS.map((col) => (
                <th
                  key={col.key}
                  className={cn(
                    'whitespace-nowrap px-3 py-2 text-left text-xs font-medium text-muted-foreground',
                    col.hideOnMobile && 'hidden lg:table-cell',
                  )}
                >
                  <button
                    onClick={() => toggleSort(col.key)}
                    className="inline-flex items-center gap-1 hover:text-foreground transition-colors"
                  >
                    {col.label}
                    <SortIcon colKey={col.key} />
                  </button>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paginated.map((route, idx) => (
              <tr
                key={`${route.itemId}-${route.buyCity}-${route.sellCity}-${idx}`}
                className="border-b last:border-0 hover:bg-muted/30 transition-colors"
              >
                {/* Item */}
                <td className="px-3 py-2">
                  <div className="flex items-center gap-2">
                    <ItemIcon
                      itemId={route.itemId}
                      size={32}
                      enchantment={route.enchantment}
                    />
                    <div className="min-w-0">
                      <p className="truncate text-xs font-medium">
                        {route.itemName}
                      </p>
                      <p className="text-[10px] text-muted-foreground">
                        T{route.tier}
                        {route.enchantment > 0 && `.${route.enchantment}`}
                        {' · '}
                        {route.category}
                      </p>
                    </div>
                  </div>
                </td>

                {/* Buy City */}
                <td className="hidden px-3 py-2 lg:table-cell">
                  <CityBadge city={route.buyCity} />
                </td>

                {/* Buy Price */}
                <td className="px-3 py-2">
                  <span className="font-mono text-xs tabular-nums">
                    {formatSilver(route.buyPrice)}
                  </span>
                  {/* Show city on mobile since city column is hidden */}
                  <span className="block text-[10px] text-muted-foreground lg:hidden">
                    <CityBadge city={route.buyCity} />
                  </span>
                </td>

                {/* Sell City */}
                <td className="hidden px-3 py-2 lg:table-cell">
                  <CityBadge city={route.sellCity} />
                </td>

                {/* Sell Price */}
                <td className="px-3 py-2">
                  <span className="font-mono text-xs tabular-nums">
                    {formatSilver(route.sellPrice)}
                  </span>
                  <span className="block text-[10px] text-muted-foreground lg:hidden">
                    <CityBadge city={route.sellCity} />
                  </span>
                </td>

                {/* Net Profit */}
                <td className="px-3 py-2">
                  <span
                    className={cn(
                      'font-mono text-xs font-semibold tabular-nums',
                      route.netProfit > 0
                        ? 'text-green-500'
                        : 'text-red-500',
                    )}
                  >
                    {route.netProfit > 0 ? '+' : ''}
                    {formatSilver(route.netProfit)}
                  </span>
                </td>

                {/* Margin */}
                <td className="hidden px-3 py-2 lg:table-cell">
                  <span
                    className={cn(
                      'text-xs font-medium',
                      route.profitMargin > 20
                        ? 'text-green-500'
                        : route.profitMargin > 10
                          ? 'text-green-400'
                          : route.profitMargin > 0
                            ? 'text-yellow-500'
                            : 'text-red-500',
                    )}
                  >
                    {route.profitMargin.toFixed(1)}%
                  </span>
                </td>

                {/* Weight */}
                <td className="hidden px-3 py-2 lg:table-cell">
                  <span className="text-xs text-muted-foreground">
                    {route.weight !== undefined
                      ? `${route.weight.toFixed(1)} kg`
                      : 'N/A'}
                  </span>
                </td>

                {/* Profit/kg */}
                <td className="hidden px-3 py-2 lg:table-cell">
                  <span className="text-xs text-muted-foreground">
                    {route.profitPerWeight !== undefined
                      ? formatSilver(Math.round(route.profitPerWeight))
                      : 'N/A'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </CardContent>
    </Card>
  )
}
