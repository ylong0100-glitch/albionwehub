'use client'

import * as React from 'react'
import { Search, X, Clock, Star } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { useMarketStore } from '@/lib/stores/market-store'

interface PriceSearchBarProps {
  onSearch: (itemIds: string[]) => void
  className?: string
}

export function PriceSearchBar({ onSearch, className }: PriceSearchBarProps) {
  const [inputValue, setInputValue] = React.useState('')
  const [showSuggestions, setShowSuggestions] = React.useState(false)
  const inputRef = React.useRef<HTMLInputElement>(null)
  const containerRef = React.useRef<HTMLDivElement>(null)

  const { recentSearches, addRecentSearch, favorites } = useMarketStore()

  // Close suggestions when clicking outside
  React.useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setShowSuggestions(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSubmit = React.useCallback(
    (e?: React.FormEvent) => {
      e?.preventDefault()
      const trimmed = inputValue.trim()
      if (!trimmed) return

      // Support comma-separated item IDs
      const ids = trimmed
        .split(',')
        .map((s) => s.trim().toUpperCase())
        .filter(Boolean)

      if (ids.length === 0) return

      ids.forEach((id) => addRecentSearch(id))
      onSearch(ids)
      setShowSuggestions(false)
    },
    [inputValue, onSearch, addRecentSearch],
  )

  const handleSuggestionClick = React.useCallback(
    (itemId: string) => {
      setInputValue(itemId)
      addRecentSearch(itemId)
      onSearch([itemId])
      setShowSuggestions(false)
    },
    [onSearch, addRecentSearch],
  )

  const handleInputChange = React.useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setInputValue(e.target.value)
      setShowSuggestions(true)
    },
    [],
  )

  const filteredRecent = React.useMemo(() => {
    const query = inputValue.trim().toUpperCase()
    if (!query) return recentSearches.slice(0, 8)
    return recentSearches
      .filter((s) => s.toUpperCase().includes(query))
      .slice(0, 8)
  }, [inputValue, recentSearches])

  const filteredFavorites = React.useMemo(() => {
    const query = inputValue.trim().toUpperCase()
    if (!query) return favorites.slice(0, 5)
    return favorites
      .filter((s) => s.toUpperCase().includes(query))
      .slice(0, 5)
  }, [inputValue, favorites])

  const hasSuggestions = filteredRecent.length > 0 || filteredFavorites.length > 0

  return (
    <div ref={containerRef} className={cn('relative', className)}>
      <form onSubmit={handleSubmit} className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            ref={inputRef}
            value={inputValue}
            onChange={handleInputChange}
            onFocus={() => setShowSuggestions(true)}
            placeholder="Enter item IDs (e.g., T4_BAG, T5_BAG, T6_2H_ARCANESTAFF)"
            className="pl-9 pr-9"
          />
          {inputValue && (
            <button
              type="button"
              onClick={() => {
                setInputValue('')
                inputRef.current?.focus()
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="size-4" />
            </button>
          )}
        </div>
        <Button type="submit" disabled={!inputValue.trim()}>
          <Search className="mr-2 size-4" />
          Search
        </Button>
      </form>

      {/* Suggestions dropdown */}
      {showSuggestions && hasSuggestions && (
        <div className="absolute top-full left-0 z-50 mt-1 w-full rounded-lg border border-border bg-popover p-2 shadow-lg">
          {filteredFavorites.length > 0 && (
            <div className="mb-2">
              <p className="mb-1 px-2 text-xs font-medium text-muted-foreground">
                Favorites
              </p>
              <div className="flex flex-wrap gap-1">
                {filteredFavorites.map((id) => (
                  <Badge
                    key={id}
                    variant="secondary"
                    className="cursor-pointer hover:bg-accent"
                    onClick={() => handleSuggestionClick(id)}
                  >
                    <Star className="mr-1 size-3 fill-amber-400 text-amber-400" />
                    {id}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {filteredRecent.length > 0 && (
            <div>
              <p className="mb-1 px-2 text-xs font-medium text-muted-foreground">
                Recent Searches
              </p>
              <div className="flex flex-wrap gap-1">
                {filteredRecent.map((id) => (
                  <Badge
                    key={id}
                    variant="outline"
                    className="cursor-pointer hover:bg-accent"
                    onClick={() => handleSuggestionClick(id)}
                  >
                    <Clock className="mr-1 size-3" />
                    {id}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
