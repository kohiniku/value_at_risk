export interface DriverContributions {
  window_drop: number
  window_add: number
  position_change: number
  ranking_shift: number
}

export interface Asset {
  ric: string
  name: string
  category: string
  amount: number
  change_amount: number
  change_pct: number
  contributions: DriverContributions
}

export interface Portfolio {
  total: number
  change_amount: number
  change_pct: number
  diversification_effect: number
}

export interface SummaryResponse {
  as_of: string
  portfolio: Portfolio
  assets: Asset[]
}

export interface TimeSeriesPoint {
  date: string
  value: number
  change?: number | null
}

export interface TimeSeriesResponse {
  ric: string
  points: TimeSeriesPoint[]
}

export interface NewsItem {
  id: string
  headline: string
  published_at: string
  source: string
  summary?: string
}

export interface ScenarioDistributionResponse {
  ric: string
  values: number[]
}

export const AGGREGATE_RIC = 'ALL_ASSETS'
export const SCENARIO_WINDOW = 800
