// =============================================================================
// Zustand Application Store
// Persisted global state for region, theme, sidebar, and preferences
// =============================================================================

import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
export type Region = 'west' | 'east' | 'europe'
export type Theme = 'light' | 'dark' | 'system'
export type Currency = 'silver' | 'gold'
export type Language = 'en' | 'zh' | 'de' | 'fr' | 'es' | 'pt' | 'ru' | 'ko' | 'ja'

// ---------------------------------------------------------------------------
// State interface
// ---------------------------------------------------------------------------
interface AppState {
  // Region
  region: Region
  setRegion: (region: Region) => void

  // Theme
  theme: Theme
  setTheme: (theme: Theme) => void

  // Sidebar
  sidebarCollapsed: boolean
  setSidebarCollapsed: (collapsed: boolean) => void
  toggleSidebar: () => void

  // Mobile nav
  mobileNavOpen: boolean
  setMobileNavOpen: (open: boolean) => void

  // Sidebar open state (desktop)
  sidebarOpen: boolean
  setSidebarOpen: (open: boolean) => void

  // Preferences
  preferredCurrency: Currency
  setPreferredCurrency: (currency: Currency) => void
  language: Language
  setLanguage: (language: Language) => void

  // Default market locations filter
  favoriteLocations: string[]
  addFavoriteLocation: (location: string) => void
  removeFavoriteLocation: (location: string) => void
  setFavoriteLocations: (locations: string[]) => void

  // Notification preferences
  notificationsEnabled: boolean
  setNotificationsEnabled: (enabled: boolean) => void

  // Data refresh interval (seconds)
  refreshInterval: number
  setRefreshInterval: (interval: number) => void
}

// ---------------------------------------------------------------------------
// Store
// ---------------------------------------------------------------------------
export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      // Region
      region: 'west',
      setRegion: (region) => set({ region }),

      // Theme
      theme: 'dark',
      setTheme: (theme) => set({ theme }),

      // Sidebar
      sidebarCollapsed: false,
      setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
      toggleSidebar: () =>
        set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),

      // Mobile nav
      mobileNavOpen: false,
      setMobileNavOpen: (open) => set({ mobileNavOpen: open }),

      // Sidebar open (desktop)
      sidebarOpen: true,
      setSidebarOpen: (sidebarOpen) => set({ sidebarOpen }),

      // Preferences
      preferredCurrency: 'silver',
      setPreferredCurrency: (preferredCurrency) => set({ preferredCurrency }),
      language: 'en',
      setLanguage: (language) => set({ language }),

      // Favorite locations
      favoriteLocations: [
        'Caerleon',
        'Bridgewatch',
        'Fort Sterling',
        'Lymhurst',
        'Martlock',
        'Thetford',
      ],
      addFavoriteLocation: (location) =>
        set((state) => ({
          favoriteLocations: state.favoriteLocations.includes(location)
            ? state.favoriteLocations
            : [...state.favoriteLocations, location],
        })),
      removeFavoriteLocation: (location) =>
        set((state) => ({
          favoriteLocations: state.favoriteLocations.filter((l) => l !== location),
        })),
      setFavoriteLocations: (favoriteLocations) => set({ favoriteLocations }),

      // Notifications
      notificationsEnabled: false,
      setNotificationsEnabled: (notificationsEnabled) => set({ notificationsEnabled }),

      // Refresh interval (default 5 minutes)
      refreshInterval: 300,
      setRefreshInterval: (refreshInterval) => set({ refreshInterval }),
    }),
    {
      name: 'albionhub-app',
      storage: createJSONStorage(() => {
        if (typeof window !== 'undefined') {
          return localStorage
        }
        // SSR fallback: no-op storage
        return {
          getItem: () => null,
          setItem: () => {},
          removeItem: () => {},
        }
      }),
      partialize: (state) => ({
        region: state.region,
        theme: state.theme,
        sidebarCollapsed: state.sidebarCollapsed,
        preferredCurrency: state.preferredCurrency,
        language: state.language,
        favoriteLocations: state.favoriteLocations,
        notificationsEnabled: state.notificationsEnabled,
        refreshInterval: state.refreshInterval,
      }),
    },
  ),
)
