import type { Asset, NewsItem, ScenarioDistributionResponse, SummaryResponse, TimeSeriesResponse } from '@/types/var'
import { AGGREGATE_RIC, SCENARIO_WINDOW } from '@/types/var'

const sampleDateList = Array.from({ length: 4 }, (_, idx) =>
  new Date(Date.now() - idx * 86400000).toISOString(),
)

export const sampleSummary: SummaryResponse = {
  as_of: sampleDateList[0],
  portfolio: {
    total: 21.8,
    change_amount: 0.7,
    change_pct: 3.3,
    diversification_effect: -5.5,
  },
  assets: [
    {
      ric: 'JP_EQ_LARGE',
      name: '日本株式（大型）',
      category: '株式',
      amount: 11.2,
      change_amount: 0.5,
      change_pct: 4.7,
      contributions: {
        window_drop: -0.08,
        window_add: 0.06,
        position_change: 0.25,
        ranking_shift: 0.27,
      },
    },
    {
      ric: 'US_EQ_TECH',
      name: '米国株式（テック）',
      category: '株式',
      amount: 9.5,
      change_amount: -0.2,
      change_pct: -2.1,
      contributions: {
        window_drop: -0.07,
        window_add: -0.02,
        position_change: -0.07,
        ranking_shift: -0.04,
      },
    },
    {
      ric: 'US_RATES_CORE',
      name: '米国金利（10Y）',
      category: '金利',
      amount: 8.4,
      change_amount: 0.3,
      change_pct: 3.6,
      contributions: {
        window_drop: 0.05,
        window_add: 0.08,
        position_change: 0.1,
        ranking_shift: 0.07,
      },
    },
    {
      ric: 'EU_RATES_CORE',
      name: '欧州金利',
      category: '金利',
      amount: 6.6,
      change_amount: -0.1,
      change_pct: -1.4,
      contributions: {
        window_drop: -0.03,
        window_add: -0.02,
        position_change: -0.03,
        ranking_shift: -0.02,
      },
    },
    {
      ric: 'IG_CREDIT_US',
      name: '米国IGクレジット',
      category: 'クレジット',
      amount: 6.0,
      change_amount: 0.2,
      change_pct: 3.2,
      contributions: {
        window_drop: 0.05,
        window_add: 0.02,
        position_change: 0.08,
        ranking_shift: 0.05,
      },
    },
    {
      ric: 'MBS_AGENCY',
      name: 'エージェンシーMBS',
      category: 'モーゲージ',
      amount: 6.3,
      change_amount: 0.1,
      change_pct: 1.9,
      contributions: {
        window_drop: -0.02,
        window_add: 0.01,
        position_change: 0.07,
        ranking_shift: 0.04,
      },
    },
  ],
}

const sampleSeriesBase: Record<string, number> = {
  JP_EQ_LARGE: 11.2,
  US_EQ_TECH: 9.5,
  US_RATES_CORE: 8.4,
  EU_RATES_CORE: 6.6,
  IG_CREDIT_US: 6.0,
  MBS_AGENCY: 6.3,
}

export const buildSampleSeries = (ric: string, days: number): TimeSeriesResponse => {
  const today = new Date()
  const base = sampleSeriesBase[ric] ?? 8
  const points = Array.from({ length: days }, (_, idx) => {
    const value = base + Math.sin(idx / 3) * 0.9
    return {
      date: new Date(today.getTime() - (days - idx - 1) * 86400000).toISOString(),
      value: Number.parseFloat(value.toFixed(2)),
      change: idx === 0 ? null : Number.parseFloat((Math.sin(idx / 3) * 0.25).toFixed(2)),
    }
  })
  return { ric, points }
}

export const sampleDates: string[] = sampleDateList

export const sampleNews: NewsItem[] = [
  {
    id: 'fallback-1',
    headline: '日銀、長期金利の許容レンジ拡大を示唆',
    published_at: new Date().toISOString(),
    source: '日本経済新聞',
    summary: '長期ゾーンのJGB利回りが上昇し、銀行や保険のポジション調整が波及。',
  },
  {
    id: 'fallback-2',
    headline: '米CPI鈍化で長期債が続伸、ヘッジ需要も増加',
    published_at: new Date().toISOString(),
    source: 'Bloomberg',
    summary: 'コアCPIが予想を下回り、デュレーション・ヘッジに再び資金が向かう。',
  },
]

export interface MetricSummary {
  label: string
  value: number
  delta: number
  change: number
}

export const buildMetrics = (summary: SummaryResponse): MetricSummary[] => {
  const primaryAsset: Asset | undefined = summary.assets[0]
  return [
    {
      label: 'ポートフォリオVaR',
      value: summary.portfolio.total,
      delta: summary.portfolio.change_amount,
      change: summary.portfolio.change_pct,
    },
    {
      label: '最大寄与資産',
      value: primaryAsset?.amount ?? 0,
      delta: primaryAsset?.change_amount ?? 0,
      change: primaryAsset?.change_pct ?? 0,
    },
    {
      label: '分散効果',
      value: summary.portfolio.diversification_effect,
      delta: summary.portfolio.diversification_effect,
      change: summary.portfolio.change_pct,
    },
  ]
}

export const buildSampleScenarioDistribution = (
  ric: string = AGGREGATE_RIC,
  length = SCENARIO_WINDOW,
): ScenarioDistributionResponse => {
  const sigma = 0.65 + ((ric.length % 4) * 0.05)
  const mu = -2.3 - (ric.length % 3) * 0.05

  const values = Array.from({ length }, (_, idx) => {
    const u1 = (Math.sin(idx * 12.9898 + ric.length) + 1) / 2
    const u2 = (Math.sin((idx + 0.5) * 78.233 + ric.length) + 1) / 2
    const safeU1 = Math.max(u1, 1e-6)
    const radius = Math.sqrt(-2 * Math.log(safeU1))
    const theta = 2 * Math.PI * u2
    const normal = radius * Math.cos(theta)
    return Number.parseFloat((mu + normal * sigma).toFixed(3))
  })

  return { ric, values }
}
