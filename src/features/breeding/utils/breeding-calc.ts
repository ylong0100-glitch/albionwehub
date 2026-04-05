// =============================================================================
// Breeding profit calculation utilities
// =============================================================================

import type { AnimalData } from './breeding-data'

export interface BreedingSettings {
  useFocus: boolean
  isPremium: boolean
  pastureCount: number
}

export interface BreedingResult {
  animal: AnimalData
  babyCost: number
  foodCost: number
  adultPrice: number
  offspringChance: number
  revenue: number
  profit: number
  dailyProfit: number
  profitPerFocus: number
  growTimeHours: number
}

/**
 * Calculate breeding profit for a single animal.
 */
export function calculateBreedingProfit(
  animal: AnimalData,
  babyPrice: number,
  adultPrice: number,
  foodPrice: number,
  settings: BreedingSettings,
): BreedingResult {
  const offspringChance = settings.useFocus
    ? animal.focusOffspringChance
    : animal.offspringChance

  const growTimeHours = settings.isPremium
    ? animal.growTimeHours / 2
    : animal.growTimeHours

  const foodCost = animal.foodPerCycle * foodPrice
  const totalCost = babyPrice + foodCost

  // Revenue: adult sell price + chance of getting a baby back
  const revenue = adultPrice + offspringChance * babyPrice
  const profit = revenue - totalCost

  // Daily profit
  const cyclesPerDay = 24 / growTimeHours
  const dailyProfit = profit * cyclesPerDay * settings.pastureCount

  // Profit per focus point
  const focusPerCycle = 1200
  const profitPerFocus = settings.useFocus && focusPerCycle > 0
    ? profit / focusPerCycle
    : 0

  return {
    animal,
    babyCost: babyPrice,
    foodCost,
    adultPrice,
    offspringChance,
    revenue,
    profit,
    dailyProfit,
    profitPerFocus,
    growTimeHours,
  }
}

/**
 * Find the best animal by daily profit.
 */
export function findBestAnimal(results: BreedingResult[]): BreedingResult | null {
  if (results.length === 0) return null
  return results.reduce((best, curr) =>
    curr.dailyProfit > best.dailyProfit ? curr : best,
  )
}
