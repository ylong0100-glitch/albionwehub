'use client'

import * as React from 'react'
import { RefreshCw, Settings2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { EmptyState } from '@/components/shared/empty-state'
import { useAppStore } from '@/lib/stores/app-store'
import { usePrices } from '@/features/market/hooks/use-prices'
import { PriceSearchBar } from '@/features/market/components/price-search-bar'
import { PriceComparisonTable } from '@/features/market/components/price-comparison-table'
import { PriceDetailPanel } from '@/features/market/components/price-detail-panel'
import { FavoritesPanel } from '@/features/market/components/favorites-panel'
import { ROYAL_CITIES } from '@/lib/utils/constants'

const DEFAULT_LOCATIONS = [...ROYAL_CITIES]

export default function SmartPriceChecker() {
  const { region } = useAppStore()
  const [searchedItems, setSearchedItems] = React.useState<string[]>([])
  const [selectedItemId, setSelectedItemId] = React.useState<string | undefined>()
  const [locations] = React.useState<string[]>([...DEFAULT_LOCATIONS])
  const [showFavorites, setShowFavorites] = React.useState(true)

  const {
    data: priceData,
    isLoading,
    error,
    refetch,
  } = usePrices(searchedItems, {
    region,
    locations,
    qualities: [1],
  })

  const handleSearch = React.useCallback((itemIds: string[]) => {
    setSearchedItems(itemIds)
    setSelectedItemId(undefined)
  }, [])

  const handleSelectItem = React.useCallback((itemId: string) => {
    setSelectedItemId((prev) => (prev === itemId ? undefined : itemId))
  }, [])

  // Derive active cities from data
  const activeCities = React.useMemo(() => {
    if (priceData.length === 0) return locations
    const cities = new Set(priceData.map((e) => e.city))
    // Keep the order from locations
    return locations.filter((l) => cities.has(l))
  }, [priceData, locations])

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Smart Price Checker
          </h1>
          <p className="text-sm text-muted-foreground">
            Compare prices across all Albion cities in real time.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs capitalize">
            {region}
          </Badge>
          {searchedItems.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetch()}
              disabled={isLoading}
            >
              <RefreshCw
                className={`mr-1.5 size-3.5 ${isLoading ? 'animate-spin' : ''}`}
              />
              Refresh
            </Button>
          )}
          <Button
            variant={showFavorites ? 'default' : 'outline'}
            size="sm"
            onClick={() => setShowFavorites((s) => !s)}
          >
            <Settings2 className="mr-1.5 size-3.5" />
            Favorites
          </Button>
        </div>
      </div>

      {/* Search bar */}
      <PriceSearchBar onSearch={handleSearch} />

      {/* Error state */}
      {error && (
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4">
          <p className="text-sm text-destructive">{error}</p>
          <Button
            variant="outline"
            size="sm"
            className="mt-2"
            onClick={() => refetch()}
          >
            Try Again
          </Button>
        </div>
      )}

      {/* Main content */}
      <div className="flex flex-col gap-6 lg:flex-row">
        {/* Left: Table + Detail */}
        <div className="min-w-0 flex-1 space-y-6">
          {searchedItems.length === 0 ? (
            <EmptyState
              title="Search for Items"
              description="Enter one or more item IDs above to compare prices across cities. Use comma-separated IDs to compare multiple items."
            />
          ) : (
            <PriceComparisonTable
              data={priceData}
              isLoading={isLoading}
              cities={activeCities}
              onSelectItem={handleSelectItem}
              selectedItemId={selectedItemId}
            />
          )}

          {/* Detail panel */}
          {selectedItemId && (
            <PriceDetailPanel
              itemId={selectedItemId}
              region={region}
              locations={locations}
              onClose={() => setSelectedItemId(undefined)}
            />
          )}
        </div>

        {/* Right: Favorites */}
        {showFavorites && (
          <div className="w-full shrink-0 lg:w-72">
            <FavoritesPanel
              region={region}
              locations={locations}
              onSelectItem={(itemId) => {
                setSearchedItems((prev) =>
                  prev.includes(itemId) ? prev : [...prev, itemId],
                )
                setSelectedItemId(itemId)
              }}
            />
          </div>
        )}
      </div>
    </div>
  )
}
