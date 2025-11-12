'use client'

import Link from 'next/link'
import clsx from 'clsx'
import { useTheme } from '@/hooks/useTheme'
import { Switch } from '@/components/ui/switch'
import { Button } from '@/components/ui/button'
import { Select } from '@/components/ui/select'

interface AppHeaderProps {
  dates?: string[]
  selectedDate?: string
  onDateChange?: (date: string) => void
  onExportPdf?: () => void
  exporting?: boolean
}

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })

export function AppHeader({
  dates = [],
  selectedDate,
  onDateChange,
  onExportPdf,
  exporting = false,
}: AppHeaderProps) {
  const { theme, toggleTheme } = useTheme()

  return (
    <header className="sticky top-0 z-20 border-b border-border bg-background/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-6 py-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary font-semibold">
            VaR
          </span>
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-muted-foreground">ダッシュボード</p>
            <h1 className="text-lg font-bold">Value at Risk モニター</h1>
          </div>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
          {onDateChange && dates.length > 0 && selectedDate && (
            <div className="sm:min-w-[220px]">
              <Select
                value={selectedDate}
                label="基準日"
                onChange={(event) => onDateChange(event.target.value)}
              >
                {dates.map((iso) => (
                  <option key={iso} value={iso}>
                    {formatDate(iso)}
                  </option>
                ))}
              </Select>
            </div>
          )}
          <div className="flex items-center gap-3">
            {onExportPdf && (
              <Button variant="outline" size="sm" onClick={onExportPdf} disabled={exporting}>
                {exporting ? '生成中...' : 'PDF出力'}
              </Button>
            )}
            <Link
              href="/"
              className={clsx(
                'hidden sm:inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition',
                'text-muted-foreground hover:text-foreground hover:bg-border/30 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring',
              )}
            >
              ホーム
            </Link>
            <Switch pressed={theme === 'dark'} onClick={toggleTheme} />
          </div>
        </div>
      </div>
    </header>
  )
}
