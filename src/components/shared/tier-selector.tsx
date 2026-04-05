'use client'

import {
  Select,
  SelectContent,
  SelectItem,
  SelectGroup,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

const tiers = [1, 2, 3, 4, 5, 6, 7, 8] as const
const enchantments = [0, 1, 2, 3, 4] as const

const tierColors: Record<number, string> = {
  1: 'text-zinc-400',
  2: 'text-zinc-300',
  3: 'text-green-500',
  4: 'text-blue-500',
  5: 'text-purple-500',
  6: 'text-amber-400',
  7: 'text-orange-400',
  8: 'text-red-400',
}

interface TierSelectorProps {
  tier: number
  enchantment: number
  onTierChange: (tier: number) => void
  onEnchantmentChange: (enchantment: number) => void
  className?: string
}

export function TierSelector({
  tier,
  enchantment,
  onTierChange,
  onEnchantmentChange,
  className,
}: TierSelectorProps) {
  return (
    <div className={`flex items-center gap-2 ${className ?? ''}`}>
      <Select
        value={String(tier)}
        onValueChange={(v) => onTierChange(Number(v))}
      >
        <SelectTrigger size="sm">
          <SelectValue>
            <span className={tierColors[tier]}>T{tier}</span>
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectLabel>Tier</SelectLabel>
            {tiers.map((t) => (
              <SelectItem key={t} value={String(t)}>
                <span className={tierColors[t]}>T{t}</span>
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>

      <Select
        value={String(enchantment)}
        onValueChange={(v) => onEnchantmentChange(Number(v))}
      >
        <SelectTrigger size="sm">
          <SelectValue>.{enchantment}</SelectValue>
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectLabel>Enchantment</SelectLabel>
            {enchantments.map((e) => (
              <SelectItem key={e} value={String(e)}>
                .{e}
                {e === 0 && (
                  <span className="ml-1 text-muted-foreground">None</span>
                )}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  )
}
