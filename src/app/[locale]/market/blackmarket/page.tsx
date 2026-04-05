'use client'

import * as React from 'react'
import { AlertTriangle, Store } from 'lucide-react'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { useGameDataStore } from '@/lib/stores/game-data-store'
import { useFlipperStore } from '@/lib/stores/flipper-store'
import { useFlipperScan } from '@/features/blackmarket/hooks/use-flipper-scan'
import { useEnchantFlipScan } from '@/features/blackmarket/hooks/use-enchant-flip-scan'
import { FlipperFilters } from '@/features/blackmarket/components/flipper-filters'
import { FlipperStats } from '@/features/blackmarket/components/flipper-stats'
import { FlipperTable } from '@/features/blackmarket/components/flipper-table'
import { EnchantFlipTable } from '@/features/blackmarket/components/enchant-flip-table'
import { FlipDetailDialog } from '@/features/blackmarket/components/flip-detail-dialog'
import { filterAndSortFlips, type FlipOpportunity } from '@/features/blackmarket/utils/flipper-calc'
import { PageSkeleton } from '@/components/shared/loading-states'

export default function BlackMarketFlipper() {
  const { loaded, loading, loadGameData } = useGameDataStore()
  const filters = useFlipperStore()

  // Direct flip scanner
  const directScan = useFlipperScan()
  // Enchant-flip scanner
  const enchantScan = useEnchantFlipScan()

  const [activeTab, setActiveTab] = React.useState('direct')
  const [selectedFlip, setSelectedFlip] = React.useState<FlipOpportunity | null>(null)
  const [detailOpen, setDetailOpen] = React.useState(false)

  // Load game data on mount
  React.useEffect(() => {
    loadGameData()
  }, [loadGameData])

  // Apply client-side filters to direct flip results
  const filteredOpportunities = React.useMemo(
    () => filterAndSortFlips(directScan.opportunities, filters),
    [directScan.opportunities, filters],
  )

  // Handle row click for direct flips
  const handleRowClick = React.useCallback((flip: FlipOpportunity) => {
    setSelectedFlip(flip)
    setDetailOpen(true)
  }, [])

  // Unified scan/cancel handlers
  const isScanning = activeTab === 'direct' ? directScan.isScanning : enchantScan.isScanning
  const progress = activeTab === 'direct' ? directScan.progress : enchantScan.progress

  const handleScan = React.useCallback(() => {
    if (activeTab === 'direct') {
      directScan.scan()
    } else {
      enchantScan.scan()
    }
  }, [activeTab, directScan, enchantScan])

  const handleCancel = React.useCallback(() => {
    if (activeTab === 'direct') {
      directScan.cancel()
    } else {
      enchantScan.cancel()
    }
  }, [activeTab, directScan, enchantScan])

  const error = activeTab === 'direct' ? directScan.error : enchantScan.error

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
        onScan={handleScan}
        onCancel={handleCancel}
        isScanning={isScanning}
        progress={progress}
      />

      {/* Error display */}
      {error && !isScanning && (
        <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-600 dark:text-red-400">
          {error}
        </div>
      )}

      {/* Tabs: Direct Flips | Enchant & Flip */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="direct">
            Direct Flips
            {filteredOpportunities.length > 0 && (
              <span className="ml-1.5 text-xs opacity-70">
                ({filteredOpportunities.length})
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="enchant">
            Enchant & Flip
            {enchantScan.opportunities.length > 0 && (
              <span className="ml-1.5 text-xs opacity-70">
                ({enchantScan.opportunities.length})
              </span>
            )}
          </TabsTrigger>
        </TabsList>

        {/* Direct Flips tab */}
        <TabsContent value="direct" className="space-y-6 mt-4">
          {/* Stats row */}
          {filteredOpportunities.length > 0 && (
            <FlipperStats opportunities={filteredOpportunities} />
          )}

          {/* Results table */}
          <FlipperTable
            opportunities={filteredOpportunities}
            isScanning={directScan.isScanning}
            onRowClick={handleRowClick}
          />
        </TabsContent>

        {/* Enchant & Flip tab */}
        <TabsContent value="enchant" className="space-y-6 mt-4">
          <EnchantFlipTable
            opportunities={enchantScan.opportunities}
            isScanning={enchantScan.isScanning}
          />
        </TabsContent>
      </Tabs>

      {/* Detail dialog (for direct flips) */}
      <FlipDetailDialog
        flip={selectedFlip}
        open={detailOpen}
        onOpenChange={setDetailOpen}
      />
    </div>
  )
}
