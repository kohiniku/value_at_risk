<template>
  <div class="min-h-screen bg-background text-foreground">
    <DashboardNavigation :sections="dashboardSections" @navigate="handleSectionNavigate" />
    <div class="lg:pl-80">
      <AppHeader :tabs="tabOptions" :active-tab="activeTab" @tab-change="handleTabChange" />
      <main class="mx-auto w-full max-w-[108rem] space-y-8 px-6 py-8">
        <DashboardMobileNav :sections="dashboardSections" @navigate="handleSectionNavigate" />

        <div v-if="!summary" class="space-y-4">
          <p class="text-sm text-muted-foreground">データを取得しています...</p>
          <p v-if="summaryError" class="text-sm text-rose-400">{{ summaryError }}</p>
        </div>

        <div v-else class="space-y-8" v-show="activeTab === 'dashboard'" aria-hidden="activeTab !== 'dashboard'">
          <section id="filters" class="scroll-mt-36">
            <FiltersBar :dates="availableDates" :selected-date="selectedDate" @date-change="handleDateChange" />
          </section>

          <section id="summary" class="scroll-mt-36">
            <SummaryCards :metrics="metrics" />
          </section>

          <section id="var-comparison" class="scroll-mt-36">
            <VarContributionChart
              :assets="summary.assets"
              :diversification-effect="summary.portfolio.diversification_effect"
              :portfolio-total="summary.portfolio.total"
            />
          </section>

          <section id="asset-table" class="scroll-mt-36">
            <AssetDetailsTable :assets="summary.assets" :portfolio="summary.portfolio" />
          </section>

          <section id="market-insights" class="scroll-mt-36">
            <div class="grid gap-6 lg:grid-cols-3">
              <div class="lg:col-span-1">
                <MarketSignalGauge :signal="summary.market_signal" />
              </div>
              <div class="lg:col-span-2">
                <DriverCommentaryPanel :commentary="summary.driver_commentary" />
              </div>
            </div>
          </section>

          <section class="grid gap-6 lg:grid-cols-3" aria-label="時系列とニュース">
            <div id="timeseries" class="space-y-6 scroll-mt-36 lg:col-span-2">
              <TimeseriesControls
                :options="commonAssetOptions"
                :selected-ric="selectedRic"
                :window-days="windowDays"
                @asset-change="(value) => (selectedRic = value)"
                @window-change="(value) => (windowDays = value)"
              />
              <VarChartCard :key="selectedRic" :points="timeseries?.points ?? []" />
              <p v-if="timeseriesError" class="text-xs text-rose-400">{{ timeseriesError }}</p>
            </div>
            <div id="news" class="space-y-6 scroll-mt-36">
              <NewsPanel :items="news" :loading="loadingNews" />
            </div>
          </section>

          <section id="scenario" class="scroll-mt-36">
            <ScenarioDistributionChart
              :values="scenarioValues"
              :selected-ric="scenarioRic"
              :options="scenarioOptions"
              @ric-change="(value) => (scenarioRic = value)"
            />
            <p v-if="scenarioError" class="mt-1 text-xs text-rose-400">{{ scenarioError }}</p>
          </section>
        </div>

        <section v-show="activeTab === 'assistant'" aria-hidden="activeTab !== 'assistant'" class="space-y-6">
          <UiCard title="会話型AIアシスタント" class="overflow-hidden">
            <p class="mb-4 text-sm text-muted-foreground">
              リスク管理に関する問いかけや解釈支援を行えるAIアシスタントです。知りたい情報を具体的に教えてください。
              <br />
              （例）「25年7月の日経225のシナリオPL推移を見せて。」
            </p>
            <iframe
              title="Dify chatbot preview"
              class="h-[900px] w-full rounded-lg border border-border"
              src="http://100.66.149.33/chatbot/Lnbqwwqts4OuPA7g"
            />
          </UiCard>
        </section>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import AppHeader from '@/components/AppHeader.vue'
