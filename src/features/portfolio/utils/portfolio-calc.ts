// =============================================================================
// Portfolio Calculation Utilities
// Pure functions for computing portfolio metrics
// =============================================================================

import type { Position, TradeLog } from '@/lib/stores/portfolio-store'
import { MARKET_SETUP_FEE, MARKET_SALES_TAX } from '@/lib/utils/constants'

// ---------------------------------------------------------------------------
// Position-level calculations
// ---------------------------------------------------------------------------

export interface PositionValue {
  marketValue: number
  costBasis: number
  unrealizedPnL: number
  unrealizedPnLPercent: number
}

/**
 * Calculate the value metrics for a single position given a current market price.
 */
export function calcPositionValue(
  position: Position,
  currentPrice: number
): PositionValue {
  const costBasis = position.quantity * position.avgBuyPrice
  const marketValue = position.quantity * currentPrice
  const unrealizedPnL = marketValue - costBasis

  return {
    marketValue,
    costBasis,
    unrealizedPnL,
    unrealizedPnLPercent: costBasis > 0 ? (unrealizedPnL / costBasis) * 100 : 0,
  }
}

// ---------------------------------------------------------------------------
// Portfolio-level summary
// ---------------------------------------------------------------------------

export interface PortfolioSummaryResult {
  totalCost: number
  totalValue: number
  totalPnL: number
  totalPnLPercent: number
  positionCount: number
}

/**
 * Calculate aggregate portfolio metrics.
 * `currentPrices` is a map of positionId -> currentPrice.
 * Positions without a price entry use their avgBuyPrice (P&L = 0).
 */
export function calcPortfolioSummary(
  positions: Position[],
  currentPrices: Record<string, number>
): PortfolioSummaryResult {
  let totalCost = 0
  let totalValue = 0

  for (const pos of positions) {
    const price = currentPrices[pos.id] ?? pos.avgBuyPrice
    const { costBasis, marketValue } = calcPositionValue(pos, price)
    totalCost += costBasis
    totalValue += marketValue
  }

  const totalPnL = totalValue - totalCost

  return {
    totalCost,
    totalValue,
    totalPnL,
    totalPnLPercent: totalCost > 0 ? (totalPnL / totalCost) * 100 : 0,
    positionCount: positions.length,
  }
}

// ---------------------------------------------------------------------------
// Realized P&L from trade logs
// ---------------------------------------------------------------------------

/**
 * Sum up realized profit from all sell trades.
 * Realized P&L per sell = (sellPrice * quantity) - fees
 * Note: the cost side is already factored into position avgBuyPrice,
 * so we track net proceeds from sells minus estimated cost.
 */
export function calcRealizedPnL(tradeLog: TradeLog[]): number {
  let realized = 0

  for (const trade of tradeLog) {
    if (trade.action === 'sell') {
      // Net proceeds = revenue - fees
      const revenue = trade.price * trade.quantity
      realized += revenue - trade.fees
    }
  }

  return realized
}

// ---------------------------------------------------------------------------
// Fee calculation helpers
// ---------------------------------------------------------------------------

/**
 * Calculate market fees for a sale.
 * setupFee = 2.5% of total, salesTax = 4% of total
 */
export function calcSellFees(sellPrice: number, quantity: number): number {
  const total = sellPrice * quantity
  return total * (MARKET_SETUP_FEE + MARKET_SALES_TAX)
}

/**
 * Calculate sell profit preview.
 */
export function calcSellProfit(
  avgBuyPrice: number,
  sellPrice: number,
  quantity: number
): { revenue: number; fees: number; cost: number; profit: number } {
  const revenue = sellPrice * quantity
  const fees = calcSellFees(sellPrice, quantity)
  const cost = avgBuyPrice * quantity
  const profit = revenue - fees - cost

  return { revenue, fees, cost, profit }
}
