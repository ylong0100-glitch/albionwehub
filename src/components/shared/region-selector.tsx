'use client'

import { useAppStore, type Region } from '@/lib/stores/app-store'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

const regions: { value: Region; label: string; flag: string }[] = [
  { value: 'west', label: 'West', flag: '\u{1F1FA}\u{1F1F8}' },
  { value: 'east', label: 'East', flag: '\u{1F1F8}\u{1F1EC}' },
  { value: 'europe', label: 'Europe', flag: '\u{1F1EA}\u{1F1FA}' },
]

export function RegionSelector() {
  const region = useAppStore((s) => s.region)
  const setRegion = useAppStore((s) => s.setRegion)

  return (
    <Select value={region} onValueChange={(v) => setRegion(v as Region)}>
      <SelectTrigger size="sm">
        <SelectValue>
          {regions.find((r) => r.value === region)?.flag}{' '}
          {regions.find((r) => r.value === region)?.label}
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {regions.map((r) => (
          <SelectItem key={r.value} value={r.value}>
            <span className="mr-1">{r.flag}</span>
            {r.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
