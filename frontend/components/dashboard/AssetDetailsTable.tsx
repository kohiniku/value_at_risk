import clsx from 'clsx'
import type { Asset, Portfolio } from '@/types/var'
import { Card } from '@/components/ui/card'

interface AssetDetailsTableProps {
  assets: Asset[]
  portfolio: Portfolio
}

const contributionColumns: {
  key: keyof Asset['contributions']
  label: string
  headerClass: string
  cellClass: string
}[] = [
  {
    key: 'window_drop',
    label: '離脱',
    headerClass: 'bg-rose-500/10 text-black dark:text-white',
    cellClass: 'bg-rose-500/5',
  },
  {
    key: 'window_add',
    label: '追加',
    headerClass: 'bg-sky-500/10 text-black dark:text-white',
    cellClass: 'bg-sky-500/5',
  },
  {
    key: 'position_change',
    label: 'ポジション',
    headerClass: 'bg-amber-500/20 text-black dark:text-white',
    cellClass: 'bg-amber-500/5',
  },
  {
    key: 'ranking_shift',
    label: '順位変動',
    headerClass: 'bg-emerald-500/10 text-black dark:text-white',
    cellClass: 'bg-emerald-500/5',
  },
]

const categoryOrder: { key: string; label: string }[] = [
  { key: '株式', label: '株式' },
  { key: '金利', label: '金利' },
  { key: 'クレジット', label: 'クレジット' },
  { key: 'モーゲージ', label: '不動産（モーゲージ）' },
  { key: 'コモディティ', label: 'コモディティ' },
]

export function AssetDetailsTable({ assets, portfolio }: AssetDetailsTableProps) {
  const groupedAssets = categoryOrder
    .map((category) => ({
      ...category,
      items: assets
        .filter((asset) => asset.category === category.key)
        .sort((a, b) => b.amount - a.amount),
    }))
    .filter((group) => group.items.length > 0)
  const assetMax = assets.length ? Math.max(...assets.map((asset) => asset.amount)) : 0
  const maxAmount = Math.max(assetMax, portfolio.total, 1)
  const totalContributions = contributionColumns.reduce(
    (acc, column) => ({
      ...acc,
      [column.key]: assets.reduce((sum, asset) => sum + asset.contributions[column.key], 0),
    }),
    {} as Asset['contributions'],
  )
  const totalRow = {
    amount: portfolio.total,
    change_amount: portfolio.change_amount,
    change_pct: portfolio.change_pct,
    contributions: totalContributions,
  }

  return (
    <Card title="資産別VaR / 前日比 / 変動要因">
      <div className="overflow-x-auto">
        <table className="min-w-full table-fixed divide-y divide-border/60 text-sm">
          <thead className="bg-background/80 text-xs uppercase tracking-wide text-muted-foreground">
            <tr>
              <th className="w-24 px-3 py-3 text-left">分類</th>
              <th className="w-48 px-3 py-3 text-left">資産</th>
              <th className="w-20 px-3 py-3 text-right">VaR (億円)</th>
              <th className="w-[28rem] px-4 py-3 text-left">VaR (億円)比較バー</th>
              <th className="w-20 px-3 py-3 text-right">前日比</th>
              {contributionColumns.map((column) => (
                <th
                  key={column.key}
                  className={clsx('px-2 py-3 text-right text-xs font-semibold', column.headerClass)}
                >
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border/40">
            <tr className="align-middle bg-muted/10 font-semibold">
              <td className="w-32 px-4 py-3 text-muted-foreground">全体</td>
              <td className="w-56 px-4 py-3">全資産合算</td>
              <td className="w-24 px-4 py-3 text-right text-primary">{totalRow.amount.toFixed(2)}</td>
              <td className="w-[24rem] px-4 py-3">
                <VarLevelBar amount={totalRow.amount} maxAmount={maxAmount} />
              </td>
              <td
                className={clsx(
                  'w-24 px-4 py-3 text-right font-medium',
                  totalRow.change_amount >= 0 ? 'text-emerald-400' : 'text-rose-400',
                )}
              >
                {totalRow.change_amount >= 0 ? '+' : ''}
                {totalRow.change_amount.toFixed(2)} ({totalRow.change_pct >= 0 ? '+' : ''}
                {totalRow.change_pct.toFixed(1)}%)
              </td>
              {contributionColumns.map((column) => {
                const value = totalRow.contributions[column.key]
                return (
                  <td
                    key={column.key}
                    className={clsx(
                      'px-2 py-3 text-right font-medium tabular-nums',
                      column.cellClass,
                      value >= 0 ? 'text-emerald-400' : 'text-rose-400',
                    )}
                  >
                    {value >= 0 ? '+' : ''}
                    {value.toFixed(2)}
                  </td>
                )
              })}
            </tr>
            {groupedAssets.map((group) =>
              group.items.map((asset, index) => (
                <tr key={asset.ric} className="align-middle">
                  {index === 0 && (
                    <td
                      className="w-24 px-3 py-3 font-semibold text-muted-foreground"
                      rowSpan={group.items.length}
                    >
                      {group.label}
                    </td>
                  )}
                  <td className="w-48 px-3 py-3 font-medium">{asset.name}</td>
                  <td className="w-20 px-3 py-3 text-right font-semibold text-primary">
                    {asset.amount.toFixed(2)}
                  </td>
                  <td className="w-[28rem] px-4 py-3">
                    <VarLevelBar amount={asset.amount} maxAmount={maxAmount} />
                  </td>
                  <td
                    className={clsx(
                      'w-20 px-3 py-3 text-right font-medium',
                      asset.change_amount >= 0 ? 'text-emerald-400' : 'text-rose-400',
                    )}
                  >
                    {asset.change_amount >= 0 ? '+' : ''}
                    {asset.change_amount.toFixed(2)} ({asset.change_pct >= 0 ? '+' : ''}
                    {asset.change_pct.toFixed(1)}%)
                  </td>
                  {contributionColumns.map((column) => {
                    const value = asset.contributions[column.key]
                    return (
                      <td
                        key={column.key}
                        className={clsx(
                          'px-2 py-3 text-right font-medium tabular-nums',
                          column.cellClass,
                          value >= 0 ? 'text-emerald-400' : 'text-rose-400',
                        )}
                      >
                        {value >= 0 ? '+' : ''}
                        {value.toFixed(2)}
                      </td>
                    )
                  })}
                </tr>
              )),
            )}
          </tbody>
        </table>
      </div>
    </Card>
  )
}

function VarLevelBar({ amount, maxAmount }: { amount: number; maxAmount: number }) {
  if (maxAmount === 0) {
    return <div className="text-xs text-muted-foreground">データなし</div>
  }

  const normalized = Math.min(1, Math.max(0, amount / maxAmount))
  const ratio = normalized > 0 ? Math.pow(normalized, 0.5) : 0
  const clamped = Math.max(0.08, ratio)

  return (
    <div className="relative h-2 w-full overflow-hidden rounded-full bg-border/60">
      <div
        className="absolute inset-y-0 left-0 rounded-full bg-sky-400"
        style={{ width: `${clamped * 100}%` }}
      />
    </div>
  )
}
