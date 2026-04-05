'use client'

import * as React from 'react'
import { Search } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ItemIcon } from '@/components/shared/item-icon'
import {
  RECIPES,
  getRecipesByCategory,
  CATEGORY_LABELS,
  type Recipe,
  type RecipeCategory,
} from '@/features/crafting/utils/crafting-calc'

interface RecipeSelectorProps {
  selectedItemId: string | null
  onSelect: (itemId: string | null) => void
}

export function RecipeSelector({ selectedItemId, onSelect }: RecipeSelectorProps) {
  const [search, setSearch] = React.useState('')
  const [expandedCategory, setExpandedCategory] = React.useState<RecipeCategory | null>(null)

  const grouped = React.useMemo(() => getRecipesByCategory(), [])

  const filteredGroups = React.useMemo(() => {
    const query = search.toLowerCase().trim()
    if (!query) return grouped

    const result: Record<RecipeCategory, Recipe[]> = {
      accessories: [],
      cloth_armor: [],
      leather_armor: [],
      plate_armor: [],
      weapons: [],
      consumables: [],
    }

    for (const [cat, recipes] of Object.entries(grouped)) {
      result[cat as RecipeCategory] = recipes.filter(
        (r) =>
          r.name.toLowerCase().includes(query) ||
          r.itemId.toLowerCase().includes(query),
      )
    }
    return result
  }, [grouped, search])

  const selectedRecipe = selectedItemId ? RECIPES[selectedItemId] : null

  const categoryOrder: RecipeCategory[] = [
    'accessories',
    'cloth_armor',
    'leather_armor',
    'plate_armor',
    'weapons',
    'consumables',
  ]

  const tierColors: Record<number, string> = {
    4: 'bg-amber-500/20 text-amber-600',
    5: 'bg-orange-500/20 text-orange-600',
    6: 'bg-red-500/20 text-red-600',
    7: 'bg-zinc-500/20 text-zinc-600',
    8: 'bg-yellow-500/20 text-yellow-700',
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Select Recipe</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Selected item display */}
        {selectedRecipe && (
          <div className="flex items-center gap-3 rounded-lg border bg-muted/50 p-3">
            <ItemIcon itemId={selectedRecipe.itemId} size={40} />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{selectedRecipe.name}</p>
              <p className="text-xs text-muted-foreground">
                T{selectedRecipe.tier} &middot; {selectedRecipe.craftingStation}
              </p>
            </div>
            <button
              onClick={() => onSelect(null)}
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              Clear
            </button>
          </div>
        )}

        {/* Search */}
        <div className="relative">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search items..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Recipe list grouped by category */}
        <div className="max-h-80 space-y-1 overflow-y-auto">
          {categoryOrder.map((cat) => {
            const recipes = filteredGroups[cat]
            if (recipes.length === 0) return null

            const isExpanded = expandedCategory === cat || search.trim().length > 0

            return (
              <div key={cat}>
                <button
                  className="flex w-full items-center justify-between rounded-md px-2 py-1.5 text-left text-xs font-medium text-muted-foreground hover:bg-muted"
                  onClick={() =>
                    setExpandedCategory(expandedCategory === cat ? null : cat)
                  }
                >
                  <span>{CATEGORY_LABELS[cat]}</span>
                  <Badge variant="secondary" className="text-[10px]">
                    {recipes.length}
                  </Badge>
                </button>

                {isExpanded && (
                  <div className="space-y-0.5 pb-1">
                    {recipes.map((recipe) => (
                      <button
                        key={recipe.itemId}
                        className={cn(
                          'flex w-full items-center gap-2.5 rounded-md px-2 py-1.5 text-left transition-colors hover:bg-muted',
                          selectedItemId === recipe.itemId &&
                            'bg-primary/10 ring-1 ring-primary/20',
                        )}
                        onClick={() => onSelect(recipe.itemId)}
                      >
                        <ItemIcon itemId={recipe.itemId} size={28} />
                        <span className="min-w-0 flex-1 truncate text-sm">
                          {recipe.name}
                        </span>
                        <span
                          className={cn(
                            'rounded px-1.5 py-0.5 text-[10px] font-semibold',
                            tierColors[recipe.tier] ?? 'bg-muted text-muted-foreground',
                          )}
                        >
                          T{recipe.tier}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
