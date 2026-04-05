'use client'

import * as React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Sword, ChevronDown, ChevronRight } from 'lucide-react'

import { cn } from '@/lib/utils'
import { useAppStore } from '@/lib/stores/app-store'
import { navGroups, type NavGroup } from '@/lib/nav-data'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { ScrollArea } from '@/components/ui/scroll-area'

function MobileNavGroup({ group }: { group: NavGroup }) {
  const pathname = usePathname()
  const setMobileNavOpen = useAppStore((s) => s.setMobileNavOpen)
  const isGroupActive = group.items.some((item) => pathname.startsWith(item.href))
  const [expanded, setExpanded] = React.useState(isGroupActive)

  React.useEffect(() => {
    if (isGroupActive) setExpanded(true)
  }, [isGroupActive])

  const GroupIcon = group.icon

  return (
    <div className="space-y-0.5">
      <button
        onClick={() => setExpanded(!expanded)}
        className={cn(
          'flex w-full items-center gap-2 rounded-md px-3 py-2 text-xs font-semibold uppercase tracking-wider transition-colors',
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
        <div className="ml-3 space-y-0.5 border-l border-border pl-3">
          {group.items.map((item) => {
            const ItemIcon = item.icon
            const isActive = pathname.startsWith(item.href)
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileNavOpen(false)}
                className={cn(
                  'flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors',
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

export function MobileNav() {
  const open = useAppStore((s) => s.mobileNavOpen)
  const setMobileNavOpen = useAppStore((s) => s.setMobileNavOpen)

  return (
    <Sheet open={open} onOpenChange={setMobileNavOpen}>
      <SheetContent side="left" className="w-72 p-0">
        <SheetHeader className="border-b border-border px-4 py-3">
          <SheetTitle className="flex items-center gap-2">
            <div className="flex size-7 items-center justify-center rounded-md bg-primary/10">
              <Sword className="size-3.5 text-primary" />
            </div>
            <span className="text-base font-bold tracking-tight">
              AlbionHub
            </span>
          </SheetTitle>
        </SheetHeader>
        <ScrollArea className="h-[calc(100vh-60px)]">
          <nav className="flex flex-col gap-2 p-2">
            {navGroups.map((group) => (
              <MobileNavGroup key={group.label} group={group} />
            ))}
          </nav>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  )
}
