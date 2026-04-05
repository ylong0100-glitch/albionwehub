// =============================================================================
// Albion Online Data Project (AODP) API wrapper
// Provides typed access to market prices, history, and gold prices
// =============================================================================

import { albionFetch, type Region } from './client'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
export interface PriceEntry {
  item_id: string
  city: string
  quality: number
  sell_price_min: number
  sell_price_min_date: string
  sell_price_max: number
  sell_price_max_date: string
  buy_price_min: number
  buy_price_min_date: string
  buy_price_max: number
  buy_price_max_date: string
}

export interface HistoryDataPoint {
  item_count: number
  avg_price: number
  timestamp: string
}

export interface HistoryEntry {
  location: string
  item_id: string
  quality: number
  data: HistoryDataPoint[]
}

export interface GoldPrice {
  price: number
  timestamp: string
}

// ---------------------------------------------------------------------------
// Price API
// ---------------------------------------------------------------------------
export async function getPrices(
  itemIds: string[],
  options: {
    locations?: string[]
    qualities?: number[]
    region?: Region
  } = {},
): Promise<PriceEntry[]> {
  const { locations, qualities, region } = options
  const ids = itemIds.join(',')

  const params: Record<string, string> = {}
  if (locations?.length) {
    params.locations = locations.join(',')
  }
  if (qualities?.length) {
    params.qualities = qualities.join(',')
  }

  return albionFetch<PriceEntry[]>(`/prices/${ids}`, {
    region,
    params,
  })
}

// ---------------------------------------------------------------------------
// History API
// ---------------------------------------------------------------------------
export async function getHistory(
  itemIds: string[],
  options: {
    startDate?: string
    endDate?: string
    timeScale?: 1 | 6 | 24
    locations?: string[]
    region?: Region
  } = {},
): Promise<HistoryEntry[]> {
  const { startDate, endDate, timeScale = 6, locations, region } = options
  const ids = itemIds.join(',')

  const params: Record<string, string> = {
    'time-scale': String(timeScale),
  }
  if (startDate) params['date'] = startDate
  if (endDate) params['end_date'] = endDate
  if (locations?.length) params.locations = locations.join(',')

  return albionFetch<HistoryEntry[]>(`/history/${ids}`, {
    region,
    params,
  })
}

// ---------------------------------------------------------------------------
// Gold Price API
// ---------------------------------------------------------------------------
export async function getGoldPrices(
  options: {
    count?: number
    startDate?: string
    endDate?: string
    region?: Region
  } = {},
): Promise<GoldPrice[]> {
  const { count, startDate, endDate, region } = options

  const params: Record<string, string> = {}
  if (count !== undefined) params.count = String(count)
  if (startDate) params.date = startDate
  if (endDate) params.end_date = endDate

  return albionFetch<GoldPrice[]>('/gold', {
    region,
    params,
  })
}