import DashboardNavigation from '@/components/dashboard/DashboardNavigation.vue'
import DashboardMobileNav from '@/components/dashboard/DashboardMobileNav.vue'
import FiltersBar from '@/components/dashboard/FiltersBar.vue'
import SummaryCards from '@/components/dashboard/SummaryCards.vue'
import VarContributionChart from '@/components/dashboard/VarContributionChart.vue'
import AssetDetailsTable from '@/components/dashboard/AssetDetailsTable.vue'
import MarketSignalGauge from '@/components/dashboard/MarketSignalGauge.vue'
import DriverCommentaryPanel from '@/components/dashboard/DriverCommentaryPanel.vue'
import TimeseriesControls from '@/components/dashboard/TimeseriesControls.vue'
import VarChartCard from '@/components/dashboard/VarChartCard.vue'
import NewsPanel from '@/components/dashboard/NewsPanel.vue'
import ScenarioDistributionChart from '@/components/dashboard/ScenarioDistributionChart.vue'
import UiCard from '@/components/ui/Card.vue'
import { buildMetrics } from '@/lib/metrics'
import type {
  NewsItem,
  ScenarioDistributionResponse,
  SummaryResponse,
  TimeSeriesResponse,
} from '@/types/var'
import { AGGREGATE_RIC } from '@/types/var'

type TabKey = 'dashboard' | 'assistant'

type Section = { id: string; label: string; description?: string }

const runtimeConfig = useRuntimeConfig()
const API_BASE = runtimeConfig.public.apiBaseUrl ?? '/api/v1'
const NEWS_LIMIT = Number.isFinite(runtimeConfig.public.newsLimit)
  ? runtimeConfig.public.newsLimit
  : 5
const REFRESH_INTERVAL_MS = runtimeConfig.public.refreshIntervalMs ?? 60000

const summary = ref<SummaryResponse | null>(null)
const summaryError = ref<string | null>(null)
const availableDates = ref<string[]>([])
const selectedDate = ref('')
const selectedRic = ref(AGGREGATE_RIC)
const windowDays = ref(30)
const timeseries = ref<TimeSeriesResponse | null>(null)
const timeseriesError = ref<string | null>(null)
const news = ref<NewsItem[]>([])
const loadingNews = ref(true)
const scenarioRic = ref(AGGREGATE_RIC)
const scenarioValues = ref<number[]>([])
const scenarioError = ref<string | null>(null)
const activeTab = ref<TabKey>('dashboard')
const pendingSection = ref<string | null>(null)

const summaryInterval = ref<number | null>(null)
const timeseriesInterval = ref<number | null>(null)
const scenarioInterval = ref<number | null>(null)
const isProgrammaticDateChange = ref(false)

const dashboardSections: Section[] = [
  { id: 'filters', label: '基準日', description: '全ビュー更新' },
  { id: 'summary', label: '指標カード', description: 'VaR総額など' },
  { id: 'var-comparison', label: 'VaR比較', description: 'ポートフォリオ vs 資産別' },
  { id: 'asset-table', label: '資産別テーブル', description: '分類別詳細' },
  { id: 'market-insights', label: '市場シグナル', description: 'ゲージと解説' },
  { id: 'timeseries', label: '時系列チャート', description: '資産別推移' },
  { id: 'news', label: 'ニュース', description: '最新ヘッドライン' },
  { id: 'scenario', label: 'シナリオ分布', description: '800日ヒストグラム' },
]

const tabOptions = [
  { key: 'dashboard', label: 'ダッシュボード' },
  { key: 'assistant', label: 'AIアシスタント' },
]

const metrics = computed(() => (summary.value ? buildMetrics(summary.value) : []))
const commonAssetOptions = computed(() => {
  const base = [{ value: AGGREGATE_RIC, label: '全資産合算' }]
  if (!summary.value) {
    return base
  }
  return [...base, ...summary.value.assets.map((asset) => ({ value: asset.ric, label: asset.name }))]
})
const scenarioOptions = computed(() => commonAssetOptions.value)

const fetchSummary = async () => {
  const search = selectedDate.value ? `?as_of=${encodeURIComponent(selectedDate.value)}` : ''
  return await $fetch<SummaryResponse>(`${API_BASE}/var/summary${search}`, { cache: 'no-store' })
}

const loadSummary = async () => {
  try {
    const payload = await fetchSummary()
    summary.value = payload
    summaryError.value = null
    if (!selectedDate.value) {
      setSelectedDateSilently(payload.as_of)
    }
    if (
      selectedRic.value !== AGGREGATE_RIC &&
      !payload.assets.some((asset) => asset.ric === selectedRic.value)
    ) {
      selectedRic.value = payload.assets[0]?.ric ?? AGGREGATE_RIC
    }
    if (
      scenarioRic.value !== AGGREGATE_RIC &&
      !payload.assets.some((asset) => asset.ric === scenarioRic.value)
    ) {
      scenarioRic.value = payload.assets[0]?.ric ?? AGGREGATE_RIC
    }
  } catch (error) {
    console.error('サマリー取得に失敗しました', error)
    summary.value = null
    summaryError.value = 'サマリーデータの取得に失敗しました'
  }
}

