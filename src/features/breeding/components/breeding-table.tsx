'use client'

import { useState, useMemo } from 'react'
import { ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ItemIcon } from '@/components/shared/item-icon'
import type { BreedingResult } from '../utils/breeding-calc'

type SortKey = keyof Pick<
  BreedingResult,
  'babyCost' | 'foodCost' | 'adultPrice' | 'offspringChance' | 'revenue' | 'profit' | 'dailyProfit' | 'profitPerFocus'
> | 'tier' | 'name'

type CategoryFilter = 'all' | 'farm' | 'mount'

function formatNumber(n: number): string {
  return Math.round(n).toLocaleString('en-US')
}

function formatPercent(n: number): string {
  return `${(n * 100).toFixed(1)}%`
}

function profitColor(value: number): string {
  if (value > 0) return 'text-green-500'
  if (value < 0) return 'text-red-500'
  return 'text-muted-foreground'
}

interface BreedingTableProps {
  results: BreedingResult[]
}

export function BreedingTable({ results }: BreedingTableProps) {
  const [sortKey, setSortKey] = useState<SortKey>('dailyProfit')
  const [sortAsc, setSortAsc] = useState(false)
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('all')

  const filtered = useMemo(() => {
    let items = [...results]
    if (categoryFilter !== 'all') {
      items = items.filter((r) => r.animal.category === categoryFilter)
    }
    return items
  }, [results, categoryFilter])

  const sorted = useMemo(() => {
    const list = [...filtered]
    list.sort((a, b) => {
      let aVal: number | string
      let bVal: number | string

      switch (sortKey) {
        case 'tier':
          aVal = a.animal.tier
          bVal = b.animal.tier
          break
        case 'name':
          aVal = a.animal.name
          bVal = b.animal.name
          break
        default:
          aVal = a[sortKey]
          bVal = b[sortKey]
      }

      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return sortAsc ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal)
      }
      return sortAsc
        ? (aVal as number) - (bVal as number)
        : (bVal as number) - (aVal as number)
    })
    return list
  }, [filtered, sortKey, sortAsc])

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortAsc(!sortAsc)
    } else {
      setSortKey(key)
      setSortAsc(false)
    }
  }

  const SortIcon = ({ column }: { column: SortKey }) => {
    if (sortKey !== column)
      return <ArrowUpDown className="ml-1 inline size-3 text-muted-foreground" />
    return sortAsc ? (
      <ArrowUp className="ml-1 inline size-3" />
    ) : (
      <ArrowDown className="ml-1 inline size-3" />
    )
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg">Breeding Profits</CardTitle>
        <div className="flex gap-1">
          {(['all', 'farm', 'mount'] as CategoryFilter[]).map((cat) => (
            <Button
              key={cat}
              variant={categoryFilter === cat ? 'default' : 'outline'}
              size="sm"
              onClick={() => setCategoryFilter(cat)}
            >
              {cat === 'all' ? 'All' : cat === 'farm' ? 'Farm' : 'Mounts'}
            </Button>
          ))}
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-muted-foreground">
                <th className="pb-3 pr-4">
                  <button
                    onClick={() => handleSort('name')}
                    className="inline-flex items-center font-medium hover:text-foreground"
                  >
                    Animal
                    <SortIcon column="name" />
                  </button>
                </th>
                <th className="pb-3 pr-4">
                  <button
                    onClick={() => handleSort('tier')}
                    className="inline-flex items-center font-medium hover:text-foreground"
                  >
                    Tier
                    <SortIcon column="tier" />
                  </button>
                </th>
                <th className="pb-3 pr-4 text-right">
                  <button
                    onClick={() => handleSort('babyCost')}
                    className="inline-flex items-center font-medium hover:text-foreground"
                  >
                    Baby Cost
                    <SortIcon column="babyCost" />
                  </button>
                </th>
                <th className="pb-3 pr-4 text-right">
                  <button
                    onClick={() => handleSort('foodCost')}
                    className="inline-flex items-center font-medium hover:text-foreground"
                  >
                    Food Cost
                    <SortIcon column="foodCost" />
                  </button>
                </th>
                <th className="pb-3 pr-4 text-right">
                  <button
                    onClick={() => handleSort('adultPrice')}
                    className="inline-flex items-center font-medium hover:text-foreground"
                  >
                    Adult Price
                    <SortIcon column="adultPrice" />
                  </button>
                </th>
                <th className="pb-3 pr-4 text-right">
                  <button
                    onClick={() => handleSort('offspringChance')}
                    className="inline-flex items-center font-medium hover:text-foreground"
                  >
                    Offspring %
                    <SortIcon column="offspringChance" />
                  </button>
                </th>
                <th className="pb-3 pr-4 text-right">
                  <button
                    onClick={() => handleSort('revenue')}
                    className="inline-flex items-center font-medium hover:text-foreground"
                  >
                    Revenue
                    <SortIcon column="revenue" />
                  </button>
                </th>
                <th className="pb-3 pr-4 text-right">
                  <button
                    onClick={() => handleSort('profit')}
                    className="inline-flex items-center font-medium hover:text-foreground"
                  >
                    Profit
                    <SortIcon column="profit" />
                  </button>
                </th>
                <th className="pb-3 text-right">
                  <button
                    onClick={() => handleSort('dailyProfit')}
                    className="inline-flex items-center font-medium hover:text-foreground"
                  >
                    Daily Profit
                    <SortIcon column="dailyProfit" />
                  </button>
                </th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((result) => (
                <tr
                  key={result.animal.id}
                  className="border-b border-border/50 transition-colors hover:bg-muted/50"
                >
                  <td className="py-3 pr-4">
                    <div className="flex items-center gap-2">
                      <ItemIcon itemId={result.animal.id} size={32} />
                      <div>
                        <p className="font-medium">{result.animal.name}</p>
                        <Badge variant="outline" className="text-[10px]">
                          {result.animal.category}
                        </Badge>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 pr-4">
                    <Badge variant="secondary">T{result.animal.tier}</Badge>
                  </td>
                  <td className="py-3 pr-4 text-right font-mono tabular-nums">
                    {result.babyCost > 0
                      ? formatNumber(result.babyCost)
                      : 'N/A'}
                  </td>
                  <td className="py-3 pr-4 text-right font-mono tabular-nums">
                    {result.foodCost > 0
                      ? formatNumber(result.foodCost)
                      : 'N/A'}
                  </td>
                  <td className="py-3 pr-4 text-right font-mono tabular-nums">
                    {result.adultPrice > 0
                      ? formatNumber(result.adultPrice)
                      : 'N/A'}
                  </td>
                  <td className="py-3 pr-4 text-right font-mono tabular-nums">
                    {formatPercent(result.offspringChance)}
                  </td>
                  <td className="py-3 pr-4 text-right font-mono tabular-nums">
                    {formatNumber(result.revenue)}
                  </td>
                  <td
                    className={cn(
                      'py-3 pr-4 text-right font-mono tabular-nums font-medium',
                      profitColor(result.profit),
                    )}
                  >
                    {formatNumber(result.profit)}
                  </td>
                  <td
                    className={cn(
                      'py-3 text-right font-mono tabular-nums font-medium',
                      profitColor(result.dailyProfit),
                    )}
                  >
                    {formatNumber(result.dailyProfit)}
                  </td>
                </tr>
              ))}
              {sorted.length === 0 && (
                <tr>
                  <td
                    colSpan={9}
                    className="py-8 text-center text-muted-foreground"
                  >
                    No data available. Prices may still be loading.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )
}
