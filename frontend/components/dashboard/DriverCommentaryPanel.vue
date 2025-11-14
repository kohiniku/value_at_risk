<template>
  <UiCard title="要因分析">
    <template #footer>
      対象基準日: {{ commentary.as_of }}
    </template>
    <div class="space-y-5 text-sm leading-relaxed">
      <section>
        <h3 class="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">＜ニュース要因＞</h3>
        <p class="mt-2 text-foreground">{{ commentary.news_summary }}</p>
      </section>
      <section class="space-y-3">
        <div>
          <h3 class="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">＜テクニカル要因＞</h3>
          <p class="mt-2 text-foreground">{{ commentary.technical_summary }}</p>
        </div>
        <div class="grid gap-3 sm:grid-cols-4">
          <div
            v-for="meta in DRIVER_META"
            :key="meta.key"
            class="rounded-lg border border-border bg-muted/40 px-3 py-2 text-foreground shadow-inner"
          >
            <p class="text-xs font-semibold text-muted-foreground">{{ meta.label }}</p>
            <div class="mt-1 flex items-center justify-between">
              <span class="text-lg font-semibold" :class="meta.accent">
                {{ formatContribution(meta.key) }}
              </span>
            </div>
          </div>
        </div>
      </section>
    </div>
  </UiCard>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { DriverCommentary, DriverContributions } from '@/types/var'

type DriverKey = keyof DriverContributions

const DRIVER_META: Array<{ key: DriverKey; label: string; accent: string }> = [
  { key: 'window_drop', label: '離脱要因', accent: 'text-rose-400' },
  { key: 'window_add', label: '追加要因', accent: 'text-sky-300' },
  { key: 'position_change', label: 'ポジション調整', accent: 'text-emerald-300' },
  { key: 'ranking_shift', label: '順位変動', accent: 'text-amber-300' },
]

const EMPTY_TOTALS: DriverContributions = {
  window_drop: 0,
  window_add: 0,
  position_change: 0,
  ranking_shift: 0,
}

const props = defineProps<{ commentary: DriverCommentary }>()

const driverTotals = computed(() => props.commentary.driver_totals ?? EMPTY_TOTALS)

const formatContribution = (key: DriverKey) => {
  const value = driverTotals.value[key] ?? 0
  return `${value >= 0 ? '+' : ''}${value.toFixed(2)}`
}
</script>
