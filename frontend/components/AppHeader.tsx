'use client'

import Link from 'next/link'
import clsx from 'clsx'
import { useTheme } from '@/hooks/useTheme'
import { Switch } from '@/components/ui/switch'

export function AppHeader() {
  const { theme, toggleTheme } = useTheme()

  return (
    <header className="sticky top-0 z-20 border-b border-border bg-background/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary font-semibold">
            VaR
          </span>
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-muted-foreground">ダッシュボード</p>
            <h1 className="text-lg font-bold">Value at Risk モニター</h1>
          </div>
        </div>
        <div className="flex items-center gap-3">
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
    </header>
  )
}
