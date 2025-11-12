'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { AppHeader } from '@/components/AppHeader'
import { NewsPanel } from '@/components/dashboard/NewsPanel'
import { SummaryCards } from '@/components/dashboard/SummaryCards'
import { VarChartCard } from '@/components/dashboard/VarChartCard'
import { VarContributionChart } from '@/components/dashboard/VarContributionChart'
import { AssetDetailsTable } from '@/components/dashboard/AssetDetailsTable'
import { TimeseriesControls } from '@/components/dashboard/TimeseriesControls'
import { ScenarioDistributionChart } from '@/components/dashboard/ScenarioDistributionChart'
import { buildMetrics } from '@/lib/metrics'
import type { NewsItem, SummaryResponse, TimeSeriesResponse } from '@/types/var'
import { AGGREGATE_RIC } from '@/types/var'
import type { ScenarioDistributionResponse } from '@/types/var'
import { usePdfExport } from '@/hooks/usePdfExport'

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? '/api/v1'
const NEWS_LIMIT = Number.parseInt(process.env.NEXT_PUBLIC_NEWS_LIMIT ?? '5', 10)
const REFRESH_INTERVAL_MS = Number.parseInt(process.env.NEXT_PUBLIC_REFRESH_INTERVAL_MS ?? '60000', 10)

export default function DashboardPage() {
  const [summary, setSummary] = useState<SummaryResponse | null>(null)
  const [summaryError, setSummaryError] = useState<string | null>(null)
  const [availableDates, setAvailableDates] = useState<string[]>([])
  const [selectedDate, setSelectedDate] = useState('')
  const [selectedRic, setSelectedRic] = useState(AGGREGATE_RIC)
  const [windowDays, setWindowDays] = useState(30)
  const [timeseries, setTimeseries] = useState<TimeSeriesResponse | null>(null)
  const [timeseriesError, setTimeseriesError] = useState<string | null>(null)
  const [news, setNews] = useState<NewsItem[]>([])
  const [loadingNews, setLoadingNews] = useState(true)
  const [scenarioRic, setScenarioRic] = useState(AGGREGATE_RIC)
  const [scenarioValues, setScenarioValues] = useState<number[]>([])
  const [scenarioError, setScenarioError] = useState<string | null>(null)
  const [pdfError, setPdfError] = useState<string | null>(null)
  const [isExporting, setIsExporting] = useState(false)
  const dashboardRef = useRef<HTMLDivElement>(null)
  const exportPdf = usePdfExport()

  const fetchSummary = useCallback(async () => {
    const search = selectedDate ? `?as_of=${encodeURIComponent(selectedDate)}` : ''
    const response = await fetch(`${API_BASE}/var/summary${search}`, { cache: 'no-store' })
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
        setSummaryError(null)
        if (!selectedDate) {
          setSelectedDate(payload.as_of)
        }
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
        console.error('サマリー取得に失敗しました', error)
        if (active) {
          setSummaryError('サマリーデータの取得に失敗しました')
          setSummary(null)
        }
      }
    }

    load()
    const intervalId = setInterval(load, REFRESH_INTERVAL_MS)

    return () => {
      active = false
      clearInterval(intervalId)
    }
  }, [fetchSummary, selectedDate])

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
        console.error('基準日リスト取得に失敗しました', error)
      }
    }

    loadDates()

    return () => {
      cancelled = true
    }
  }, [])

  // ensure selected RIC remains valid when summary updates
  useEffect(() => {
    if (!summary || selectedRic === AGGREGATE_RIC) {
      return
    }
    if (!summary.assets.some((asset) => asset.ric === selectedRic) && summary.assets.length) {
      setSelectedRic(summary.assets[0].ric)
    }
  }, [selectedRic, summary])

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
          setTimeseriesError(null)
        }
      } catch (error) {
        if (active) {
          console.error('時系列取得に失敗しました', error)
          setTimeseries(null)
          setTimeseriesError('時系列データの取得に失敗しました')
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
        if (!cancelled) {
          console.error('ニュース取得に失敗しました', error)
          setNews([])
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

  const metrics = useMemo(() => (summary ? buildMetrics(summary) : []), [summary])
  const commonAssetOptions = useMemo(() => {
    const base = [{ value: AGGREGATE_RIC, label: '全資産合算' }]
    if (!summary) {
      return base
    }
    return [...base, ...summary.assets.map((asset) => ({ value: asset.ric, label: asset.name }))]
  }, [summary])
  const scenarioOptions = commonAssetOptions
  const handleExportPdf = useCallback(async () => {
    if (!summary) {
      return
    }
    if (!dashboardRef.current) {
      setPdfError('出力対象が見つかりませんでした')
      return
    }
    setPdfError(null)
    setIsExporting(true)
    try {
      await exportPdf(dashboardRef.current, `var-dashboard-${summary.as_of}.pdf`)
    } catch (error) {
      console.error('PDF出力に失敗しました', error)
      setPdfError('PDFの生成に失敗しました。時間をおいて再試行してください。')
    } finally {
      setIsExporting(false)
    }
  }, [exportPdf, summary])

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
    if (!summary) {
      return
    }
    if (scenarioRic !== AGGREGATE_RIC && !summary.assets.some((asset) => asset.ric === scenarioRic)) {
      setScenarioRic(summary.assets[0]?.ric ?? AGGREGATE_RIC)
    }
  }, [scenarioRic, summary])

  useEffect(() => {
    let active = true
    const load = async () => {
      try {
        const payload = await fetchScenarioDistribution()
        if (active) {
          setScenarioValues(payload.values)
          setScenarioError(null)
        }
      } catch (error) {
        if (active) {
          console.error('シナリオ分布取得に失敗しました', error)
          setScenarioValues([])
          setScenarioError('シナリオPL分布の取得に失敗しました')
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

  if (!summary) {
    return (
      <div ref={dashboardRef} className="min-h-screen bg-background text-foreground">
        <AppHeader
          dates={availableDates}
          selectedDate={selectedDate || summary?.as_of || ''}
          onDateChange={handleDateChange}
        />
        <main className="mx-auto max-w-6xl px-6 py-8 space-y-4">
          <p className="text-sm text-muted-foreground">データを取得しています...</p>
          {summaryError && <p className="text-sm text-rose-400">{summaryError}</p>}
        </main>
      </div>
    )
  }

  return (
    <div ref={dashboardRef} className="min-h-screen bg-background text-foreground">
      <AppHeader
        dates={availableDates}
        selectedDate={selectedDate || summary.as_of}
        onDateChange={handleDateChange}
        onExportPdf={handleExportPdf}
        exporting={isExporting}
      />
      <main className="mx-auto max-w-6xl px-6 py-8 space-y-8">
        {pdfError && <p className="text-sm text-rose-400">{pdfError}</p>}
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
            <VarChartCard points={timeseries?.points ?? []} key={selectedRic} />
            {timeseriesError && <p className="text-xs text-rose-400">{timeseriesError}</p>}
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
        {scenarioError && <p className="text-xs text-rose-400">{scenarioError}</p>}
      </main>
    </div>
  )
}
