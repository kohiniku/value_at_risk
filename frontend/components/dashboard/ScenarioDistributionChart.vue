<template>
  <UiCard title="シナリオPL分布 (直近800日)">
    <template #actions>
      <div class="min-w-[200px]">
        <UiSelect
          label="対象資産"
          :model-value="selectedRic"
          @update:model-value="(value) => emit('ric-change', value)"
        >
          <option v-for="option in options" :key="option.value" :value="option.value">
            {{ option.label }}
          </option>
        </UiSelect>
      </div>
    </template>
    <template #footer>
      シナリオ件数: {{ values.length }}件 / {{ scenarioWindow }}件
    </template>
    <div class="h-96">
      <ClientOnly>
        <apexchart type="bar" height="100%" :options="chartOptions" :series="series" />
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
import { SCENARIO_WINDOW } from '@/types/var'

const BUCKET_COUNT = 24

const props = defineProps<{
  values: number[]
  selectedRic: string
  options: { value: string; label: string }[]
}>()

const emit = defineEmits<{ (e: 'ric-change', value: string): void }>()

const histogram = computed(() => {
  if (!props.values.length) {
    return { categories: [], frequencies: [] as number[] }
  }
  const min = Math.min(...props.values)
  const max = Math.max(...props.values)
  const safeRange = max - min || 1
  const bucketSize = safeRange / BUCKET_COUNT
  const counts = Array.from({ length: BUCKET_COUNT }, () => 0)

  props.values.forEach((value) => {
    const index = Math.min(BUCKET_COUNT - 1, Math.floor((value - min) / bucketSize))
    counts[index] += 1
  })

  const labels = counts.map((_, idx) => {
    const start = min + bucketSize * idx
    const end = start + bucketSize
    return `${start.toFixed(2)} ~ ${end.toFixed(2)}`
  })

  return { categories: labels, frequencies: counts }
})

const series = computed(() => [
  {
    name: '頻度',
    data: histogram.value.frequencies,
  },
])

const chartOptions = computed<ApexOptions>(() => ({
  chart: {
    type: 'bar',
    background: 'transparent',
    foreColor: '#A0A7C1',
    toolbar: { show: false },
  },
  plotOptions: {
    bar: {
      columnWidth: '80%',
      borderRadius: 3,
    },
  },
  xaxis: {
    categories: histogram.value.categories,
    labels: { rotate: -45, hideOverlappingLabels: true },
    title: { text: 'シナリオPLレンジ (億円)' },
  },
  yaxis: {
    title: { text: '出現回数' },
  },
  grid: { borderColor: '#1E2743' },
  tooltip: {
    shared: false,
    y: { formatter: (val: number) => `${val}件` },
  },
  colors: ['#FBBF24'],
}))

const scenarioWindow = SCENARIO_WINDOW
</script>
