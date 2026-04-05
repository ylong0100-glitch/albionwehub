'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Share2, Check, Copy } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ShareButtonProps {
  url?: string
  title?: string
  className?: string
}

export function ShareButton({ url, title, className }: ShareButtonProps) {
  const [copied, setCopied] = useState(false)

  const handleShare = async () => {
    const shareUrl = url || window.location.href

    if (navigator.share) {
      try {
        await navigator.share({ title: title || 'AlbionHub', url: shareUrl })
        return
      } catch {
        // User cancelled or share failed, fall through to clipboard
      }
    }

    await navigator.clipboard.writeText(shareUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleShare}
      className={cn('gap-2', className)}
    >
      {copied ? (
        <>
          <Check className="h-4 w-4" />
          Copied
        </>
      ) : (
        <>
          <Share2 className="h-4 w-4" />
          Share
        </>
      )}
    </Button>
  )
}
