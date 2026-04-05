import { TrendingUp, TrendingDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Card, CardContent } from '@/components/ui/card'

interface StatCardProps {
  label: string
  value: string | number
  delta?: number
  icon?: React.ReactNode
  className?: string
}

export function StatCard({ label, value, delta, icon, className }: StatCardProps) {
  return (
    <Card className={cn('relative', className)}>
      <CardContent className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-xs font-medium text-muted-foreground">{label}</p>
          <p className="text-2xl font-bold tracking-tight">{value}</p>
          {delta !== undefined && delta !== 0 && (
            <div
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
            </div>
          )}
        </div>
        {icon && (
          <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            {icon}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
