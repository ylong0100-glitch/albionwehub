'use client'

import { useMemo } from 'react'
import { Calculator, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useCraftingStore } from '@/lib/stores/crafting-store'
import { RECIPES, calculateProfit } from '@/features/crafting/utils/crafting-calc'
import { useCraftingPrices } from '@/features/crafting/hooks/use-crafting-prices'
import { RecipeSelector } from '@/features/crafting/components/recipe-selector'
import { CraftingSettings } from '@/features/crafting/components/crafting-settings'
import { MaterialBreakdown } from '@/features/crafting/components/material-breakdown'
import { ProfitSummary } from '@/features/crafting/components/profit-summary'
import { ShoppingList } from '@/features/crafting/components/shopping-list'

export default function CraftingCalculatorPage() {
  const {
    selectedItem,
    craftingCity,
    quantity,
    useFocus,
    includeJournals,
    setSelectedItem,
    setCraftingCity,
    setQuantity,
    setUseFocus,
    setIncludeJournals,
  } = useCraftingStore()

  const selectedRecipe = selectedItem ? RECIPES[selectedItem] ?? null : null

  const {
    materialPrices,
    productPrice,
    isLoading,
    error,
    refetch,
  } = useCraftingPrices(selectedRecipe, craftingCity)

  // Calculate profit result
  const result = useMemo(() => {
    if (!selectedRecipe || isLoading) return null
    // Only calculate if we have at least some prices
    const hasAnyPrice =
      productPrice > 0 || Object.values(materialPrices).some((p) => p > 0)
    if (!hasAnyPrice) return null

    return calculateProfit(selectedRecipe, quantity, {
      city: craftingCity,
      useFocus,
      productPrice,
      materialPrices,
    })
  }, [selectedRecipe, quantity, craftingCity, useFocus, productPrice, materialPrices, isLoading])

  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Calculator className="size-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              Crafting Calculator
            </h1>
            <p className="text-sm text-muted-foreground">
              Calculate crafting costs, profits, and return rates
            </p>
          </div>
        </div>
        {selectedRecipe && (
          <Button
            variant="outline"
            size="sm"
            onClick={refetch}
            disabled={isLoading}
            className="gap-1.5"
          >
            <RefreshCw className={`size-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh Prices
          </Button>
        )}
      </div>

      {/* Error display */}
      {error && (
        <div className="rounded-lg border border-red-500/30 bg-red-500/5 p-3 text-sm text-red-500">
          Failed to fetch prices: {error}
        </div>
      )}

      {/* Main layout */}
      <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
        {/* Left column: Recipe selection + Settings */}
        <div className="space-y-4">
          <RecipeSelector
            selectedItemId={selectedItem}
            onSelect={setSelectedItem}
          />
          <CraftingSettings
            city={craftingCity}
            quantity={quantity}
            useFocus={useFocus}
            includeJournals={includeJournals}
            selectedRecipe={selectedRecipe}
            onCityChange={setCraftingCity}
            onQuantityChange={setQuantity}
            onFocusChange={setUseFocus}
            onJournalsChange={setIncludeJournals}
          />
        </div>

        {/* Right column: Results */}
        <div className="space-y-4">
          <ProfitSummary
            result={result}
            productPrice={productPrice}
            quantity={quantity}
            isLoading={isLoading && !!selectedRecipe}
            useFocus={useFocus}
          />
          <MaterialBreakdown
            materials={result?.materialsNeeded ?? []}
            totalCost={result?.materialCost ?? 0}
            isLoading={isLoading && !!selectedRecipe}
            returnRate={result?.returnRate ?? 0}
          />
        </div>
      </div>

      {/* Bottom: Shopping list (collapsible) */}
      {result && result.materialsNeeded.length > 0 && (
        <ShoppingList
          materials={result.materialsNeeded}
          totalCost={result.materialCost}
          recipeName={selectedRecipe?.name ?? ''}
          quantity={quantity}
        />
      )}
    </div>
  )
}
