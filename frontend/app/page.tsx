'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { AppHeader } from '@/components/AppHeader'
import { FiltersBar } from '@/components/dashboard/FiltersBar'
import { NewsPanel } from '@/components/dashboard/NewsPanel'
import { SummaryCards } from '@/components/dashboard/SummaryCards'
import { VarChartCard } from '@/components/dashboard/VarChartCard'
import { VarContributionChart } from '@/components/dashboard/VarContributionChart'
import { AssetDetailsTable } from '@/components/dashboard/AssetDetailsTable'
import { TimeseriesControls } from '@/components/dashboard/TimeseriesControls'
import { ScenarioDistributionChart } from '@/components/dashboard/ScenarioDistributionChart'
import {
  buildMetrics,
  buildSampleScenarioDistribution,
  buildSampleSeries,
  sampleNews,
  sampleSummary,
  sampleDates,
} from '@/lib/sample-data'
import type { NewsItem, SummaryResponse, TimeSeriesResponse } from '@/types/var'
import { AGGREGATE_RIC } from '@/types/var'
import type { ScenarioDistributionResponse } from '@/types/var'

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8000/api/v1'
const NEWS_LIMIT = Number.parseInt(process.env.NEXT_PUBLIC_NEWS_LIMIT ?? '5', 10)
const REFRESH_INTERVAL_MS = Number.parseInt(process.env.NEXT_PUBLIC_REFRESH_INTERVAL_MS ?? '60000', 10)

