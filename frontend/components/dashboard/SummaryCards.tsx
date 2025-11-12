import { TrendingDown, TrendingUp } from 'lucide-react'
import clsx from 'clsx'
import type { MetricSummary } from '@/lib/metrics'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface SummaryCardsProps {
  metrics: MetricSummary[]
}

export function SummaryCards({ metrics }: SummaryCardsProps) {
  return (
    <section className="grid gap-4 md:grid-cols-3">
      {metrics.map((metric) => {
        const positive = metric.change >= 0
        const Icon = positive ? TrendingUp : TrendingDown
        return (
          <Card key={metric.label} className="bg-gradient-to-b from-background to-muted/30">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-semibold text-muted-foreground">{metric.label}</CardTitle>
              <Badge
                variant="secondary"
                className={clsx(
                  'flex items-center gap-1 bg-transparent text-xs font-medium',
                  positive ? 'text-emerald-500' : 'text-rose-400',
                )}
              >
                <Icon className="h-3.5 w-3.5" />
                {positive ? '+' : ''}
                {metric.change.toFixed(2)}%
              </Badge>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-semibold tracking-tight">{metric.value.toFixed(1)}</p>
              <p
                className={clsx(
                  'mt-2 text-sm font-medium',
                  positive ? 'text-emerald-500' : 'text-rose-400',
                )}
              >
                {positive ? '+' : ''}
                {metric.delta.toFixed(2)} 億円
              </p>
              <p className="text-xs text-muted-foreground">前日差</p>
            </CardContent>
          </Card>
        )
      })}
    </section>
  )
}
