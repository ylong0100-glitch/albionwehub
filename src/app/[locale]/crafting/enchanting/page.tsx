'use client'

import { useState, useMemo } from 'react'
import { Separator } from '@/components/ui/separator'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectGroup,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { TIERS } from '@/lib/utils/constants'
import type { ItemTier, EnchantmentLevel } from '@/types'
import { EnchantLevelSelector } from '@/features/enchanting/components/enchant-level-selector'
import { EnchantMaterialDisplay } from '@/features/enchanting/components/enchant-material-display'
import { EnchantCostSummary } from '@/features/enchanting/components/enchant-cost-summary'
import { useEnchantPrices } from '@/features/enchanting/hooks/use-enchant-prices'
import {
  calculateEnchantCost,
  calculateEnchantProfit,
  EQUIPMENT_TYPES,
  EQUIPMENT_TYPE_LABELS,
  getEnchantMaterialCount,
  type EquipmentType,
} from '@/features/enchanting/utils/enchanting-calc'

const TIER_OPTIONS = TIERS.filter((t) => t.level >= 4 && t.level <= 8)

export default function EnchantingCalculator() {
  const [tier, setTier] = useState<ItemTier>(4)
  const [equipmentType, setEquipmentType] = useState<EquipmentType>('1h_weapon')
  const [fromLevel, setFromLevel] = useState<EnchantmentLevel>(0)
  const [toLevel, setToLevel] = useState<EnchantmentLevel>(1)
  const [itemPriceBefore, setItemPriceBefore] = useState<number>(0)
  const [itemPriceAfter, setItemPriceAfter] = useState<number>(0)

  const { prices, isLoading, error, refetch } = useEnchantPrices(tier)

  const materialCount = useMemo(
    () => getEnchantMaterialCount(equipmentType),
    [equipmentType],
  )

  const costBreakdown = useMemo(
    () => calculateEnchantCost(tier, fromLevel, toLevel, prices, equipmentType),
    [tier, fromLevel, toLevel, prices, equipmentType],
  )

  const profitResult = useMemo(() => {
    if (itemPriceBefore <= 0 && itemPriceAfter <= 0) return null
    return calculateEnchantProfit(
      tier,
      fromLevel,
      toLevel,
      prices,
      itemPriceBefore,
      itemPriceAfter,
      equipmentType,
    )
  }, [tier, fromLevel, toLevel, prices, itemPriceBefore, itemPriceAfter, equipmentType])

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          Enchanting Calculator
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Calculate enchanting costs and profitability. See exactly how many
          Runes, Souls, and Relics you need.
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          Note: .4 enchantment cannot be achieved via enchanting — it can only
          be crafted with .4 raw materials.
        </p>
      </div>

      <Separator />

      {/* Configuration row */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Tier & Equipment type selector */}
        <Card>
          <CardHeader>
            <h3 className="text-base font-semibold">Item Configuration</h3>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              {/* Tier selector */}
              <div className="space-y-1.5">
                <Label className="text-xs">Item Tier</Label>
                <Select
                  value={String(tier)}
                  onValueChange={(v) => setTier(Number(v) as ItemTier)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Tier</SelectLabel>
                      {TIER_OPTIONS.map((t) => (
                        <SelectItem key={t.level} value={String(t.level)}>
                          <span style={{ color: t.color }}>
                            T{t.level} - {t.name}
                          </span>
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>

              {/* Equipment type selector */}
              <div className="space-y-1.5">
                <Label className="text-xs">Equipment Type</Label>
                <Select
                  value={equipmentType}
                  onValueChange={(v) => setEquipmentType(v as EquipmentType)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Type</SelectLabel>
                      {EQUIPMENT_TYPES.map((et) => (
                        <SelectItem key={et} value={et}>
                          {EQUIPMENT_TYPE_LABELS[et]}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Material count info */}
            <div className="rounded-md bg-muted/50 px-3 py-2 text-xs text-muted-foreground">
              <span className="font-medium text-foreground">{materialCount}</span>{' '}
              enchanting materials per step ({EQUIPMENT_TYPE_LABELS[equipmentType]})
            </div>

            {/* Item prices */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs">
                  Item Price Before (.{fromLevel})
                </Label>
                <Input
                  type="number"
                  min={0}
                  placeholder="e.g. 50000"
                  value={itemPriceBefore || ''}
                  onChange={(e) =>
                    setItemPriceBefore(
                      Math.max(0, parseInt(e.target.value) || 0),
                    )
                  }
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">
                  Item Price After (.{toLevel})
                </Label>
                <Input
                  type="number"
                  min={0}
                  placeholder="e.g. 120000"
                  value={itemPriceAfter || ''}
                  onChange={(e) =>
                    setItemPriceAfter(
                      Math.max(0, parseInt(e.target.value) || 0),
                    )
                  }
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Enchantment level selector */}
        <EnchantLevelSelector
          fromLevel={fromLevel}
          toLevel={toLevel}
          onFromChange={setFromLevel}
          onToChange={setToLevel}
        />
      </div>

      {/* Error state */}
      {error && (
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4">
          <p className="text-sm text-destructive">{error}</p>
          <button
            onClick={refetch}
            className="mt-2 text-xs font-medium text-destructive underline"
          >
            Retry
          </button>
        </div>
      )}

      {/* Cost summary cards */}
      <EnchantCostSummary
        result={profitResult}
        isLoading={isLoading}
      />

      {/* Material display */}
      <EnchantMaterialDisplay
        costBreakdown={costBreakdown}
        isLoading={isLoading}
      />
    </div>
  )
}
