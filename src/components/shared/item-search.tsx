'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'
import { useGameDataStore } from '@/lib/stores/game-data-store'
import { ItemIcon } from '@/components/shared/item-icon'
import {
  Command,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from '@/components/ui/command'
import { Badge } from '@/components/ui/badge'
import { Loader2 } from 'lucide-react'
import type { ProcessedItem } from '@/types/game-data'

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------
interface ItemSearchProps {
  /** Currently selected item ID */
  value?: string | null
  /** Called when an item is selected */
  onSelect: (itemId: string, item: ProcessedItem) => void
  /** Placeholder text */
  placeholder?: string
  /** Only show items that have crafting recipes */
  craftableOnly?: boolean
  /** Additional CSS class for the outer wrapper */
  className?: string
  /** Max height of the results list */
  maxHeight?: number
}

// ---------------------------------------------------------------------------
// Tier badge colors
// ---------------------------------------------------------------------------
const tierColors: Record<number, string> = {
  1: 'bg-stone-500/20 text-stone-600',
  2: 'bg-green-500/20 text-green-600',
  3: 'bg-sky-500/20 text-sky-600',
  4: 'bg-amber-500/20 text-amber-600',
  5: 'bg-orange-500/20 text-orange-600',
  6: 'bg-red-500/20 text-red-600',
  7: 'bg-zinc-500/20 text-zinc-600',
  8: 'bg-yellow-500/20 text-yellow-700',
}

// ---------------------------------------------------------------------------
// Category display labels
// ---------------------------------------------------------------------------
const CATEGORY_LABELS: Record<string, string> = {
  weapons: 'Weapons',
  armor: 'Armor',
  accessories: 'Accessories',
  offhand: 'Off-Hand',
  consumables: 'Consumables',
  materials: 'Materials',
  resources: 'Resources',
  mounts: 'Mounts',
  farmables: 'Farmables',
  furniture: 'Furniture',
  trophies: 'Trophies',
  laborers: 'Laborers',
  tools: 'Tools',
  token: 'Tokens',
  other: 'Other',
}

function getCategoryLabel(cat: string): string {
  if (!cat) return 'Other'
  return CATEGORY_LABELS[cat] ?? cat.charAt(0).toUpperCase() + cat.slice(1)
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export function ItemSearch({
  value,
  onSelect,
  placeholder = 'Search items...',
  craftableOnly = false,
  className,
  maxHeight = 320,
}: ItemSearchProps) {
  const { loaded, loading, searchItems, getItem, getRecipe } = useGameDataStore()
  const [query, setQuery] = React.useState('')
  const [results, setResults] = React.useState<ProcessedItem[]>([])
  const debounceRef = React.useRef<ReturnType<typeof setTimeout> | null>(null)

  // Debounced search
  React.useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)

    if (!query.trim()) {
      setResults([])
      return
    }

    debounceRef.current = setTimeout(() => {
      let items = searchItems(query, 50)

      if (craftableOnly) {
        items = items.filter((item) => getRecipe(item.id) != null)
      }

      setResults(items.slice(0, 30))
    }, 150)

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [query, searchItems, craftableOnly, getRecipe])

  // Group results by category
  const grouped = React.useMemo(() => {
    const groups: Record<string, ProcessedItem[]> = {}
    for (const item of results) {
      const cat = item.category || 'other'
      if (!groups[cat]) groups[cat] = []
      groups[cat].push(item)
    }
    return groups
  }, [results])

  // Selected item info
  const selectedItem = value ? getItem(value) : undefined

  // Loading state
  if (loading) {
    return (
      <div
        className={cn(
          'flex items-center justify-center gap-2 rounded-lg border bg-muted/30 p-4 text-sm text-muted-foreground',
          className,
        )}
      >
        <Loader2 className="size-4 animate-spin" />
        Loading game data...
      </div>
    )
  }

  if (!loaded) {
    return (
      <div
        className={cn(
          'rounded-lg border bg-muted/30 p-4 text-center text-sm text-muted-foreground',
          className,
        )}
      >
        Game data not loaded. Please wait...
      </div>
    )
  }

  return (
    <div className={cn('space-y-2', className)}>
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
              {selectedItem.category && ` \u00b7 ${getCategoryLabel(selectedItem.category)}`}
            </p>
          </div>
        </div>
      )}

      {/* Search command */}
      <Command shouldFilter={false} className="rounded-lg border">
        <CommandInput
          placeholder={placeholder}
          value={query}
          onValueChange={setQuery}
        />
        <CommandList style={{ maxHeight }}>
          {query.trim().length > 0 && results.length === 0 && (
            <CommandEmpty>No items found.</CommandEmpty>
          )}

          {Object.entries(grouped).map(([cat, items]) => (
            <CommandGroup key={cat} heading={getCategoryLabel(cat)}>
              {items.map((item) => (
                <CommandItem
                  key={item.id}
                  value={item.id}
                  onSelect={() => {
                    onSelect(item.id, item)
                    setQuery('')
                    setResults([])
                  }}
                  className="gap-2.5"
                >
                  <ItemIcon
                    itemId={item.id}
                    size={28}
                    enchantment={item.enchantment}
                  />
                  <span className="min-w-0 flex-1 truncate text-sm">
                    {item.name}
                  </span>
                  <span
                    className={cn(
                      'rounded px-1.5 py-0.5 text-[10px] font-semibold',
                      tierColors[item.tier] ?? 'bg-muted text-muted-foreground',
                    )}
                  >
                    T{item.tier}
                    {item.enchantment > 0 && `.${item.enchantment}`}
                  </span>
                  {item.subcategory && (
                    <Badge variant="secondary" className="text-[10px]">
                      {item.subcategory}
                    </Badge>
                  )}
                </CommandItem>
              ))}
            </CommandGroup>
          ))}
        </CommandList>
      </Command>
    </div>
  )
}
