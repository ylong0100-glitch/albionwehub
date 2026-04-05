// =============================================================================
// Game Data types — processed data from ao-bin-dumps
// =============================================================================

export interface ProcessedItem {
  id: string
  name: string
  nameZH?: string
  tier: number
  enchantment: number
  category: string
  subcategory: string
  weight?: number
}

export interface ProcessedRecipe {
  itemId: string
  materials: Array<{ itemId: string; count: number }>
  silver: number
  craftingFocus: number
  amountCrafted: number
}