export default function DashboardPage() {
  const [summary, setSummary] = useState<SummaryResponse>(sampleSummary)
  const [availableDates, setAvailableDates] = useState<string[]>(sampleDates)
  const [selectedDate, setSelectedDate] = useState(sampleSummary.as_of)
  const [selectedRic, setSelectedRic] = useState(AGGREGATE_RIC)
  const [windowDays, setWindowDays] = useState(30)
  const [timeseries, setTimeseries] = useState<TimeSeriesResponse>(
    buildSampleSeries(AGGREGATE_RIC, windowDays),
  )
  const [news, setNews] = useState<NewsItem[]>(sampleNews)
  const [loadingNews, setLoadingNews] = useState(true)
  const [scenarioRic, setScenarioRic] = useState(AGGREGATE_RIC)
  const [scenarioValues, setScenarioValues] = useState<number[]>(
    buildSampleScenarioDistribution().values,
  )

  const fetchSummary = useCallback(async () => {
    const url = new URL(`${API_BASE}/var/summary`)
    if (selectedDate) {
      url.searchParams.set('as_of', selectedDate)
    }
    const response = await fetch(url, { cache: 'no-store' })
    if (!response.ok) {
      throw new Error(`Failed summary request: ${response.status}`)
    }
    return (await response.json()) as SummaryResponse
  }, [selectedDate])

  useEffect(() => {
    let active = true
    const load = async () => {
      try {
        const payload = await fetchSummary()
        if (!active) {
          return
        }
        setSummary(payload)
        setSelectedRic((prev) => {
          if (prev === AGGREGATE_RIC) {
            return prev
          }
          if (payload.assets.some((asset) => asset.ric === prev)) {
            return prev
          }
          return payload.assets[0]?.ric ?? AGGREGATE_RIC
        })
      } catch (error) {
        console.warn('サマリー取得に失敗したためサンプルデータにフォールバックします', error)
      }
    }

    load()
    const intervalId = setInterval(load, REFRESH_INTERVAL_MS)

    return () => {
      active = false
      clearInterval(intervalId)
    }
  }, [fetchSummary])

  useEffect(() => {
    let cancelled = false
    const loadDates = async () => {
      try {
        const response = await fetch(`${API_BASE}/var/dates`, { cache: 'no-store' })
        if (!response.ok) {
          throw new Error(`Failed dates request: ${response.status}`)
        }
        const payload: string[] = await response.json()
        if (!cancelled && payload.length) {
          setAvailableDates(payload)
          setSelectedDate((prev) => (prev && payload.includes(prev) ? prev : payload[0]))
        }
      } catch (error) {
        console.warn('基準日リスト取得に失敗したためフォールバックを使用します', error)
      }
    }

    loadDates()

    return () => {
      cancelled = true
    }
  }, [])

  // ensure selected RIC remains valid when summary updates
  useEffect(() => {
    if (selectedRic === AGGREGATE_RIC) {
      return
    }
    if (!summary.assets.some((asset) => asset.ric === selectedRic) && summary.assets.length) {
      setSelectedRic(summary.assets[0].ric)
    }
  }, [selectedRic, summary.assets])

  const fetchSeries = useCallback(async () => {
    const response = await fetch(
      `${API_BASE}/var/timeseries?ric=${encodeURIComponent(selectedRic)}&days=${windowDays}`,
      { cache: 'no-store' },
    )
    if (!response.ok) {
      throw new Error(`Failed timeseries request: ${response.status}`)
    }
    return (await response.json()) as TimeSeriesResponse
  }, [selectedRic, windowDays])

  useEffect(() => {
    let active = true
    const load = async () => {
      try {
        const payload = await fetchSeries()
        if (active) {
          setTimeseries(payload)
        }
      } catch (error) {
        console.warn('時系列取得に失敗したためサンプルデータにフォールバックします', error)
        if (active) {
          setTimeseries(buildSampleSeries(selectedRic, windowDays))
        }
      }
    }

    load()
    const intervalId = setInterval(load, REFRESH_INTERVAL_MS)

    return () => {
      active = false
      clearInterval(intervalId)
    }
  }, [fetchSeries, selectedRic, windowDays])

  // fetch news once
  useEffect(() => {
    let cancelled = false
    const fetchNews = async () => {
      try {
        const response = await fetch(
          `${API_BASE}/news?limit=${Number.isNaN(NEWS_LIMIT) ? 5 : NEWS_LIMIT}`,
          { cache: 'no-store' },
        )
        if (!response.ok) {
          throw new Error(`Failed news request: ${response.status}`)
        }
        const payload: NewsItem[] = await response.json()
        if (!cancelled) {
          setNews(payload)
        }
      } catch (error) {
        console.warn('Using fallback news data', error)
        if (!cancelled) {
          setNews(sampleNews)
        }
      } finally {
        if (!cancelled) {
          setLoadingNews(false)
        }
      }
    }

    fetchNews()

    return () => {
      cancelled = true
    }
  }, [])

  const metrics = useMemo(() => buildMetrics(summary), [summary])
  const commonAssetOptions = useMemo(
    () => [
      { value: AGGREGATE_RIC, label: '全資産合算' },
      ...summary.assets.map((asset) => ({ value: asset.ric, label: asset.name })),
    ],
    [summary.assets],
  )
  const scenarioOptions = commonAssetOptions

  const handleDateChange = useCallback((date: string) => {
    setSelectedDate(date)
  }, [])

  const handleAssetChange = useCallback((asset: string) => {
    setSelectedRic(asset)
  }, [])

  const handleWindowChange = useCallback((window: number) => {
    setWindowDays(window)
  }, [])

  const fetchScenarioDistribution = useCallback(async () => {
    const response = await fetch(
      `${API_BASE}/var/scenario-distribution?ric=${encodeURIComponent(scenarioRic)}`,
      { cache: 'no-store' },
    )
    if (!response.ok) {
      throw new Error(`Failed scenario distribution request: ${response.status}`)
    }
    return (await response.json()) as ScenarioDistributionResponse
  }, [scenarioRic])

  useEffect(() => {
    if (scenarioRic !== AGGREGATE_RIC && !summary.assets.some((asset) => asset.ric === scenarioRic)) {
      setScenarioRic(summary.assets[0]?.ric ?? AGGREGATE_RIC)
    }
  }, [scenarioRic, summary.assets])

  useEffect(() => {
    let active = true
    const load = async () => {
      try {
        const payload = await fetchScenarioDistribution()
        if (active) {
          setScenarioValues(payload.values)
        }
      } catch (error) {
        console.warn('シナリオ分布取得に失敗したためサンプルデータを利用します', error)
        if (active) {
          setScenarioValues(buildSampleScenarioDistribution(scenarioRic).values)
        }
      }
    }

    load()
    const intervalId = setInterval(load, REFRESH_INTERVAL_MS)
    return () => {
      active = false
      clearInterval(intervalId)
    }
  }, [fetchScenarioDistribution, scenarioRic])

  return (
    <div className="min-h-screen bg-background text-foreground">
      <AppHeader />
      <main className="mx-auto max-w-6xl px-6 py-8 space-y-8">
        <FiltersBar dates={availableDates} selectedDate={selectedDate} onDateChange={handleDateChange} />

        <SummaryCards metrics={metrics} />

        <VarContributionChart
          assets={summary.assets}
          diversificationEffect={summary.portfolio.diversification_effect}
          portfolioTotal={summary.portfolio.total}
        />

        <AssetDetailsTable assets={summary.assets} portfolio={summary.portfolio} />

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <TimeseriesControls
              options={commonAssetOptions}
              selectedRic={selectedRic}
              windowDays={windowDays}
              onAssetChange={handleAssetChange}
              onWindowChange={handleWindowChange}
            />
            <VarChartCard points={timeseries.points} key={selectedRic} />
          </div>
          <div className="space-y-6">
            <NewsPanel items={news} loading={loadingNews} />
          </div>
        </div>

        <ScenarioDistributionChart
          values={scenarioValues}
          selectedRic={scenarioRic}
          onRicChange={(ric) => setScenarioRic(ric)}
          options={scenarioOptions}
        />
      </main>
    </div>
  )
}