const loadDates = async () => {
  try {
    const payload = await $fetch<string[]>(`${API_BASE}/var/dates`, { cache: 'no-store' })
    if (payload.length) {
      availableDates.value = payload
      if (!payload.includes(selectedDate.value)) {
        setSelectedDateSilently(payload[0])
      }
    }
  } catch (error) {
    console.error('基準日リスト取得に失敗しました', error)
  }
}

const loadTimeseries = async () => {
  if (!selectedRic.value) return
  try {
    const payload = await $fetch<TimeSeriesResponse>(
      `${API_BASE}/var/timeseries?ric=${encodeURIComponent(selectedRic.value)}&days=${windowDays.value}`,
      { cache: 'no-store' },
    )
    timeseries.value = payload
    timeseriesError.value = null
  } catch (error) {
    console.error('時系列取得に失敗しました', error)
    timeseries.value = null
    timeseriesError.value = '時系列データの取得に失敗しました'
  }
}

const loadNews = async () => {
  loadingNews.value = true
  try {
    const payload = await $fetch<NewsItem[]>(
      `${API_BASE}/news?limit=${Number.isNaN(NEWS_LIMIT) ? 5 : NEWS_LIMIT}`,
      { cache: 'no-store' },
    )
    news.value = payload
  } catch (error) {
    console.error('ニュース取得に失敗しました', error)
    news.value = []
  } finally {
    loadingNews.value = false
  }
}

const loadScenario = async () => {
  try {
    const payload = await $fetch<ScenarioDistributionResponse>(
      `${API_BASE}/var/scenario-distribution?ric=${encodeURIComponent(scenarioRic.value)}`,
      { cache: 'no-store' },
    )
    scenarioValues.value = payload.values
    scenarioError.value = null
  } catch (error) {
    console.error('シナリオ分布取得に失敗しました', error)
    scenarioValues.value = []
    scenarioError.value = 'シナリオPL分布の取得に失敗しました'
  }
}

const setSelectedDateSilently = (value?: string) => {
  if (!value || selectedDate.value === value) {
    return
  }
  isProgrammaticDateChange.value = true
  selectedDate.value = value
}

if (process.client) {
  watch(selectedDate, (newValue, oldValue) => {
    if (isProgrammaticDateChange.value) {
      isProgrammaticDateChange.value = false
      return
    }
    if (!newValue || newValue === oldValue) {
      return
    }
    loadSummary()
  })

  watch(
    [selectedRic, windowDays],
    () => {
      loadTimeseries()
    },
    { immediate: true },
  )

  watch(
    scenarioRic,
    () => {
      loadScenario()
    },
    { immediate: true },
  )
}

watch([pendingSection, activeTab], async () => {
  if (!process.client) {
    return
  }
  if (!pendingSection.value || activeTab.value !== 'dashboard') {
    return
  }
  await nextTick()
  const target = document.getElementById(pendingSection.value)
  if (target) {
    target.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }
  pendingSection.value = null
})

const handleTabChange = (key: string) => {
  activeTab.value = key as TabKey
}

const handleSectionNavigate = (sectionId: string) => {
  pendingSection.value = sectionId
  activeTab.value = 'dashboard'
}

const handleDateChange = (date: string) => {
  selectedDate.value = date
}

onMounted(() => {
  if (!process.client) {
    return
  }
  loadDates()
  loadSummary()
  loadNews()
  summaryInterval.value = window.setInterval(loadSummary, REFRESH_INTERVAL_MS)
  timeseriesInterval.value = window.setInterval(loadTimeseries, REFRESH_INTERVAL_MS)
  scenarioInterval.value = window.setInterval(loadScenario, REFRESH_INTERVAL_MS)
})

onBeforeUnmount(() => {
  if (summaryInterval.value) {
    clearInterval(summaryInterval.value)
  }
  if (timeseriesInterval.value) {
    clearInterval(timeseriesInterval.value)
  }
  if (scenarioInterval.value) {
    clearInterval(scenarioInterval.value)
  }
})
</script>
