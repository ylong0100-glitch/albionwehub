'use client'

import * as React from 'react'
import { AlertTriangle, Store } from 'lucide-react'
import { useGameDataStore } from '@/lib/stores/game-data-store'
import { useFlipperStore } from '@/lib/stores/flipper-store'
import { useFlipperScan } from '@/features/blackmarket/hooks/use-flipper-scan'
import { FlipperFilters } from '@/features/blackmarket/components/flipper-filters'
import { FlipperStats } from '@/features/blackmarket/components/flipper-stats'
import { FlipperTable } from '@/features/blackmarket/components/flipper-table'
import { FlipDetailDialog } from '@/features/blackmarket/components/flip-detail-dialog'
import { filterAndSortFlips, type FlipOpportunity } from '@/features/blackmarket/utils/flipper-calc'
import { PageSkeleton } from '@/components/shared/loading-states'

export default function BlackMarketFlipper() {
  const { loaded, loading, loadGameData } = useGameDataStore()
  const filters = useFlipperStore()
  const { opportunities, isScanning, progress, error, scan, cancel } =
    useFlipperScan()

  const [selectedFlip, setSelectedFlip] = React.useState<FlipOpportunity | null>(null)
  const [detailOpen, setDetailOpen] = React.useState(false)

  // Load game data on mount
  React.useEffect(() => {
    loadGameData()
  }, [loadGameData])

  // Apply client-side filters to results
  const filteredOpportunities = React.useMemo(
    () => filterAndSortFlips(opportunities, filters),
    [opportunities, filters],
  )

  // Handle row click
  const handleRowClick = React.useCallback((flip: FlipOpportunity) => {
    setSelectedFlip(flip)
    setDetailOpen(true)
  }, [])

  // Loading state while game data loads
  if (loading && !loaded) {
    return (
      <div className="p-6">
        <PageSkeleton />
      </div>
    )
  }

  return (
    <div className="space-y-6 p-6">
      {/* Page header */}
      <div>
        <div className="flex items-center gap-2.5">
          <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Store className="size-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              Black Market Flipper
            </h1>
            <p className="text-sm text-muted-foreground">
              Find profitable arbitrage: buy equipment in cities, sell to the
              Black Market in Caerleon.
            </p>
          </div>
        </div>
      </div>

      {/* Community data warning */}
      <div className="flex items-start gap-2 rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-600 dark:text-amber-400">
        <AlertTriangle className="mt-0.5 size-4 shrink-0" />
        <p>
          Price data depends on community uploads. Run the{' '}
          <span className="font-semibold">Albion Data Client</span> for best
          results. Prices may be incomplete or outdated for some items.
        </p>
      </div>

      {/* Filters */}
      <FlipperFilters
        onScan={scan}
        onCancel={cancel}
        isScanning={isScanning}
        progress={progress}
      />

      {/* Error display */}
      {error && !isScanning && (
        <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-600 dark:text-red-400">
          {error}
        </div>
      )}

      {/* Stats row */}
      {filteredOpportunities.length > 0 && (
        <FlipperStats opportunities={filteredOpportunities} />
      )}

      {/* Results table */}
      <FlipperTable
        opportunities={filteredOpportunities}
        isScanning={isScanning}
        onRowClick={handleRowClick}
      />

      {/* Detail dialog */}
      <FlipDetailDialog
        flip={selectedFlip}
        open={detailOpen}
        onOpenChange={setDetailOpen}
      />
    </div>
  )
}
