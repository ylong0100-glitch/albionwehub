'use client'

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { MOUNT_CAPACITIES, MOUNT_GROUPS } from '../utils/trade-calc'

interface MountSelectorProps {
  value: string
  onValueChange: (mount: string, capacity: number) => void
}

export function MountSelector({ value, onValueChange }: MountSelectorProps) {
  const handleChange = (newValue: string | null) => {
    if (!newValue || newValue === '__none__') {
      onValueChange('', 0)
    } else {
      const capacity = MOUNT_CAPACITIES[newValue] ?? 0
      onValueChange(newValue, capacity)
    }
  }

  return (
    <Select value={value || '__none__'} onValueChange={handleChange}>
      <SelectTrigger className="w-full">
        <SelectValue>
          {value
            ? `${value} (${MOUNT_CAPACITIES[value]?.toLocaleString()} kg)`
            : 'No limit'}
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="__none__">No limit</SelectItem>
        {MOUNT_GROUPS.map((group) => (
          <SelectGroup key={group.label}>
            <SelectLabel>{group.label}</SelectLabel>
            {group.mounts.map((mount) => (
              <SelectItem key={mount} value={mount}>
                {mount} — {MOUNT_CAPACITIES[mount]?.toLocaleString()} kg
              </SelectItem>
            ))}
          </SelectGroup>
        ))}
      </SelectContent>
    </Select>
  )
}
