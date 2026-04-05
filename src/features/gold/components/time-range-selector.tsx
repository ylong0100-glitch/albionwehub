'use client'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { useGoldStore, type GoldTimeRange } from '@/lib/stores/gold-store'

const TIME_RANGES: { id: GoldTimeRange; label: string }[] = [
  { id: '1d', label: '1D' },
  { id: '7d', label: '7D' },
  { id: '30d', label: '30D' },
  { id: '90d', label: '90D' },
]

export function TimeRangeSelector() {
  const timeRange = useGoldStore((s) => s.timeRange)
  const setTimeRange = useGoldStore((s) => s.setTimeRange)

  return (
    <div className="flex items-center gap-1">
      {TIME_RANGES.map(({ id, label }) => (
        <Button
          key={id}
          variant={timeRange === id ? 'default' : 'ghost'}
          size="sm"
          className={cn(
            'min-w-[3rem] text-xs font-semibold',
            timeRange === id &&
              'bg-amber-500 text-white hover:bg-amber-600 dark:bg-amber-600 dark:hover:bg-amber-700'
          )}
          onClick={() => setTimeRange(id)}
        >
          {label}
        </Button>
      ))}
    </div>
  )
}
