// =============================================================================
// Formatting utilities for the market module
// =============================================================================

/**
 * Format silver amount with thousands separator.
 * Returns "N/A" for zero or negative values.
 */
export function formatSilver(amount: number): string {
  if (!amount || amount <= 0) return 'N/A'
  return amount.toLocaleString('en-US')
}

/**
 * Format a date string as relative time (e.g., "2h ago", "5m ago").
 */
export function formatRelativeTime(dateString: string): string {
  if (!dateString) return 'N/A'

  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()

  if (diffMs < 0) return 'just now'

  const diffSeconds = Math.floor(diffMs / 1000)
  const diffMinutes = Math.floor(diffSeconds / 60)
  const diffHours = Math.floor(diffMinutes / 60)
  const diffDays = Math.floor(diffHours / 24)

  if (diffDays > 0) return `${diffDays}d ago`
  if (diffHours > 0) return `${diffHours}h ago`
  if (diffMinutes > 0) return `${diffMinutes}m ago`
  return 'just now'
}

/**
 * City color map for visual identification.
 */
export const CITY_COLORS: Record<string, string> = {
  Caerleon: '#e74c3c',
  Bridgewatch: '#e67e22',
  'Fort Sterling': '#95a5a6',
  Lymhurst: '#27ae60',
  Martlock: '#8d6e63',
  Thetford: '#8e44ad',
  Brecilien: '#00897b',
  'Black Market': '#424242',
}

/**
 * Get short display name for a city.
 */
export function getCityShortName(city: string): string {
  const SHORT_NAMES: Record<string, string> = {
    Caerleon: 'Caerl',
    Bridgewatch: 'BW',
    'Fort Sterling': 'FS',
    Lymhurst: 'LH',
    Martlock: 'ML',
    Thetford: 'TF',
    Brecilien: 'Brec',
    'Black Market': 'BM',
  }
  return SHORT_NAMES[city] ?? city
}

/**
 * Extract display-friendly name from item ID.
 * e.g., "T4_BAG" -> "T4 Bag", "T6_2H_ARCANESTAFF@2" -> "T6 2H Arcanestaff @2"
 */
export function formatItemName(itemId: string): string {
  const [base, enchant] = itemId.split('@')
  const parts = base.split('_')
  const formatted = parts
    .map((p) => {
      if (/^T\d$/.test(p)) return p
      return p.charAt(0).toUpperCase() + p.slice(1).toLowerCase()
    })
    .join(' ')
  return enchant ? `${formatted} @${enchant}` : formatted
}
