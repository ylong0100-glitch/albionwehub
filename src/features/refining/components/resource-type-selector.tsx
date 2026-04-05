'use client'

import { cn } from '@/lib/utils'
import { ItemIcon } from '@/components/shared/item-icon'
import {
  type RefiningResourceType,
  RESOURCE_TYPE_INFO,
} from '../utils/refining-calc'

const RESOURCE_TYPES: RefiningResourceType[] = [
  'ORE',
  'WOOD',
  'HIDE',
  'FIBER',
  'ROCK',
]

interface ResourceTypeSelectorProps {
  selected: RefiningResourceType
  onChange: (type: RefiningResourceType) => void
  className?: string
}

export function ResourceTypeSelector({
  selected,
  onChange,
  className,
}: ResourceTypeSelectorProps) {
  return (
    <div className={cn('flex flex-wrap gap-2', className)}>
      {RESOURCE_TYPES.map((type) => {
        const info = RESOURCE_TYPE_INFO[type]
        const isSelected = type === selected

        return (
          <button
            key={type}
            onClick={() => onChange(type)}
            className={cn(
              'flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition-colors',
              isSelected
                ? 'border-primary bg-primary/10 text-primary'
                : 'border-border bg-card text-muted-foreground hover:bg-accent hover:text-accent-foreground',
            )}
          >
            <ItemIcon itemId={info.icon} size={28} className="rounded-sm border-0" />
            <span>{info.label}</span>
          </button>
        )
      })}
    </div>
  )
}
