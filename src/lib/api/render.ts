// =============================================================================
// Albion Online Render API
// Utility for building item icon and spell icon URLs
// =============================================================================

const RENDER_BASE = 'https://render.albiononline.com/v1'

// ---------------------------------------------------------------------------
// Item icon URL
// ---------------------------------------------------------------------------
export interface ItemIconOptions {
  /** Enchantment level (0-4) */
  enchantment?: number
  /** Quality level (1-5): 1=Normal, 2=Good, 3=Outstanding, 4=Excellent, 5=Masterpiece */
  quality?: number
  /** Icon size in pixels (default: 217) */
  size?: number
  /** Number to show on the icon (e.g. stack count) */
  count?: number
}

export function getItemIconUrl(
  itemId: string,
  options: ItemIconOptions = {},
): string {
  const { enchantment, quality, size, count } = options

  // Append enchantment to item ID if provided and > 0
  let resolvedId = itemId
  if (enchantment && enchantment > 0 && !itemId.includes('@')) {
    resolvedId = `${itemId}@${enchantment}`
  }

  const params = new URLSearchParams()
  if (quality !== undefined && quality > 1) {
    params.set('quality', String(quality))
  }
  if (size !== undefined) {
    params.set('size', String(size))
  }
  if (count !== undefined && count > 1) {
    params.set('count', String(count))
  }

  const queryString = params.toString()
  return `${RENDER_BASE}/item/${resolvedId}${queryString ? `?${queryString}` : ''}`
}

// ---------------------------------------------------------------------------
// Spell icon URL
// ---------------------------------------------------------------------------
export function getSpellIconUrl(spellId: string): string {
  return `${RENDER_BASE}/spell/${spellId}`
}

// ---------------------------------------------------------------------------
// Guild logo URL
// ---------------------------------------------------------------------------
export function getGuildLogoUrl(guildId: string, size: number = 256): string {
  // Guild logos are retrieved via the item render endpoint using their logo identifier
  return `${RENDER_BASE}/guild/${guildId}?size=${size}`
}

// ---------------------------------------------------------------------------
// Wardrobe skin icon URL
// ---------------------------------------------------------------------------
export function getWardrobeIconUrl(skinId: string, size: number = 217): string {
  return `${RENDER_BASE}/wardrobe/${skinId}?size=${size}`
}
