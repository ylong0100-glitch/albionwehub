'use client'

import * as React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Sword, ChevronLeft, ChevronDown, ChevronRight } from 'lucide-react'

import { cn } from '@/lib/utils'
import { useAppStore } from '@/lib/stores/app-store'
import { navGroups, type NavGroup } from '@/lib/nav-data'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'

function NavGroupSection({
  group,
  collapsed,
}: {
  group: NavGroup
  collapsed: boolean
}) {
  const pathname = usePathname()
  const isGroupActive = group.items.some((item) => pathname.startsWith(item.href))
  const [expanded, setExpanded] = React.useState(isGroupActive)

  // Auto-expand when a route in this group becomes active
  React.useEffect(() => {
    if (isGroupActive) setExpanded(true)
  }, [isGroupActive])

  const GroupIcon = group.icon

  if (collapsed) {
    return (
      <div className="flex flex-col items-center gap-0.5">
        {group.items.map((item) => {
          const ItemIcon = item.icon
          const isActive = pathname.startsWith(item.href)
          return (
            <Tooltip key={item.href}>
              <TooltipTrigger
                render={
                  <Link
                    href={item.href}
                    className={cn(
                      'flex size-8 items-center justify-center rounded-md transition-colors',
                      isActive
                        ? 'bg-primary/10 text-primary'
                        : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                    )}
                  />
                }
              >
                <ItemIcon className="size-4" />
              </TooltipTrigger>
              <TooltipContent side="right">{item.label}</TooltipContent>
            </Tooltip>
          )
        })}
      </div>
    )
  }

  return (
    <div className="space-y-0.5">
      <button
        onClick={() => setExpanded(!expanded)}
        className={cn(
          'flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-xs font-semibold uppercase tracking-wider transition-colors',
          isGroupActive
            ? 'text-foreground'
            : 'text-muted-foreground hover:text-foreground'
        )}
      >
        <GroupIcon className="size-4 shrink-0" />
        <span className="flex-1 text-left">{group.label}</span>
        {expanded ? (
          <ChevronDown className="size-3.5" />
        ) : (
          <ChevronRight className="size-3.5" />
        )}
      </button>
      {expanded && (
        <div className="ml-2 space-y-0.5 border-l border-border pl-2">
          {group.items.map((item) => {
            const ItemIcon = item.icon
            const isActive = pathname.startsWith(item.href)
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors',
                  isActive
                    ? 'bg-primary/10 text-primary font-medium'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                )}
              >
                <ItemIcon className="size-4 shrink-0" />
                <span>{item.label}</span>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}

export function Sidebar() {
  const collapsed = useAppStore((s) => s.sidebarCollapsed)
  const toggleSidebar = useAppStore((s) => s.toggleSidebar)

  return (
    <aside
      className={cn(
        'hidden flex-col border-r border-border bg-card transition-all duration-200 md:flex',
        collapsed ? 'w-14' : 'w-60'
      )}
    >
      {/* Logo */}
      <div
        className={cn(
          'flex h-14 items-center border-b border-border px-3',
          collapsed ? 'justify-center' : 'gap-2'
        )}
      >
        <div className="flex size-8 items-center justify-center rounded-md bg-primary/10">
          <Sword className="size-4 text-primary" />
        </div>
        {!collapsed && (
          <span className="text-base font-bold tracking-tight text-foreground">
            AlbionHub
          </span>
        )}
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1 py-2">
        <nav
          className={cn(
            'flex flex-col gap-3',
            collapsed ? 'items-center px-1' : 'px-2'
          )}
        >
          {navGroups.map((group) => (
            <NavGroupSection
              key={group.label}
              group={group}
              collapsed={collapsed}
            />
          ))}
        </nav>
      </ScrollArea>

      {/* Collapse toggle */}
      <div className="border-t border-border p-2">
        <Button
          variant="ghost"
          size={collapsed ? 'icon' : 'default'}
          onClick={toggleSidebar}
          className={cn('w-full', !collapsed && 'justify-start gap-2')}
        >
          <ChevronLeft
            className={cn(
              'size-4 transition-transform',
              collapsed && 'rotate-180'
            )}
          />
          {!collapsed && (
            <span className="text-sm text-muted-foreground">Collapse</span>
          )}
        </Button>
      </div>
    </aside>
  )
}
