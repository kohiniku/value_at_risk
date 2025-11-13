'use client'

import { useTheme } from '@/hooks/useTheme'
import { Switch } from '@/components/ui/switch'

export function AppHeader() {
  const { theme, toggleTheme } = useTheme()

  return (
    <header className="sticky top-0 z-20 border-b border-border bg-background/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-6 py-4">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary font-semibold">
            VaR
          </span>
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-muted-foreground">ダッシュボード</p>
            <h1 className="text-lg font-bold">Value at Risk モニター</h1>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">
          <span>テーマ</span>
          <Switch aria-label="ダークモード切り替え" pressed={theme === 'dark'} onClick={toggleTheme} />
        </div>
      </div>
    </header>
  )
}
