'use client'

import { cn } from '@/lib/utils'
import { Card, CardContent } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectGroup,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ENCHANTMENT_NAMES } from '@/lib/utils/constants'
import type { EnchantmentLevel } from '@/types'

const ENCHANT_COLORS: Record<number, string> = {
  0: 'bg-zinc-500',
  1: 'bg-green-500',
  2: 'bg-blue-500',
  3: 'bg-purple-500',
  4: 'bg-amber-500',
}

interface EnchantLevelSelectorProps {
  fromLevel: EnchantmentLevel
  toLevel: EnchantmentLevel
  onFromChange: (level: EnchantmentLevel) => void
  onToChange: (level: EnchantmentLevel) => void
  className?: string
}

export function EnchantLevelSelector({
  fromLevel,
  toLevel,
  onFromChange,
  onToChange,
  className,
}: EnchantLevelSelectorProps) {
  const fromOptions: EnchantmentLevel[] = [0, 1, 2, 3]
  const toOptions: EnchantmentLevel[] = [1, 2, 3, 4]

  const handleFromChange = (value: string | null) => {
    if (!value) return
    const newFrom = Number(value) as EnchantmentLevel
    onFromChange(newFrom)
    // Ensure toLevel is always > fromLevel
    if (newFrom >= toLevel) {
      onToChange((newFrom + 1) as EnchantmentLevel)
    }
  }

  const handleToChange = (value: string | null) => {
    if (!value) return
    const newTo = Number(value) as EnchantmentLevel
    onToChange(newTo)
    // Ensure fromLevel is always < toLevel
    if (newTo <= fromLevel) {
      onFromChange((newTo - 1) as EnchantmentLevel)
    }
  }

  return (
    <Card className={cn('', className)}>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap items-end gap-4">
          {/* From level */}
          <div className="space-y-1.5">
            <Label className="text-xs">From Enchantment</Label>
            <Select
              value={String(fromLevel)}
              onValueChange={handleFromChange}
            >
              <SelectTrigger className="w-[160px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>From Level</SelectLabel>
                  {fromOptions.map((level) => (
                    <SelectItem key={level} value={String(level)}>
                      .{level} - {ENCHANTMENT_NAMES[level]}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>

          {/* Arrow */}
          <div className="flex h-9 items-center px-2 text-muted-foreground">
            <svg
              className="size-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M13 7l5 5m0 0l-5 5m5-5H6"
              />
            </svg>
          </div>

          {/* To level */}
          <div className="space-y-1.5">
            <Label className="text-xs">To Enchantment</Label>
            <Select value={String(toLevel)} onValueChange={handleToChange}>
              <SelectTrigger className="w-[160px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>To Level</SelectLabel>
                  {toOptions.map((level) => (
                    <SelectItem
                      key={level}
                      value={String(level)}
                      disabled={level <= fromLevel}
                    >
                      .{level} - {ENCHANTMENT_NAMES[level]}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Visual progression bar */}
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">
            Upgrade Path
          </Label>
          <div className="flex items-center gap-1">
            {[0, 1, 2, 3, 4].map((level) => {
              const isInRange = level >= fromLevel && level <= toLevel
              const isFrom = level === fromLevel
              const isTo = level === toLevel
              const isActive = level > fromLevel && level <= toLevel

              return (
                <div key={level} className="flex items-center">
                  {/* Level dot */}
                  <div
                    className={cn(
                      'flex size-8 items-center justify-center rounded-full text-xs font-bold transition-all',
                      isFrom || isTo
                        ? 'ring-2 ring-primary ring-offset-2 ring-offset-background'
                        : '',
                      isInRange
                        ? `${ENCHANT_COLORS[level]} text-white`
                        : 'bg-muted text-muted-foreground',
                    )}
                  >
                    .{level}
                  </div>

                  {/* Connecting bar */}
                  {level < 4 && (
                    <div
                      className={cn(
                        'h-1 w-6 rounded-full transition-all',
                        level >= fromLevel && level < toLevel
                          ? 'bg-primary'
                          : 'bg-muted',
                      )}
                    />
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
