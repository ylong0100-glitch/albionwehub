// =============================================================================
// Gold Price Statistics Calculator
// Computes derived metrics from gold price data arrays
// =============================================================================

import type { GoldPrice } from '@/lib/api/albion-data'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
export interface GoldStats {
  currentPrice: number
  change24h: number
  change24hPercent: number
  high24h: number
  low24h: number
  high7d: number
  low7d: number
  avgPrice: number
  volatility: number
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Extract prices from data within the last N hours */
function pricesInLastHours(data: GoldPrice[], hours: number): number[] {
  if (data.length === 0) return []

  const latestTime = new Date(data[0].timestamp).getTime()
  const cutoff = latestTime - hours * 60 * 60 * 1000

  return data
    .filter((d) => new Date(d.timestamp).getTime() >= cutoff)
    .map((d) => d.price)
}

function mean(values: number[]): number {
  if (values.length === 0) return 0
  return values.reduce((sum, v) => sum + v, 0) / values.length
}

function standardDeviation(values: number[]): number {
  if (values.length < 2) return 0
  const avg = mean(values)
  const squaredDiffs = values.map((v) => (v - avg) ** 2)
  return Math.sqrt(squaredDiffs.reduce((sum, v) => sum + v, 0) / (values.length - 1))
}

// ---------------------------------------------------------------------------
// Main calculator
// ---------------------------------------------------------------------------

/**
 * Calculate gold price statistics.
 * Expects data sorted in reverse chronological order (newest first).
 */
export function calculateGoldStats(data: GoldPrice[]): GoldStats {
  const empty: GoldStats = {
    currentPrice: 0,
    change24h: 0,
    change24hPercent: 0,
    high24h: 0,
    low24h: 0,
    high7d: 0,
    low7d: 0,
    avgPrice: 0,
    volatility: 0,
  }

  if (data.length === 0) return empty

  const currentPrice = data[0].price
  const allPrices = data.map((d) => d.price)

  // 24h stats
  const prices24h = pricesInLastHours(data, 24)
  const high24h = prices24h.length > 0 ? Math.max(...prices24h) : currentPrice
  const low24h = prices24h.length > 0 ? Math.min(...prices24h) : currentPrice

  // 24h change: compare current price to oldest price in last 24h window
  const oldestIn24h = prices24h.length > 0 ? prices24h[prices24h.length - 1] : currentPrice
  const change24h = currentPrice - oldestIn24h
  const change24hPercent = oldestIn24h !== 0 ? (change24h / oldestIn24h) * 100 : 0

  // 7d stats
  const prices7d = pricesInLastHours(data, 168)
  const high7d = prices7d.length > 0 ? Math.max(...prices7d) : high24h
  const low7d = prices7d.length > 0 ? Math.min(...prices7d) : low24h

  // Average over entire dataset
  const avgPrice = mean(allPrices)

  // Volatility (standard deviation of entire dataset)
  const volatility = standardDeviation(allPrices)

  return {
    currentPrice,
    change24h,
    change24hPercent,
    high24h,
    low24h,
    high7d,
    low7d,
    avgPrice,
    volatility,
  }
}

// ---------------------------------------------------------------------------
// Formatting helpers
// ---------------------------------------------------------------------------

export function formatGoldPrice(price: number): string {
  return price.toLocaleString('en-US')
}

export function formatPercentChange(percent: number): string {
  const sign = percent >= 0 ? '+' : ''
  return `${sign}${percent.toFixed(2)}%`
}
