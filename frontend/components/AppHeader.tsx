'use client'

import Link from 'next/link'
import { Download, Moon, SunMedium } from 'lucide-react'
import { useTheme } from '@/hooks/useTheme'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'

interface AppHeaderProps {
  dates: string[]
  selectedDate: string
  onDateChange: (date: string) => void
  onExportPdf?: () => void
  exporting?: boolean
}

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })

export function AppHeader({ dates, selectedDate, onDateChange, onExportPdf, exporting }: AppHeaderProps) {
  const { theme, applyTheme } = useTheme()
  const hasDates = dates.length > 0 && Boolean(selectedDate)

  return (
    <header className="sticky top-0 z-20 border-b border-border/60 bg-background/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-6 py-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-3">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-lg font-semibold text-primary">
              VaR
            </span>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.4em] text-muted-foreground">Value at Risk</p>
              <h1 className="text-2xl font-bold">モニタリングセンター</h1>
            </div>
            <Badge variant="secondary" className="text-xs uppercase tracking-wide">
              99% ヒストリカル法
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            基準日を切り替えると全カード・グラフ・ニュース・シナリオが即時に再計算されます。
          </p>
        </div>

        <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
          <div className="space-y-1">
            <Label className="text-xs uppercase tracking-wide text-muted-foreground">基準日</Label>
            <Select value={hasDates ? selectedDate : undefined} onValueChange={onDateChange} disabled={!hasDates}>
              <SelectTrigger className="w-[230px]">
                <SelectValue placeholder="取得中..." />
              </SelectTrigger>
              <SelectContent className="max-h-72">
                {dates.map((date) => (
                  <SelectItem key={date} value={date}>
                    {formatDate(date)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            {onExportPdf && (
              <Button
                variant="outline"
                size="sm"
                className="min-w-[140px]"
                onClick={onExportPdf}
                disabled={exporting}
              >
                <Download className="h-4 w-4" />
                {exporting ? 'PDF生成中...' : 'PDF出力'}
              </Button>
            )}
            <Link
              href="/"
              className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
            >
              ホーム
            </Link>
            <div className="flex items-center gap-3 rounded-full border border-border/80 px-4 py-2">
              <SunMedium className="h-4 w-4 text-muted-foreground" />
              <Switch
                checked={theme === 'dark'}
                onCheckedChange={(checked) => applyTheme(checked ? 'dark' : 'light')}
                aria-label="テーマを切り替える"
              />
              <Moon className="h-4 w-4 text-muted-foreground" />
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
