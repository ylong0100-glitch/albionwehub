'use client'

import * as React from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { EmptyState } from '@/components/shared/empty-state'
import { usePortfolioStore } from '@/lib/stores/portfolio-store'
import { ScrollText } from 'lucide-react'
import { cn } from '@/lib/utils'

type FilterAction = 'all' | 'buy' | 'sell'

function formatSilver(amount: number): string {
  return amount.toLocaleString('en-US', { maximumFractionDigits: 0 })
}

function formatDate(iso: string): string {
  const d = new Date(iso)
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function TradeLogTable() {
  const tradeLog = usePortfolioStore((s) => s.tradeLog)
  const positions = usePortfolioStore((s) => s.positions)
  const [filter, setFilter] = React.useState<FilterAction>('all')

  // Build a map of position IDs to names for display
  const positionNames = React.useMemo(() => {
    const map: Record<string, string> = {}
    for (const pos of positions) {
      map[pos.id] = pos.itemName
    }
    return map
  }, [positions])

  const filtered = React.useMemo(() => {
    const logs = filter === 'all' ? tradeLog : tradeLog.filter((t) => t.action === filter)
    // Sort newest first
    return [...logs].sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    )
  }, [tradeLog, filter])

  if (tradeLog.length === 0) {
    return (
      <EmptyState
        icon={<ScrollText className="size-6" />}
        title="No Trade History"
        description="Your buy and sell transactions will appear here."
      />
    )
  }

  return (
    <div className="space-y-4">
      {/* Filter buttons */}
      <div className="flex items-center gap-2">
        {(['all', 'buy', 'sell'] as const).map((action) => (
          <Button
            key={action}
            variant={filter === action ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter(action)}
          >
            {action === 'all' ? 'All' : action === 'buy' ? 'Buys' : 'Sells'}
          </Button>
        ))}
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-lg border">
        <table className="w-full text-sm">
          <thead className="border-b bg-muted/50">
            <tr>
              <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground">
                Date
              </th>
              <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground">
                Item
              </th>
              <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground">
                Action
              </th>
              <th className="px-3 py-2 text-right text-xs font-medium text-muted-foreground">
                Qty
              </th>
              <th className="px-3 py-2 text-right text-xs font-medium text-muted-foreground">
                Price
              </th>
              <th className="px-3 py-2 text-right text-xs font-medium text-muted-foreground">
                Fees
              </th>
              <th className="px-3 py-2 text-right text-xs font-medium text-muted-foreground">
                Total
              </th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((trade) => {
              const total = trade.price * trade.quantity
              const itemName = positionNames[trade.positionId] || trade.positionId

              return (
                <tr
                  key={trade.id}
                  className="border-b last:border-b-0 transition-colors hover:bg-muted/30"
                >
                  <td className="px-3 py-2 text-muted-foreground whitespace-nowrap">
                    {formatDate(trade.timestamp)}
                  </td>
                  <td className="px-3 py-2 font-medium">{itemName}</td>
                  <td className="px-3 py-2">
                    <Badge
                      variant={trade.action === 'buy' ? 'default' : 'secondary'}
                      className={cn(
                        trade.action === 'buy'
                          ? 'bg-blue-500/15 text-blue-500'
                          : 'bg-amber-500/15 text-amber-500'
                      )}
                    >
                      {trade.action === 'buy' ? 'BUY' : 'SELL'}
                    </Badge>
                  </td>
                  <td className="px-3 py-2 text-right font-mono tabular-nums">
                    {trade.quantity.toLocaleString()}
                  </td>
                  <td className="px-3 py-2 text-right font-mono tabular-nums">
                    {formatSilver(trade.price)}
                  </td>
                  <td className="px-3 py-2 text-right font-mono tabular-nums text-muted-foreground">
                    {trade.fees > 0 ? formatSilver(trade.fees) : '-'}
                  </td>
                  <td className="px-3 py-2 text-right font-mono tabular-nums font-medium">
                    {formatSilver(total)}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
