'use client'

import * as React from 'react'
import { Check, ChevronsUpDown } from 'lucide-react'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'

export interface City {
  value: string
  label: string
  color: string
  bgClass: string
}

export const cities: City[] = [
  { value: 'caerleon', label: 'Caerleon', color: 'text-red-500', bgClass: 'bg-red-500' },
  { value: 'bridgewatch', label: 'Bridgewatch', color: 'text-orange-500', bgClass: 'bg-orange-500' },
  { value: 'fort-sterling', label: 'Fort Sterling', color: 'text-slate-400', bgClass: 'bg-slate-400' },
  { value: 'lymhurst', label: 'Lymhurst', color: 'text-green-500', bgClass: 'bg-green-500' },
  { value: 'martlock', label: 'Martlock', color: 'text-amber-700', bgClass: 'bg-amber-700' },
  { value: 'thetford', label: 'Thetford', color: 'text-purple-500', bgClass: 'bg-purple-500' },
  { value: 'brecilien', label: 'Brecilien', color: 'text-teal-500', bgClass: 'bg-teal-500' },
  { value: 'black-market', label: 'Black Market', color: 'text-zinc-600', bgClass: 'bg-zinc-600' },
]

interface CitySelectorProps {
  selected: string[]
  onChange: (selected: string[]) => void
  className?: string
}

export function CitySelector({ selected, onChange, className }: CitySelectorProps) {
  const [open, setOpen] = React.useState(false)

  const toggleCity = (value: string) => {
    if (selected.includes(value)) {
      onChange(selected.filter((v) => v !== value))
    } else {
      onChange([...selected, value])
    }
  }

  const selectedLabels = cities
    .filter((c) => selected.includes(c.value))
    .map((c) => c.label)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={
          <Button
            variant="outline"
            className={cn('w-full justify-between', className)}
          />
        }
      >
        <span className="truncate text-sm">
          {selectedLabels.length > 0
            ? selectedLabels.length <= 2
              ? selectedLabels.join(', ')
              : `${selectedLabels.length} cities selected`
            : 'Select cities...'}
        </span>
        <ChevronsUpDown className="ml-2 size-4 shrink-0 opacity-50" />
      </PopoverTrigger>
      <PopoverContent className="w-56 p-0">
        <Command>
          <CommandInput placeholder="Search cities..." />
          <CommandList>
            <CommandEmpty>No city found.</CommandEmpty>
            <CommandGroup>
              {cities.map((city) => {
                const isSelected = selected.includes(city.value)
                return (
                  <CommandItem
                    key={city.value}
                    value={city.value}
                    onSelect={() => toggleCity(city.value)}
                    data-checked={isSelected}
                  >
                    <div
                      className={cn(
                        'flex size-4 items-center justify-center rounded-sm border border-primary',
                        isSelected
                          ? 'bg-primary text-primary-foreground'
                          : 'opacity-50'
                      )}
                    >
                      {isSelected && <Check className="size-3" />}
                    </div>
                    <span
                      className={cn(
                        'size-2.5 rounded-full shrink-0',
                        city.bgClass
                      )}
                    />
                    <span>{city.label}</span>
                  </CommandItem>
                )
              })}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
