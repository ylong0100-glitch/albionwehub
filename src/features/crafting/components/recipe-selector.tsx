'use client'

import * as React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ItemSearch } from '@/components/shared/item-search'
import { useGameDataStore } from '@/lib/stores/game-data-store'
import { ItemIcon } from '@/components/shared/item-icon'
import { Badge } from '@/components/ui/badge'
import type { ProcessedItem } from '@/types/game-data'

interface RecipeSelectorProps {
  selectedItemId: string | null
  onSelect: (itemId: string | null) => void
}

export function RecipeSelector({ selectedItemId, onSelect }: RecipeSelectorProps) {
  const { getItem, getRecipe } = useGameDataStore()

  const selectedItem = selectedItemId ? getItem(selectedItemId) : undefined
  const selectedRecipeData = selectedItemId ? getRecipe(selectedItemId) : undefined

  const handleSelect = React.useCallback(
    (itemId: string, _item: ProcessedItem) => {
      onSelect(itemId)
    },
    [onSelect],
  )

  return (
    <Card>
      <CardHeader>
        <CardTitle>Select Recipe</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Selected item display */}
        {selectedItem && (
          <div className="flex items-center gap-3 rounded-lg border bg-muted/50 p-3">
            <ItemIcon
              itemId={selectedItem.id}
              size={40}
              enchantment={selectedItem.enchantment}
            />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{selectedItem.name}</p>
              <p className="text-xs text-muted-foreground">
                T{selectedItem.tier}
                {selectedItem.enchantment > 0 && `.${selectedItem.enchantment}`}
                {selectedItem.category && ` \u00b7 ${selectedItem.category}`}
              </p>
              {selectedRecipeData && (
                <p className="text-xs text-muted-foreground">
                  {selectedRecipeData.materials.length} material
                  {selectedRecipeData.materials.length !== 1 ? 's' : ''}
                  {selectedRecipeData.craftingFocus > 0 &&
                    ` \u00b7 ${selectedRecipeData.craftingFocus} focus`}
                </p>
              )}
              {!selectedRecipeData && (
                <Badge variant="secondary" className="mt-1 text-[10px]">
                  No recipe
                </Badge>
              )}
            </div>
            <button
              onClick={() => onSelect(null)}
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              Clear
            </button>
          </div>
        )}

        {/* Item search - craftable items only */}
        <ItemSearch
          value={selectedItemId}
          onSelect={handleSelect}
          placeholder="Search craftable items..."
          craftableOnly
        />
      </CardContent>
    </Card>
  )
}
