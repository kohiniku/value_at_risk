'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import type { NewsItem } from '@/types/var'

interface NewsPanelProps {
  items: NewsItem[]
  loading?: boolean
}

export function NewsPanel({ items, loading = false }: NewsPanelProps) {
  const formatMeta = (item: NewsItem) => {
    const when = new Date(item.published_at)
    return `${item.source} • ${when.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })}`
  }

  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-base">関連ニュース</CardTitle>
        <p className="text-xs text-muted-foreground">VaR変動と関係するトピックを自動でピックアップします。</p>
      </CardHeader>
      <CardContent className="px-0 pb-0">
        {loading ? (
          <div className="space-y-3 px-6 pb-6">
            {[0, 1, 2].map((item) => (
              <div key={item} className="space-y-2">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-2/3" />
              </div>
            ))}
          </div>
        ) : (
          <ScrollArea className="h-[360px] px-6">
            <div className="space-y-4 py-2">
              {items.length === 0 && (
                <p className="text-sm text-muted-foreground">表示できるニュースはありません。</p>
              )}
              {items.map((item, index) => (
                <div key={item.id}>
                  <p className="text-sm font-semibold text-foreground">{item.headline}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{formatMeta(item)}</p>
                  {item.summary && <p className="mt-2 text-sm text-muted-foreground">{item.summary}</p>}
                  {index !== items.length - 1 && <Separator className="mt-4" />}
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  )
}
