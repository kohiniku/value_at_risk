<template>
  <UiCard title="VaR推移">
    <div class="h-72">
      <ClientOnly>
        <apexchart type="line" height="100%" :options="chartOptions" :series="series" />
        <template #fallback>
          <div class="flex h-full items-center justify-center text-sm text-muted-foreground">チャートを読み込み中...</div>
        </template>
      </ClientOnly>
    </div>
  </UiCard>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { ApexOptions } from 'apexcharts'
import type { TimeSeriesPoint } from '@/types/var'

const props = defineProps<{ points: TimeSeriesPoint[] }>()

const series = computed(() => [
  {
    name: 'VaR',
    data: props.points.map((point) => ({ x: point.date, y: point.value })),
  },
])

const chartOptions: ApexOptions = {
  chart: {
    id: 'var-trend',
    toolbar: { show: false },
    animations: { easing: 'easeinout' },
    foreColor: '#A0A7C1',
    background: 'transparent',
  },
  stroke: {
    width: 3,
  },
  grid: {
    borderColor: '#1E2743',
    strokeDashArray: 6,
  },
  xaxis: {
    type: 'datetime',
    labels: {
      style: { colors: '#A0A7C1' },
    },
  },
  yaxis: {
    labels: {
      formatter: (value: number) => value.toFixed(1),
    },
    title: { text: 'VaR（億円）' },
  },
  tooltip: {
    theme: 'dark',
    y: {
      formatter: (value?: number) => (typeof value === 'number' ? value.toFixed(2) : ''),
    },
  },
  markers: {
    size: 5,
  },
}
</script>
