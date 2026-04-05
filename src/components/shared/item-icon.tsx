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

export function ItemIcon({
  itemId,
  size = 64,
  quality = 1,
  enchantment = 0,
  className,
}: ItemIconProps) {
  const [status, setStatus] = React.useState<'loading' | 'loaded' | 'error'>(
    'loading'
  )

  const src = `https://render.albiononline.com/v1/item/${itemId}${enchantment ? `@${enchantment}` : ''}.png?quality=${quality}&size=${size}`

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
          onError={() => setStatus('error')}
          className={cn(
            'size-full object-contain transition-opacity',
            status === 'loaded' ? 'opacity-100' : 'opacity-0'
          )}
        />
      )}
    </div>
  )
}
