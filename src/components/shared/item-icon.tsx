'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'
import { Skeleton } from '@/components/ui/skeleton'
import { ImageOff } from 'lucide-react'

interface ItemIconProps {
  itemId: string
  size?: number
  quality?: number
  enchantment?: number
  className?: string
}

const qualityBorderColors: Record<number, string> = {
  1: 'border-zinc-400',
  2: 'border-green-500',
  3: 'border-blue-500',
  4: 'border-purple-500',
  5: 'border-amber-400',
}

/**
 * Build the local icon filename.
 * Local icons are stored as: /icons/items/{itemId}.png
 * where @ in enchanted IDs is replaced with _at_ for filesystem safety.
 */
function getLocalIconPath(itemId: string, enchantment: number): string {
  const fullId = enchantment > 0 ? `${itemId}@${enchantment}` : itemId
  const filename = fullId.replace(/@/g, '_at_')
  return `/icons/items/${filename}.png`
}

function getRemoteIconUrl(itemId: string, enchantment: number, quality: number, size: number): string {
  const renderSize = Math.min(size * 2, 128)
  return `https://render.albiononline.com/v1/item/${itemId}${enchantment ? `@${enchantment}` : ''}.png?quality=${quality}&size=${renderSize}`
}

export function ItemIcon({
  itemId,
  size = 64,
  quality = 1,
  enchantment = 0,
  className,
}: ItemIconProps) {
  const [status, setStatus] = React.useState<'loading' | 'loaded' | 'error'>('loading')
  const [useRemote, setUseRemote] = React.useState(false)

  // Try local first, fallback to remote
  const localSrc = getLocalIconPath(itemId, enchantment)
  const remoteSrc = getRemoteIconUrl(itemId, enchantment, quality, size)
  const src = useRemote ? remoteSrc : localSrc

  // Reset state when itemId changes
  React.useEffect(() => {
    setStatus('loading')
    setUseRemote(false)
  }, [itemId, enchantment])

  const handleError = () => {
    if (!useRemote) {
      // Local icon not found, try remote
      setUseRemote(true)
      setStatus('loading')
    } else {
      // Remote also failed
      setStatus('error')
    }
  }

  const borderColor = qualityBorderColors[quality] ?? qualityBorderColors[1]

  return (
    <div
      className={cn(
        'relative inline-flex items-center justify-center overflow-hidden rounded-md border-2 bg-muted',
        borderColor,
        className
      )}
      style={{ width: size, height: size }}
    >
      {status === 'loading' && (
        <Skeleton className="absolute inset-0 rounded-none" />
      )}
      {status === 'error' ? (
        <div className="flex size-full items-center justify-center bg-muted">
          <ImageOff className="size-1/2 text-muted-foreground" />
        </div>
      ) : (
        <img
          src={src}
          alt={itemId}
          width={size}
          height={size}
          loading="lazy"
          onLoad={() => setStatus('loaded')}
          onError={handleError}
          className={cn(
            'size-full object-contain transition-opacity',
            status === 'loaded' ? 'opacity-100' : 'opacity-0'
          )}
        />
      )}
    </div>
  )
}
