// =============================================================================
// Hardcoded breeding animal data
// =============================================================================

export interface AnimalData {
  id: string
  name: string
  tier: number
  adultId: string
  growTimeHours: number
  foodType: string
  foodPerCycle: number
  offspringChance: number
  focusOffspringChance: number
  category: 'farm' | 'mount'
}

export const ANIMALS: AnimalData[] = [
  { id: 'T3_FARM_CHICKEN_BABY', name: 'Chicken (Baby)', tier: 3, adultId: 'T3_FARM_CHICKEN_GROWN', growTimeHours: 44, foodType: 'T1_CARROT', foodPerCycle: 10, offspringChance: 0.333, focusOffspringChance: 0.667, category: 'farm' },
  { id: 'T4_FARM_GOAT_BABY', name: 'Kid (Baby Goat)', tier: 4, adultId: 'T4_FARM_GOAT_GROWN', growTimeHours: 44, foodType: 'T3_WHEAT', foodPerCycle: 10, offspringChance: 0.222, focusOffspringChance: 0.444, category: 'farm' },
  { id: 'T5_FARM_GOOSE_BABY', name: 'Gosling (Baby Goose)', tier: 5, adultId: 'T5_FARM_GOOSE_GROWN', growTimeHours: 44, foodType: 'T3_WHEAT', foodPerCycle: 20, offspringChance: 0.176, focusOffspringChance: 0.353, category: 'farm' },
  { id: 'T6_FARM_SHEEP_BABY', name: 'Lamb (Baby Sheep)', tier: 6, adultId: 'T6_FARM_SHEEP_GROWN', growTimeHours: 44, foodType: 'T5_POTATO', foodPerCycle: 20, offspringChance: 0.154, focusOffspringChance: 0.308, category: 'farm' },
  { id: 'T7_FARM_PIG_BABY', name: 'Piglet (Baby Pig)', tier: 7, adultId: 'T7_FARM_PIG_GROWN', growTimeHours: 44, foodType: 'T7_CORN', foodPerCycle: 30, offspringChance: 0.133, focusOffspringChance: 0.267, category: 'farm' },
  { id: 'T8_FARM_COW_BABY', name: 'Calf (Baby Cow)', tier: 8, adultId: 'T8_FARM_COW_GROWN', growTimeHours: 44, foodType: 'T8_PUMPKIN', foodPerCycle: 30, offspringChance: 0.118, focusOffspringChance: 0.235, category: 'farm' },
  { id: 'T5_MOUNT_HORSE_BABY', name: 'Foal (Baby Horse)', tier: 5, adultId: 'T5_MOUNT_HORSE', growTimeHours: 44, foodType: 'T5_POTATO', foodPerCycle: 20, offspringChance: 0.176, focusOffspringChance: 0.353, category: 'mount' },
  { id: 'T8_MOUNT_MAMMOTH_BABY', name: 'Baby Mammoth', tier: 8, adultId: 'T8_MOUNT_MAMMOTH', growTimeHours: 44, foodType: 'T8_PUMPKIN', foodPerCycle: 40, offspringChance: 0.118, focusOffspringChance: 0.235, category: 'mount' },
]

/** Get all unique item IDs needed for price fetching */
export function getAllBreedingItemIds(): string[] {
  const ids = new Set<string>()
  for (const animal of ANIMALS) {
    ids.add(animal.id)        // baby
    ids.add(animal.adultId)   // adult
    ids.add(animal.foodType)  // food
  }
  return Array.from(ids)
}
