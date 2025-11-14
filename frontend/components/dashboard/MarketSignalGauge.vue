<template>
  <UiCard title="市場強気度メーター">
    <template #footer>
      スコア: {{ normalized.toFixed(1) }}
    </template>
    <div class="space-y-6">
      <div class="relative mx-auto w-full max-w-md pt-6">
        <svg viewBox="0 0 240 140" class="w-full" role="presentation" aria-hidden="true">
          <path
            d="M30 120 A90 90 0 0 1 210 120"
            stroke="#1e2438"
            stroke-width="16"
            fill="transparent"
            opacity="0.25"
            stroke-linecap="round"
          />
          <path
            d="M30 120 A90 90 0 0 1 210 120"
            :stroke="`url(#${gradientId})`"
            stroke-width="16"
            stroke-linecap="round"
            fill="transparent"
            :stroke-dasharray="circumference"
            :stroke-dashoffset="dashOffset"
          />
          <defs>
            <linearGradient :id="gradientId" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stop-color="#f97316" />
              <stop offset="50%" stop-color="#facc15" />
              <stop offset="100%" stop-color="#34d399" />
            </linearGradient>
          </defs>
        </svg>
        <div class="absolute inset-x-0 top-6 flex justify-between px-8 text-[11px] font-semibold uppercase tracking-[0.35em] text-muted-foreground">
          <span class="-translate-y-1">慎重</span>
          <span class="-translate-y-4">中立</span>
          <span class="-translate-y-1">強気</span>
        </div>
        <div
          class="absolute left-1/2 bottom-6 h-28 w-1.5 origin-bottom -translate-x-1/2 rounded-full bg-gradient-to-t from-slate-200 via-emerald-200 to-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.6)]"
          :style="{ transform: `rotate(${pointerAngle}deg)` }"
        />
        <div class="pointer-events-none absolute left-1/2 top-[47%] flex -translate-x-1/2 flex-col items-center rounded-xl border border-border/60 bg-background/95 px-4 py-3 text-center shadow-lg">
          <span class="text-[0.55rem] font-semibold uppercase tracking-[0.4em] text-muted-foreground">Score</span>
          <span class="text-3xl font-bold leading-tight text-foreground">{{ normalized.toFixed(0) }}</span>
        </div>
      </div>
      <div class="flex flex-col items-center gap-1">
        <span class="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">ステータス</span>
        <span class="text-lg font-semibold text-primary">{{ signal.label }}</span>
      </div>
      <div class="rounded-2xl border border-border/60 bg-muted/10 px-4 py-3">
        <p class="text-xs font-semibold uppercase tracking-[0.35em] text-muted-foreground">現状コメント</p>
        <p class="mt-2 text-sm leading-relaxed text-muted-foreground">{{ signal.narrative }}</p>
      </div>
    </div>
  </UiCard>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { MarketSignal } from '@/types/var'

const props = defineProps<{ signal: MarketSignal }>()

const normalized = computed(() => Math.min(Math.max(props.signal.score ?? 0, 0), 100))
const radius = 90
const circumference = Math.PI * radius
const dashOffset = computed(() => circumference * (1 - normalized.value / 100))
const pointerAngle = computed(() => (normalized.value / 100) * 180 - 90)
const gradientId = 'market-gauge-gradient'
</script>
