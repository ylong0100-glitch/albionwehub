import { AppShell } from '@/components/layout/app-shell'
import { GameDataProvider } from '@/components/providers/game-data-provider'

export default function LocaleLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <GameDataProvider>
      <AppShell>{children}</AppShell>
    </GameDataProvider>
  )
}
