'use client'

import * as React from 'react'
import { usePathname } from 'next/navigation'
import { Menu, ChevronRight, Sun, Moon, Monitor, Languages } from 'lucide-react'

import { cn } from '@/lib/utils'
import { useAppStore, type Theme, type Language } from '@/lib/stores/app-store'
import { Button } from '@/components/ui/button'
import { RegionSelector } from '@/components/shared/region-selector'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

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

const LANGUAGE_OPTIONS: { value: Language; label: string; flag: string }[] = [
  { value: 'en', label: 'EN', flag: '🇺🇸' },
  { value: 'zh', label: '中文', flag: '🇨🇳' },
  { value: 'de', label: 'DE', flag: '🇩🇪' },
  { value: 'ru', label: 'RU', flag: '🇷🇺' },
  { value: 'pt', label: 'PT', flag: '🇧🇷' },
  { value: 'es', label: 'ES', flag: '🇪🇸' },
  { value: 'fr', label: 'FR', flag: '🇫🇷' },
  { value: 'ko', label: '한국어', flag: '🇰🇷' },
]

function LanguageSelector() {
  const language = useAppStore((s) => s.language)
  const setLanguage = useAppStore((s) => s.setLanguage)
  const current = LANGUAGE_OPTIONS.find((l) => l.value === language) || LANGUAGE_OPTIONS[0]

  return (
    <Select value={language} onValueChange={(v) => { if (v) setLanguage(v as Language) }}>
      <SelectTrigger className="h-8 w-auto gap-1 border-none bg-transparent px-2 text-xs">
        <SelectValue>
          <span>{current.flag}{current.label}</span>
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {LANGUAGE_OPTIONS.map((lang) => (
          <SelectItem key={lang.value} value={lang.value}>
            {lang.flag} {lang.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
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
        <LanguageSelector />
        <ThemeToggle />
      </div>
    </header>
  )
}
