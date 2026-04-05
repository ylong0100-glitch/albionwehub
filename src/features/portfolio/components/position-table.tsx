'use client'

import * as React from 'react'
import { Pencil, Trash2, ArrowUpDown, DollarSign } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ItemIcon } from '@/components/shared/item-icon'
import { EmptyState } from '@/components/shared/empty-state'
import { usePortfolioStore, type Position } from '@/lib/stores/portfolio-store'
import { calcPositionValue } from '../utils/portfolio-calc'
import { cn } from '@/lib/utils'
import { SellPositionDialog } from './sell-position-dialog'
import { EditPositionDialog } from './edit-position-dialog'

type SortField =
  | 'itemName'
  | 'city'
  | 'quantity'
  | 'avgBuyPrice'
  | 'marketValue'
  | 'pnl'
  | 'pnlPercent'

type SortDir = 'asc' | 'desc'

function formatSilver(amount: number): string {
  return amount.toLocaleString('en-US', { maximumFractionDigits: 0 })
}

interface PositionTableProps {
  onAddClick?: () => void
}

export function PositionTable({ onAddClick }: PositionTableProps) {
  const positions = usePortfolioStore((s) => s.positions)
  const removePosition = usePortfolioStore((s) => s.removePosition)

  const [sortField, setSortField] = React.useState<SortField>('itemName')
  const [sortDir, setSortDir] = React.useState<SortDir>('asc')
  const [sellPosition, setSellPosition] = React.useState<Position | null>(null)
  const [editPosition, setEditPosition] = React.useState<Position | null>(null)

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortField(field)
      setSortDir('asc')
    }
  }

  // Compute values for each position (using avgBuyPrice as current price placeholder)
  const positionsWithValues = React.useMemo(() => {
    return positions.map((pos) => {
      const currentPrice = pos.avgBuyPrice // No live price available
      const value = calcPositionValue(pos, currentPrice)
      return { ...pos, currentPrice, ...value }
    })
  }, [positions])

  // Sort
  const sorted = React.useMemo(() => {
    const list = [...positionsWithValues]
    const dir = sortDir === 'asc' ? 1 : -1

    list.sort((a, b) => {
      switch (sortField) {
        case 'itemName':
          return dir * a.itemName.localeCompare(b.itemName)
        case 'city':
          return dir * a.city.localeCompare(b.city)
        case 'quantity':
          return dir * (a.quantity - b.quantity)
        case 'avgBuyPrice':
          return dir * (a.avgBuyPrice - b.avgBuyPrice)
        case 'marketValue':
          return dir * (a.marketValue - b.marketValue)
        case 'pnl':
          return dir * (a.unrealizedPnL - b.unrealizedPnL)
        case 'pnlPercent':
          return dir * (a.unrealizedPnLPercent - b.unrealizedPnLPercent)
        default:
          return 0
      }
    })

    return list
  }, [positionsWithValues, sortField, sortDir])

  if (positions.length === 0) {
    return (
      <EmptyState
        icon={<DollarSign className="size-6" />}
        title="No Positions Yet"
        description="Add your first position to start tracking your portfolio."
        action={onAddClick ? { label: 'Add Position', onClick: onAddClick } : undefined}
      />
    )
  }

  const SortHeader = ({
    field,
    children,
    className,
  }: {
    field: SortField
    children: React.ReactNode
    className?: string
  }) => (
    <th className={cn('px-3 py-2 text-left text-xs font-medium text-muted-foreground', className)}>
      <button
        className="inline-flex items-center gap-1 hover:text-foreground transition-colors"
        onClick={() => toggleSort(field)}
      >
        {children}
        <ArrowUpDown
          className={cn(
            'size-3',
            sortField === field ? 'text-foreground' : 'text-muted-foreground/50'
          )}
        />
      </button>
    </th>
  )

  return (
    <>
      <div className="overflow-x-auto rounded-lg border">
        <table className="w-full text-sm">
          <thead className="border-b bg-muted/50">
            <tr>
              <SortHeader field="itemName">Item</SortHeader>
              <SortHeader field="city">City</SortHeader>
              <SortHeader field="quantity" className="text-right">
                Qty
              </SortHeader>
              <SortHeader field="avgBuyPrice" className="text-right">
                Avg Buy
              </SortHeader>
              <th className="px-3 py-2 text-right text-xs font-medium text-muted-foreground">
                Current
              </th>
              <SortHeader field="marketValue" className="text-right">
                Value
              </SortHeader>
              <SortHeader field="pnl" className="text-right">
                P&L
              </SortHeader>
              <SortHeader field="pnlPercent" className="text-right">
                P&L%
              </SortHeader>
              <th className="px-3 py-2 text-right text-xs font-medium text-muted-foreground">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((pos) => {
              const pnlColor =
                pos.unrealizedPnL > 0
                  ? 'bg-green-500/5'
                  : pos.unrealizedPnL < 0
                    ? 'bg-red-500/5'
                    : ''

              return (
                <tr
                  key={pos.id}
                  className={cn(
                    'border-b last:border-b-0 transition-colors hover:bg-muted/30',
                    pnlColor
                  )}
                >
                  {/* Item */}
                  <td className="px-3 py-2">
                    <div className="flex items-center gap-2">
                      <ItemIcon itemId={pos.itemId} size={32} />
                      <div>
                        <div className="font-medium">{pos.itemName}</div>
                        <div className="text-xs text-muted-foreground">
                          {pos.itemId}
                        </div>
                      </div>
                    </div>
                  </td>
                  {/* City */}
                  <td className="px-3 py-2">
                    <Badge variant="outline">{pos.city}</Badge>
                  </td>
                  {/* Quantity */}
                  <td className="px-3 py-2 text-right font-mono tabular-nums">
                    {pos.quantity.toLocaleString()}
                  </td>
                  {/* Avg Buy */}
                  <td className="px-3 py-2 text-right font-mono tabular-nums">
                    {formatSilver(pos.avgBuyPrice)}
                  </td>
                  {/* Current */}
                  <td className="px-3 py-2 text-right font-mono tabular-nums text-muted-foreground">
                    {formatSilver(pos.currentPrice)}
                  </td>
                  {/* Market Value */}
                  <td className="px-3 py-2 text-right font-mono tabular-nums">
                    {formatSilver(pos.marketValue)}
                  </td>
                  {/* P&L */}
                  <td
                    className={cn(
                      'px-3 py-2 text-right font-mono tabular-nums',
                      pos.unrealizedPnL > 0
                        ? 'text-green-500'
                        : pos.unrealizedPnL < 0
                          ? 'text-red-500'
                          : ''
                    )}
                  >
                    {pos.unrealizedPnL >= 0 ? '+' : ''}
                    {formatSilver(pos.unrealizedPnL)}
                  </td>
                  {/* P&L% */}
                  <td
                    className={cn(
                      'px-3 py-2 text-right font-mono tabular-nums',
                      pos.unrealizedPnLPercent > 0
                        ? 'text-green-500'
                        : pos.unrealizedPnLPercent < 0
                          ? 'text-red-500'
                          : ''
                    )}
                  >
                    {pos.unrealizedPnLPercent >= 0 ? '+' : ''}
                    {pos.unrealizedPnLPercent.toFixed(1)}%
                  </td>
                  {/* Actions */}
                  <td className="px-3 py-2 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => setEditPosition(pos)}
                        title="Edit"
                      >
                        <Pencil className="size-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => setSellPosition(pos)}
                        title="Sell"
                      >
                        <DollarSign className="size-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => removePosition(pos.id)}
                        title="Delete"
                      >
                        <Trash2 className="size-3.5" />
                      </Button>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <SellPositionDialog
        position={sellPosition}
        open={sellPosition !== null}
        onOpenChange={(open) => {
          if (!open) setSellPosition(null)
        }}
      />

      <EditPositionDialog
        position={editPosition}
        open={editPosition !== null}
        onOpenChange={(open) => {
          if (!open) setEditPosition(null)
        }}
      />
    </>
  )
}
