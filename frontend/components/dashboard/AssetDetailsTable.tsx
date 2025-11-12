import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { cn } from '@/lib/utils'
import type { Asset, Portfolio } from '@/types/var'

interface AssetDetailsTableProps {
  assets: Asset[]
  portfolio: Portfolio
}

const contributionColumns: {
  key: keyof Asset['contributions']
  label: string
  badgeClass: string
}[] = [
  { key: 'window_drop', label: '離脱', badgeClass: 'bg-rose-500/15 text-rose-400' },
  { key: 'window_add', label: '追加', badgeClass: 'bg-sky-500/15 text-sky-400' },
  { key: 'position_change', label: 'ポジション', badgeClass: 'bg-amber-500/20 text-amber-600 dark:text-amber-300' },
  { key: 'ranking_shift', label: '順位', badgeClass: 'bg-emerald-500/15 text-emerald-400' },
]

const categoryOrder: { key: string; label: string }[] = [
  { key: '株式', label: '株式' },
  { key: '金利', label: '金利' },
  { key: 'クレジット', label: 'クレジット' },
  { key: 'モーゲージ', label: '不動産/モーゲージ' },
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
    <Card className="flex flex-col">
      <CardHeader className="pb-2">
        <CardTitle className="text-base">資産別VaR / 前日比 / 変動要因</CardTitle>
        <p className="text-xs text-muted-foreground">カテゴリ順にソートし、棒でVaR規模を直感的に比較できます。</p>
      </CardHeader>
      <CardContent className="px-0 pb-0">
        <ScrollArea className="w-full">
          <div className="min-w-[900px] px-6">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-24">分類</TableHead>
                  <TableHead className="w-48">資産名</TableHead>
                  <TableHead className="w-24 text-right">VaR (億円)</TableHead>
                  <TableHead className="w-[280px]">比較バー</TableHead>
                  <TableHead className="w-28 text-right">前日比</TableHead>
                  {contributionColumns.map((column) => (
                    <TableHead key={column.key} className="text-right">
                      <Badge variant="secondary" className={cn('text-[11px] font-semibold', column.badgeClass)}>
                        {column.label}
                      </Badge>
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow className="bg-muted/40 font-semibold">
                  <TableCell className="text-muted-foreground">全体</TableCell>
                  <TableCell>全資産合算</TableCell>
                  <TableCell className="text-right text-primary">{totalRow.amount.toFixed(2)}</TableCell>
                  <TableCell>
                    <VarLevelBar amount={totalRow.amount} maxAmount={maxAmount} />
                  </TableCell>
                  <TableCell className="text-right align-middle">
                    <ChangeValue amount={totalRow.change_amount} pct={totalRow.change_pct} />
                  </TableCell>
                  {contributionColumns.map((column) => {
                    const value = totalRow.contributions[column.key]
                    return (
                      <TableCell
                        key={column.key}
                        className={cn('text-right font-medium', value >= 0 ? 'text-emerald-400' : 'text-rose-400')}
                      >
                        {value >= 0 ? '+' : ''}
                        {value.toFixed(2)}
                      </TableCell>
                    )
                  })}
                </TableRow>
                {groupedAssets.map((group) =>
                  group.items.map((asset, index) => (
                    <TableRow key={asset.ric} className="align-middle">
                      {index === 0 && (
                        <TableCell className="font-semibold text-muted-foreground" rowSpan={group.items.length}>
                          {group.label}
                        </TableCell>
                      )}
                      <TableCell className="font-medium">{asset.name}</TableCell>
                      <TableCell className="text-right font-semibold text-primary">{asset.amount.toFixed(2)}</TableCell>
                      <TableCell>
                        <VarLevelBar amount={asset.amount} maxAmount={maxAmount} />
                      </TableCell>
                      <TableCell className="text-right align-middle">
                        <ChangeValue amount={asset.change_amount} pct={asset.change_pct} />
                      </TableCell>
                      {contributionColumns.map((column) => {
                        const value = asset.contributions[column.key]
                        return (
                          <TableCell
                            key={column.key}
                            className={cn('text-right text-sm font-medium tabular-nums', value >= 0 ? 'text-emerald-400' : 'text-rose-400')}
                          >
                            {value >= 0 ? '+' : ''}
                            {value.toFixed(2)}
                          </TableCell>
                        )
                      })}
                    </TableRow>
                  )),
                )}
              </TableBody>
            </Table>
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}

function ChangeValue({ amount, pct }: { amount: number; pct: number }) {
  const isPositive = amount >= 0

  return (
    <div
      className={cn(
        'flex flex-col items-end font-medium leading-tight tabular-nums',
        isPositive ? 'text-emerald-400' : 'text-rose-400',
      )}
    >
      <span>
        {isPositive ? '+' : ''}
        {amount.toFixed(2)}
      </span>
      <span>
        ({pct >= 0 ? '+' : ''}
        {pct.toFixed(1)}%)
      </span>
    </div>
  )
}

function VarLevelBar({ amount, maxAmount }: { amount: number; maxAmount: number }) {
  if (maxAmount === 0) {
    return <div className="text-xs text-muted-foreground">データなし</div>
  }

  const normalized = Math.min(1, Math.max(0, amount / maxAmount))
  const width = Math.max(0.08, Math.pow(normalized, 0.5))

  return (
    <div className="relative h-2 w-full overflow-hidden rounded-full bg-border/80">
      <div
        className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-sky-500 to-cyan-400"
        style={{ width: `${width * 100}%` }}
      />
    </div>
  )
}
