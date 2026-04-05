// =============================================================================
// Market feature module exports
// =============================================================================

// Components
export { PriceSearchBar } from './components/price-search-bar'
export { PriceComparisonTable } from './components/price-comparison-table'
export { PriceDetailPanel } from './components/price-detail-panel'
export { FavoritesPanel } from './components/favorites-panel'

// Hooks
export { usePrices } from './hooks/use-prices'
export { usePriceHistory } from './hooks/use-price-history'

// Utils
export {
  formatSilver,
  formatRelativeTime,
  formatItemName,
  CITY_COLORS,
  getCityShortName,
} from './utils/format'
