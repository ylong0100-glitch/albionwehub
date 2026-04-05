'use client'

import { TrendingUp, TrendingDown } from 'lucide-react'
import { cn } from '@/lib/utils'

interface PriceDisplayProps {
  amount: number
  showIcon?: boolean
  delta?: number
  className?: string
}

function formatNumber(n: number): string {
  return n.toLocaleString('en-US')
}

export function PriceDisplay({
  amount,
  showIcon = true,
  delta,
  className,
}: PriceDisplayProps) {
  return (
    <span className={cn('inline-flex items-center gap-1', className)}>
      {showIcon && (
        <svg
          className="size-4 shrink-0"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle cx="12" cy="12" r="10" fill="#C0C0C0" opacity="0.3" />
          <circle cx="12" cy="12" r="8" fill="#C0C0C0" />
          <text
            x="12"
            y="16"
            textAnchor="middle"
            fontSize="10"
            fontWeight="bold"
            fill="#555"
          >
            S
          </text>
        </svg>
      )}
      <span className="font-mono tabular-nums">{formatNumber(amount)}</span>
      {delta !== undefined && delta !== 0 && (
        <span
          className={cn(
            'inline-flex items-center gap-0.5 text-xs font-medium',
            delta > 0 ? 'text-green-500' : 'text-red-500'
          )}
        >
          {delta > 0 ? (
            <TrendingUp className="size-3" />
          ) : (
            <TrendingDown className="size-3" />
          )}
          {delta > 0 ? '+' : ''}
          {delta.toFixed(1)}%
        </span>
      )}
    </span>
  )
}
