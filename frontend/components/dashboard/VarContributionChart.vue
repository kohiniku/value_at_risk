<template>
  <UiCard
    title="VaR比較：単独資産 vs ポートフォリオ"
  >
    <template #footer>
      分散効果(億円): {{ diversificationGain.toFixed(2) }} ({{ diversificationEffect.toFixed(2) }})
    </template>
    <div class="h-80">
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
import type { Asset } from '@/types/var'

const CATEGORY_ORDER = [
  { key: '株式', label: '株式' },
  { key: '金利', label: '金利' },
  { key: 'クレジット', label: 'クレジット' },
  { key: 'モーゲージ', label: '不動産（モーゲージ）' },
  { key: 'コモディティ', label: 'コモディティ' },
]
const PORTFOLIO_LABEL = 'ポートフォリオVaR'

const props = defineProps<{
  assets: Asset[]
  diversificationEffect: number
  portfolioTotal: number
}>()

const categories = computed(() => [...CATEGORY_ORDER.map((category) => category.label), PORTFOLIO_LABEL])

const assetTotal = computed(() => props.assets.reduce((sum, asset) => sum + asset.amount, 0))

const categoryTotals = computed(() =>
  CATEGORY_ORDER.map((category) => {
    const total = props.assets
      .filter((asset) => asset.category === category.key)
      .reduce((sum, asset) => sum + asset.amount, 0)
    return { ...category, total }
  }),
)

const categoryOffsets = computed(() => {
  let cumulative = 0
  return categoryTotals.value.map((category) => {
    const current = cumulative
    cumulative += category.total
    return Number(current.toFixed(2))
  })
})

const offsetData = computed(() => [...categoryOffsets.value, 0])

const assetSeries = computed(() =>
  props.assets.map((asset) => ({
    name: asset.name,
    data: categories.value.map((label) => {
      if (label === PORTFOLIO_LABEL) {
        return 0
      }
      const category = CATEGORY_ORDER.find((entry) => entry.label === label)
      if (!category || category.key !== asset.category) {
        return 0
      }
      return Number(asset.amount.toFixed(2))
    }),
  })),
)

const series = computed(() => {
  const offsetSeries = {
    name: 'オフセット',
    data: offsetData.value,
    color: 'rgba(0,0,0,0)',
    showInLegend: false,
    dataLabels: { enabled: false },
  }

  const portfolioSeries = {
    name: PORTFOLIO_LABEL,
    data: categories.value.map((category) =>
      category === PORTFOLIO_LABEL ? Number(props.portfolioTotal.toFixed(2)) : 0,
    ),
  }

  return [offsetSeries, ...assetSeries.value, portfolioSeries]
})

const dataLabelSeries = computed(() => Array.from({ length: assetSeries.value.length }, (_, idx) => idx + 1))

const colors = computed(() => {
  const palette = ['#4F8DF7', '#7C8CFF', '#34D399', '#FBBF24', '#F59E0B', '#60A5FA']
  return ['rgba(0,0,0,0)', ...props.assets.map((_, index) => palette[index % palette.length]), '#34D399']
})

const chartOptions = computed<ApexOptions>(() => ({
  chart: {
    type: 'bar',
    stacked: true,
    toolbar: { show: false },
    animations: { easing: 'easeinout' },
    foreColor: '#A0A7C1',
    background: 'transparent',
  },
  plotOptions: {
    bar: {
      horizontal: true,
      barHeight: '60%',
      dataLabels: { position: 'center' },
    },
  },
  grid: {
    borderColor: '#1E2743',
    xaxis: { lines: { show: true } },
    yaxis: { lines: { show: false } },
  },
  xaxis: {
    categories: categories.value,
    labels: {
      formatter: (value: string | number) => Number(value).toFixed(1),
    },
    title: { text: 'VaR（億円）' },
  },
  yaxis: { labels: { style: { colors: '#A0A7C1' } } },
  legend: {
    position: 'bottom',
    horizontalAlign: 'left',
    formatter: (seriesName: string) => (seriesName === 'オフセット' ? '' : seriesName),
  },
  tooltip: {
    shared: true,
    intersect: false,
    y: {
      formatter: (value: number, opts) => {
        const name = opts.series?.[opts.seriesIndex]?.name ?? ''
        if (name === 'オフセット') {
          return ''
        }
        return `${name}: ${value.toFixed(2)}`
      },
    },
  },
  colors: colors.value,
  dataLabels: {
    enabled: true,
    enabledOnSeries: dataLabelSeries.value,
    textAnchor: 'middle',
    offsetX: 0,
    dropShadow: { enabled: true, blur: 3, opacity: 0.35 },
    style: {
      colors: ['#f8fafc'],
      fontSize: '11px',
      fontWeight: 600,
    },
    background: { enabled: false },
    formatter: (val: number, opts) => {
      if (Math.abs(val) < 0.01) {
        return ''
      }
      const name = opts.series?.[opts.seriesIndex]?.name ?? ''
      if (name === 'オフセット') {
        return ''
      }
      const valueLabel = `${val >= 0 ? '+' : ''}${val.toFixed(1)}`
      return `${name}\n${valueLabel}`
    },
  },
}))

const diversificationGain = computed(() => assetTotal.value - props.portfolioTotal)
const diversificationEffect = computed(() => props.diversificationEffect)
</script>
