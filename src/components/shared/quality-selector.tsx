'use client'

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'

interface QualityOption {
  value: string
  label: string
  colorClass: string
}

const qualities: QualityOption[] = [
  { value: '1', label: 'Normal', colorClass: 'text-zinc-400' },
  { value: '2', label: 'Good', colorClass: 'text-green-500' },
  { value: '3', label: 'Outstanding', colorClass: 'text-blue-500' },
  { value: '4', label: 'Excellent', colorClass: 'text-purple-500' },
  { value: '5', label: 'Masterpiece', colorClass: 'text-amber-400' },
]

interface QualitySelectorProps {
  value: number
  onChange: (quality: number) => void
  className?: string
}

export function QualitySelector({
  value,
  onChange,
  className,
}: QualitySelectorProps) {
  return (
    <Select
      value={String(value)}
      onValueChange={(v) => onChange(Number(v))}
    >
      <SelectTrigger size="sm" className={className}>
        <SelectValue>
          {(() => {
            const q = qualities.find((q) => q.value === String(value))
            return q ? (
              <span className={q.colorClass}>{q.label}</span>
            ) : null
          })()}
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {qualities.map((q) => (
          <SelectItem key={q.value} value={q.value}>
            <span className={cn('font-medium', q.colorClass)}>
              Q{q.value}
            </span>
            <span className="ml-1">{q.label}</span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
