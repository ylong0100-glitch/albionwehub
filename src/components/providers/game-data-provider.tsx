'use client'

import { useEffect } from 'react'
import { useGameDataStore } from '@/lib/stores/game-data-store'

/**
 * Triggers game data loading on mount.
 * Place this component in the root layout to ensure data loads early.
 */
export function GameDataProvider({ children }: { children: React.ReactNode }) {
  const loadGameData = useGameDataStore((s) => s.loadGameData)

  useEffect(() => {
    loadGameData()
  }, [loadGameData])

  return <>{children}</>
}
