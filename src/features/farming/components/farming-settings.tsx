'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Input } from '@/components/ui/input'
import type { FarmingSettings } from '../utils/farming-calc'

interface FarmingSettingsProps {
  settings: FarmingSettings
  onChange: (settings: FarmingSettings) => void
}

export function FarmingSettingsPanel({
  settings,
  onChange,
}: FarmingSettingsProps) {
  return (
    <Card>
      <CardContent>
        <div className="flex flex-wrap items-center gap-6">
          {/* Premium toggle */}
          <div className="flex items-center gap-2">
            <Switch
              id="premium"
              checked={settings.isPremium}
              onCheckedChange={(checked) =>
                onChange({ ...settings, isPremium: checked })
              }
            />
            <Label htmlFor="premium" className="cursor-pointer">
              Premium
            </Label>
          </div>

          {/* Focus toggle */}
          <div className="flex items-center gap-2">
            <Switch
              id="focus"
              checked={settings.useFocus}
              onCheckedChange={(checked) =>
                onChange({ ...settings, useFocus: checked })
              }
            />
            <Label htmlFor="focus" className="cursor-pointer">
              Use Focus
            </Label>
          </div>

          {/* Plot count */}
          <div className="flex items-center gap-2">
            <Label htmlFor="plots">Plots</Label>
            <Input
              id="plots"
              type="number"
              min={1}
              max={100}
              value={settings.plotCount}
              onChange={(e) =>
                onChange({
                  ...settings,
                  plotCount: Math.max(1, parseInt(e.target.value) || 1),
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
