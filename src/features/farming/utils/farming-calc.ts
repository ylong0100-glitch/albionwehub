// =============================================================================
// Farming profit calculation utilities
// =============================================================================

import type { CropData } from './farming-data'

export interface FarmingSettings {
  useFocus: boolean
  isPremium: boolean
  plotCount: number
}

export interface FarmingResult {
  crop: CropData
  seedCost: number
  sellPrice: number
  yieldAmount: number
  revenue: number
  profitPerPlot: number
  dailyProfit: number
  profitPerFocus: number
  growTimeHours: number
}

/**
 * Calculate farming profit for a single crop.
 */
export function calculateFarmingProfit(
  crop: CropData,
  seedPrice: number,
  cropPrice: number,
  settings: FarmingSettings,
): FarmingResult {
  const yieldAmount = settings.useFocus ? crop.focusYield : crop.baseYield
  const growTimeHours = settings.isPremium
    ? crop.growTimeHours / 2
    : crop.growTimeHours

  const revenue = yieldAmount * cropPrice
  const profitPerPlot = revenue - seedPrice

  // Daily profit: how many cycles fit in 24 hours
  const cyclesPerDay = 24 / growTimeHours
  const dailyProfit = profitPerPlot * cyclesPerDay * settings.plotCount

  // Profit per focus point (rough estimate: ~10,000 focus per day for premium)
  // Each plot with focus uses roughly 1,200 focus per crop cycle (varies by tier)
  const focusPerCycle = 1200
  const totalFocusUsed = settings.useFocus ? focusPerCycle : 0
  const profitPerFocus = totalFocusUsed > 0 ? profitPerPlot / focusPerCycle : 0

  return {
    crop,
    seedCost: seedPrice,
    sellPrice: cropPrice,
    yieldAmount,
    revenue,
    profitPerPlot,
    dailyProfit,
    profitPerFocus,
    growTimeHours,
  }
}

/**
 * Find the best crop by daily profit.
 */
export function findBestCrop(results: FarmingResult[]): FarmingResult | null {
  if (results.length === 0) return null
  return results.reduce((best, curr) =>
    curr.dailyProfit > best.dailyProfit ? curr : best,
  )
}

/**
 * Calculate total daily profit across all results.
 */
export function calculateTotalDailyProfit(results: FarmingResult[]): number {
  // Each result already includes plotCount, but we want the best single crop's daily
  // Actually each result is per-crop with plotCount applied, so just find max
  const best = findBestCrop(results)
  return best?.dailyProfit ?? 0
}

/**
 * Calculate total focus needed per day.
 */
export function calculateTotalFocusNeeded(
  results: FarmingResult[],
  settings: FarmingSettings,
): number {
  if (!settings.useFocus) return 0
  const best = findBestCrop(results)
  if (!best) return 0

  const cyclesPerDay = 24 / best.growTimeHours
  const focusPerCycle = 1200
  return Math.round(focusPerCycle * settings.plotCount * cyclesPerDay)
}
