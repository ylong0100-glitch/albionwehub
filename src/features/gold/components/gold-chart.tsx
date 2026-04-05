'use client'

import { useMemo } from 'react'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { ChartSkeleton } from '@/components/shared/loading-states'
import { EmptyState } from '@/components/shared/empty-state'
import type { GoldPrice } from '@/lib/api/albion-data'
import type { Region } from '@/types'
import type { GoldTimeRange } from '@/lib/stores/gold-store'
import { formatGoldPrice } from '../utils/gold-stats'

// ---------------------------------------------------------------------------
// Region colors
// ---------------------------------------------------------------------------
const REGION_COLORS: Record<Region, { stroke: string; fill: string }> = {
  west: { stroke: '#f59e0b', fill: 'url(#goldGradientWest)' },
  east: { stroke: '#3b82f6', fill: 'url(#goldGradientEast)' },
  europe: { stroke: '#10b981', fill: 'url(#goldGradientEurope)' },
}

const REGION_LABELS: Record<Region, string> = {
  west: 'West',
  east: 'East',
  europe: 'Europe',
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
interface GoldChartProps {
  /** Map of region -> price data */
  regionData: Partial<Record<Region, GoldPrice[]>>
  isLoading: boolean
  timeRange: GoldTimeRange
}

interface ChartDataPoint {
  timestamp: number
  dateLabel: string
  [key: string]: number | string | undefined
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatTimeAxis(timestamp: number, timeRange: GoldTimeRange): string {
  const date = new Date(timestamp)
  if (timeRange === '1d') {
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
  }
  if (timeRange === '7d') {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit' })
  }
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function formatTooltipTime(timestamp: number): string {
  return new Date(timestamp).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

// ---------------------------------------------------------------------------
// Custom tooltip
// ---------------------------------------------------------------------------
interface TooltipPayloadItem {
  dataKey: string
  value: number
  color: string
}

interface CustomTooltipProps {
  active?: boolean
  payload?: TooltipPayloadItem[]
  label?: number
}

function GoldTooltip({ active, payload, label }: CustomTooltipProps) {
  if (!active || !payload || !label) return null

  return (
    <div className="rounded-lg border border-border bg-popover px-3 py-2 shadow-md">
      <p className="mb-1 text-xs text-muted-foreground">{formatTooltipTime(label)}</p>
      {payload.map((entry) => (
        <div key={entry.dataKey} className="flex items-center gap-2 text-sm">
          <span
            className="inline-block size-2 rounded-full"
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-muted-foreground">
            {REGION_LABELS[entry.dataKey as Region] ?? entry.dataKey}:
          </span>
          <span className="font-mono font-semibold">{formatGoldPrice(entry.value)}</span>
        </div>
      ))}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export function GoldChart({ regionData, isLoading, timeRange }: GoldChartProps) {
  const regions = Object.keys(regionData) as Region[]

  // Merge all region data into unified chart data points
  const chartData = useMemo(() => {
    if (regions.length === 0) return []

    // Collect all timestamps and build a map
    const timestampMap = new Map<number, ChartDataPoint>()

    for (const region of regions) {
      const prices = regionData[region]
      if (!prices) continue

      // Data comes reverse chronological, reverse for chart (oldest first)
      const sorted = [...prices].reverse()

      for (const point of sorted) {
        const ts = new Date(point.timestamp).getTime()
        if (!timestampMap.has(ts)) {
          timestampMap.set(ts, {
            timestamp: ts,
            dateLabel: formatTimeAxis(ts, timeRange),
          })
        }
        const entry = timestampMap.get(ts)!
        entry[region] = point.price
      }
    }

    return Array.from(timestampMap.values()).sort((a, b) => a.timestamp - b.timestamp)
  }, [regionData, regions, timeRange])

  if (isLoading) {
    return <ChartSkeleton />
  }

  if (chartData.length === 0) {
    return (
      <Card>
        <CardContent className="py-8">
          <EmptyState
            title="No gold price data"
            description="Unable to load gold price data. Please try a different region or time range."
          />
        </CardContent>
      </Card>
    )
  }

  // Compute Y-axis domain with some padding
  const allValues = chartData.flatMap((d) =>
    regions.map((r) => d[r] as number).filter((v) => v !== undefined)
  )
  const minVal = Math.min(...allValues)
  const maxVal = Math.max(...allValues)
  const padding = Math.max(Math.round((maxVal - minVal) * 0.05), 10)

  return (
    <Card>
      <CardHeader className="pb-2">
        <h3 className="text-sm font-medium text-muted-foreground">Price Chart</h3>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={400}>
          <AreaChart data={chartData} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="goldGradientWest" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="goldGradientEast" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="goldGradientEurope" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
              </linearGradient>
            </defs>

            <CartesianGrid strokeDasharray="3 3" className="stroke-border/50" />

            <XAxis
              dataKey="timestamp"
              type="number"
              domain={['dataMin', 'dataMax']}
              tickFormatter={(ts: number) => formatTimeAxis(ts, timeRange)}
              className="text-xs"
              tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
              tickLine={false}
              axisLine={false}
            />

            <YAxis
              domain={[minVal - padding, maxVal + padding]}
              tickFormatter={(v: number) => formatGoldPrice(v)}
              className="text-xs"
              tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
              tickLine={false}
              axisLine={false}
              width={70}
            />

            <Tooltip content={<GoldTooltip />} />

            {regions.length > 1 && (
              <Legend
                formatter={(value: string) => REGION_LABELS[value as Region] ?? value}
                iconType="circle"
                wrapperStyle={{ fontSize: 12 }}
              />
            )}

            {regions.map((region) => {
              const colors = REGION_COLORS[region]
              return (
                <Area
                  key={region}
                  type="monotone"
                  dataKey={region}
                  stroke={colors.stroke}
                  fill={colors.fill}
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4, strokeWidth: 0 }}
                  connectNulls
                />
              )
            })}
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
