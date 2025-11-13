'use client'

import { useId } from 'react'
import { Card } from '@/components/ui/card'
import type { MarketSignal } from '@/types/var'

interface MarketSignalGaugeProps {
  signal: MarketSignal
}

export function MarketSignalGauge({ signal }: MarketSignalGaugeProps) {
  const normalized = Math.min(Math.max(signal.score ?? 0, 0), 100)
  const radius = 80
  const circumference = Math.PI * radius
  const dashOffset = circumference * (1 - normalized / 100)
  const pointerAngle = (normalized / 100) * 180 - 90
  const gradientId = useId()

  return (
    <Card title="市場強気度メーター" footer={`スコア: ${normalized.toFixed(1)}`}>
      <div className="space-y-4">
        <div className="relative mx-auto h-40 w-full max-w-sm">
          <svg viewBox="0 0 200 120" className="w-full">
            <path d="M20 100 A80 80 0 0 1 180 100" stroke="#1e2438" strokeWidth="14" fill="transparent" opacity="0.35" />
            <path
              d="M20 100 A80 80 0 0 1 180 100"
              stroke={`url(#${gradientId})`}
              strokeWidth="14"
              strokeLinecap="round"
              fill="transparent"
              strokeDasharray={circumference}
              strokeDashoffset={dashOffset}
            />
            <defs>
              <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#f97316" />
                <stop offset="50%" stopColor="#facc15" />
                <stop offset="100%" stopColor="#34d399" />
              </linearGradient>
            </defs>
          </svg>
          <div
            className="absolute left-1/2 bottom-5 h-24 w-1.5 origin-bottom -translate-x-1/2 rounded-full bg-gradient-to-t from-slate-200 via-emerald-200 to-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.7)]"
            style={{ transform: `rotate(${pointerAngle}deg)` }}
          />
          <div className="absolute inset-x-0 top-4 flex justify-between px-5 text-[10px] font-semibold uppercase tracking-[0.3em] text-muted-foreground">
            <span className="text-left">慎重</span>
            <span className="text-center">中立</span>
            <span className="text-right">強気</span>
          </div>
        </div>
        <div className="flex items-baseline gap-2">
          <p className="text-4xl font-semibold">{normalized.toFixed(0)}</p>
          <span className="text-sm font-medium text-primary">{signal.label}</span>
        </div>
        <p className="text-sm leading-relaxed text-muted-foreground">{signal.narrative}</p>
      </div>
    </Card>
  )
}
