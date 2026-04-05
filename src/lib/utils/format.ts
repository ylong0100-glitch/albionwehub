// =============================================================================
// Formatting utilities
// =============================================================================

/**
 * Format silver amount with K/M/B suffixes and commas.
 * Examples: 1234 -> "1,234", 1500000 -> "1.5M"
 */
export function formatSilver(amount: number, options?: { compact?: boolean; showSign?: boolean }): string {
  const { compact = true, showSign = false } = options ?? {}
  const sign = showSign && amount > 0 ? '+' : ''

  if (!compact || Math.abs(amount) < 10_000) {
    return `${sign}${amount.toLocaleString('en-US')}`
  }

  const abs = Math.abs(amount)
  const prefix = amount < 0 ? '-' : sign

  if (abs >= 1_000_000_000) {
    return `${prefix}${(abs / 1_000_000_000).toFixed(1)}B`
  }
  if (abs >= 1_000_000) {
    return `${prefix}${(abs / 1_000_000).toFixed(1)}M`
  }
  if (abs >= 10_000) {
    return `${prefix}${(abs / 1_000).toFixed(1)}K`
  }
  return `${prefix}${abs.toLocaleString('en-US')}`
}

/**
 * Format a generic number with locale-aware separators.
 * Supports compact notation for large numbers.
 */
export function formatNumber(value: number, options?: { decimals?: number; compact?: boolean }): string {
  const { decimals = 0, compact = false } = options ?? {}

  if (compact) {
    const abs = Math.abs(value)
    if (abs >= 1_000_000_000) return `${(value / 1_000_000_000).toFixed(1)}B`
    if (abs >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`
    if (abs >= 1_000) return `${(value / 1_000).toFixed(1)}K`
  }

  return value.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })
}

/**
 * Format a percentage value.
 * Examples: 0.152 -> "15.2%", -0.05 -> "-5.0%"
 */
export function formatPercent(value: number, decimals: number = 1): string {
  return `${(value * 100).toFixed(decimals)}%`
}

/**
 * Format an ISO date string to a localized date.
 */
export function formatDate(
  dateStr: string | Date,
  options?: {
    style?: 'short' | 'medium' | 'long'
    includeTime?: boolean
  },
): string {
  const { style = 'medium', includeTime = false } = options ?? {}
  const date = typeof dateStr === 'string' ? new Date(dateStr) : dateStr

  if (isNaN(date.getTime())) return 'Invalid date'

  const dateOptions: Intl.DateTimeFormatOptions = {}

  switch (style) {
    case 'short':
      dateOptions.month = 'numeric'
      dateOptions.day = 'numeric'
      break
    case 'medium':
      dateOptions.month = 'short'
      dateOptions.day = 'numeric'
      dateOptions.year = 'numeric'
      break
    case 'long':
      dateOptions.month = 'long'
      dateOptions.day = 'numeric'
      dateOptions.year = 'numeric'
      dateOptions.weekday = 'long'
      break
  }

  if (includeTime) {
    dateOptions.hour = '2-digit'
    dateOptions.minute = '2-digit'
  }

  return date.toLocaleDateString('en-US', dateOptions)
}

/**
 * Format a date as relative time ago.
 * Examples: "2 minutes ago", "3 hours ago", "5 days ago"
 */
export function formatTimeAgo(dateStr: string | Date | number): string {
  const date = typeof dateStr === 'number' ? new Date(dateStr) : typeof dateStr === 'string' ? new Date(dateStr) : dateStr
  const now = Date.now()
  const diffMs = now - date.getTime()

  if (diffMs < 0) return 'just now'

  const seconds = Math.floor(diffMs / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)
  const weeks = Math.floor(days / 7)
  const months = Math.floor(days / 30)
  const years = Math.floor(days / 365)

  if (seconds < 5) return 'just now'
  if (seconds < 60) return `${seconds}s ago`
  if (minutes < 60) return `${minutes}m ago`
  if (hours < 24) return `${hours}h ago`
  if (days < 7) return `${days}d ago`
  if (weeks < 5) return `${weeks}w ago`
  if (months < 12) return `${months}mo ago`
  return `${years}y ago`
}

/**
 * Format a duration in seconds to a readable string.
 * Examples: 3661 -> "1h 1m 1s", 90 -> "1m 30s"
 */
export function formatDuration(totalSeconds: number): string {
  if (totalSeconds <= 0) return '0s'

  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = Math.floor(totalSeconds % 60)

  const parts: string[] = []
  if (hours > 0) parts.push(`${hours}h`)
  if (minutes > 0) parts.push(`${minutes}m`)
  if (seconds > 0 || parts.length === 0) parts.push(`${seconds}s`)

  return parts.join(' ')
}

/**
 * Format item power number.
 * Examples: 1200 -> "1200 IP", 1200.5 -> "1200 IP"
 */
export function formatItemPower(ip: number): string {
  return `${Math.round(ip)} IP`
}
