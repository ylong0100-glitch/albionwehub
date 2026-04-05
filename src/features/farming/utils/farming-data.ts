// =============================================================================
// Hardcoded farming crop and herb data
// =============================================================================

export interface CropData {
  id: string
  name: string
  tier: number
  seedId: string
  growTimeHours: number
  baseYield: number
  focusYield: number
  category: 'crop' | 'herb'
}

export const CROPS: CropData[] = [
  { id: 'T1_CARROT', name: 'Carrot', tier: 1, seedId: 'T1_CARROT_SEED', growTimeHours: 22, baseYield: 9, focusYield: 12, category: 'crop' },
  { id: 'T3_WHEAT', name: 'Wheat', tier: 3, seedId: 'T3_WHEAT_SEED', growTimeHours: 22, baseYield: 9, focusYield: 12, category: 'crop' },
  { id: 'T5_POTATO', name: 'Potato', tier: 5, seedId: 'T5_POTATO_SEED', growTimeHours: 22, baseYield: 9, focusYield: 12, category: 'crop' },
  { id: 'T7_CORN', name: 'Corn', tier: 7, seedId: 'T7_CORN_SEED', growTimeHours: 22, baseYield: 9, focusYield: 12, category: 'crop' },
  { id: 'T8_PUMPKIN', name: 'Pumpkin', tier: 8, seedId: 'T8_PUMPKIN_SEED', growTimeHours: 22, baseYield: 9, focusYield: 12, category: 'crop' },
  { id: 'T2_AGARIC', name: 'Arcane Agaric', tier: 2, seedId: 'T2_AGARIC_SEED', growTimeHours: 22, baseYield: 9, focusYield: 12, category: 'herb' },
  { id: 'T4_COMFREY', name: 'Brightleaf Comfrey', tier: 4, seedId: 'T4_COMFREY_SEED', growTimeHours: 22, baseYield: 9, focusYield: 12, category: 'herb' },
  { id: 'T6_FOXGLOVE', name: 'Elusive Foxglove', tier: 6, seedId: 'T6_FOXGLOVE_SEED', growTimeHours: 22, baseYield: 9, focusYield: 12, category: 'herb' },
  { id: 'T8_YARROW', name: 'Ghoul Yarrow', tier: 8, seedId: 'T8_YARROW_SEED', growTimeHours: 22, baseYield: 9, focusYield: 12, category: 'herb' },
]

/** Get all unique item IDs needed for price fetching (crops + seeds) */
export function getAllFarmingItemIds(): string[] {
  const ids: string[] = []
  for (const crop of CROPS) {
    ids.push(crop.id)
    ids.push(crop.seedId)
  }
  return ids
}
