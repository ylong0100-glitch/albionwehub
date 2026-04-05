'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Input } from '@/components/ui/input'
import type { BreedingSettings } from '../utils/breeding-calc'

interface BreedingSettingsProps {
  settings: BreedingSettings
  onChange: (settings: BreedingSettings) => void
}

export function BreedingSettingsPanel({
  settings,
  onChange,
}: BreedingSettingsProps) {
  return (
    <Card>
      <CardContent>
        <div className="flex flex-wrap items-center gap-6">
          {/* Premium toggle */}
          <div className="flex items-center gap-2">
            <Switch
              id="breeding-premium"
              checked={settings.isPremium}
              onCheckedChange={(checked) =>
                onChange({ ...settings, isPremium: checked })
              }
            />
            <Label htmlFor="breeding-premium" className="cursor-pointer">
              Premium
            </Label>
          </div>

          {/* Focus toggle */}
          <div className="flex items-center gap-2">
            <Switch
              id="breeding-focus"
              checked={settings.useFocus}
              onCheckedChange={(checked) =>
                onChange({ ...settings, useFocus: checked })
              }
            />
            <Label htmlFor="breeding-focus" className="cursor-pointer">
              Use Focus
            </Label>
          </div>

          {/* Pasture count */}
          <div className="flex items-center gap-2">
            <Label htmlFor="pastures">Pastures</Label>
            <Input
              id="pastures"
              type="number"
              min={1}
              max={100}
              value={settings.pastureCount}
              onChange={(e) =>
                onChange({
                  ...settings,
                  pastureCount: Math.max(1, parseInt(e.target.value) || 1),
                })
              }
              className="w-20"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
