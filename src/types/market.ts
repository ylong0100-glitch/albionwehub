// =============================================================================
// Market & Trading type definitions
// =============================================================================

import type { ItemTier, EnchantmentLevel, QualityLevel, MarketLocation } from './index'

// ---------------------------------------------------------------------------
// Market price snapshot
// ---------------------------------------------------------------------------
export interface MarketPrice {
  itemId: string
  city: MarketLocation
  quality: QualityLevel
  sellPriceMin: number
  sellPriceMinDate: string
  sellPriceMax: number
  sellPriceMaxDate: string
  buyPriceMin: number
  buyPriceMinDate: string
  buyPriceMax: number
  buyPriceMaxDate: string
}

// ---------------------------------------------------------------------------
// Price comparison across cities
// ---------------------------------------------------------------------------
export interface CityPriceComparison {
  itemId: string
  quality: QualityLevel
  prices: Record<string, MarketPrice>
  bestSellCity: string
  bestBuyCity: string
  /** Max spread across all cities */
  maxSpread: number
  maxSpreadPercent: number
}

// ---------------------------------------------------------------------------
// Flip / arbitrage opportunity
// ---------------------------------------------------------------------------
export interface FlipOpportunity {
  itemId: string
  quality: QualityLevel
  buyCity: string
  sellCity: string
  buyPrice: number
  sellPrice: number
  profit: number
  profitPercent: number
  /** Volume estimate based on recent history */
  estimatedVolume: number
  /** How recently was this data updated */
  dataAge: number
  tier: ItemTier
  enchantment: EnchantmentLevel
}

// ---------------------------------------------------------------------------
// Price history for charts
// ---------------------------------------------------------------------------
export interface PriceHistoryPoint {
  timestamp: string
  avgPrice: number
  itemCount: number
}

export interface PriceHistorySeries {
  itemId: string
  city: string
  quality: QualityLevel
  timeScale: 1 | 6 | 24
  data: PriceHistoryPoint[]
}

// ---------------------------------------------------------------------------
// Gold market
// ---------------------------------------------------------------------------
export interface GoldPricePoint {
  price: number
  timestamp: string
}

export interface GoldConversion {
  silverAmount: number
  goldAmount: number
  rate: number
  timestamp: string
}

// ---------------------------------------------------------------------------
// Trade journal
// ---------------------------------------------------------------------------
export interface TradeRecord {
  id: string
  type: 'buy' | 'sell'
  itemId: string
  city: string
  quality: QualityLevel
  quantity: number
  pricePerUnit: number
  totalSilver: number
  notes?: string
  tradedAt: string
  tags?: string[]
}

// ---------------------------------------------------------------------------
// Portfolio
// ---------------------------------------------------------------------------
export interface PortfolioItem {
  id: string
  itemId: string
  city: string
  quantity: number
  avgCost: number
  currentPrice: number
  unrealizedPnL: number
  unrealizedPnLPercent: number
}

export interface PortfolioSummary {
  totalValue: number
  totalCost: number
  totalPnL: number
  totalPnLPercent: number
  positions: PortfolioItem[]
}

// ---------------------------------------------------------------------------
// Transport calculator
// ---------------------------------------------------------------------------
export interface TransportRoute {
  from: string
  to: string
  itemId: string
  quantity: number
  buyPrice: number
  sellPrice: number
  grossProfit: number
  /** Estimated tax / premium cost */
  fees: number
  netProfit: number
  netProfitPercent: number
  /** Risk score 0-100 based on distance, zones, etc. */
  riskScore: number
}

// ---------------------------------------------------------------------------
// Market tax
// ---------------------------------------------------------------------------
export interface MarketTaxConfig {
  /** Setup fee percentage */
  setupFee: number
  /** Sales tax percentage */
  salesTax: number
  /** Premium discount factor (e.g. 0.5 = half tax with premium) */
  premiumDiscount: number
}
