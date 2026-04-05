'use client'

import * as React from 'react'
import { usePathname } from 'next/navigation'
import { Menu, ChevronRight, Sun, Moon, Monitor } from 'lucide-react'

import { cn } from '@/lib/utils'
import { useAppStore, type Theme } from '@/lib/stores/app-store'
import { Button } from '@/components/ui/button'
import { RegionSelector } from '@/components/shared/region-selector'

function useBreadcrumbs() {
  const pathname = usePathname()

  return React.useMemo(() => {
    const segments = pathname.split('/').filter(Boolean)
    return segments.map((seg, i) => ({
      label: seg.charAt(0).toUpperCase() + seg.slice(1).replace(/-/g, ' '),
      href: '/' + segments.slice(0, i + 1).join('/'),
      isLast: i === segments.length - 1,
    }))
  }, [pathname])
}

function ThemeToggle() {
  const theme = useAppStore((s) => s.theme)
  const setTheme = useAppStore((s) => s.setTheme)

  React.useEffect(() => {
    const root = document.documentElement

    function applyTheme(t: Theme) {
      if (t === 'dark') {
        root.classList.add('dark')
      } else if (t === 'light') {
        root.classList.remove('dark')
      } else {
        // system
        const prefersDark = window.matchMedia(
          '(prefers-color-scheme: dark)'
        ).matches
        if (prefersDark) {
          root.classList.add('dark')
        } else {
          root.classList.remove('dark')
        }
      }
    }

    applyTheme(theme)

    if (theme === 'system') {
      const mq = window.matchMedia('(prefers-color-scheme: dark)')
      const handler = () => applyTheme('system')
      mq.addEventListener('change', handler)
      return () => mq.removeEventListener('change', handler)
    }
  }, [theme])

  const nextTheme: Record<Theme, Theme> = {
    light: 'dark',
    dark: 'system',
    system: 'light',
  }

  const icons: Record<Theme, React.ReactNode> = {
    light: <Sun className="size-4" />,
    dark: <Moon className="size-4" />,
    system: <Monitor className="size-4" />,
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(nextTheme[theme])}
      aria-label={`Current theme: ${theme}. Click to switch.`}
    >
      {icons[theme]}
    </Button>
  )
}

export function Topbar() {
  const setMobileNavOpen = useAppStore((s) => s.setMobileNavOpen)
  const breadcrumbs = useBreadcrumbs()

  return (
    <header className="flex h-14 shrink-0 items-center gap-3 border-b border-border bg-card px-4">
      {/* Mobile menu button */}
      <Button
        variant="ghost"
        size="icon"
        className="md:hidden"
        onClick={() => setMobileNavOpen(true)}
        aria-label="Open menu"
      >
        <Menu className="size-5" />
      </Button>

      {/* Breadcrumb */}
      <nav className="flex flex-1 items-center gap-1 overflow-hidden text-sm">
        {breadcrumbs.length === 0 ? (
          <span className="text-muted-foreground">Home</span>
        ) : (
          breadcrumbs.map((crumb, i) => (
            <React.Fragment key={crumb.href}>
              {i > 0 && (
                <ChevronRight className="size-3.5 shrink-0 text-muted-foreground" />
              )}
              <span
                className={cn(
                  'truncate',
                  crumb.isLast
                    ? 'font-medium text-foreground'
                    : 'text-muted-foreground'
                )}
              >
                {crumb.label}
              </span>
            </React.Fragment>
          ))
        )}
      </nav>

      {/* Right side actions */}
      <div className="flex items-center gap-1">
        <RegionSelector />
        <ThemeToggle />
      </div>
    </header>
  )
}
