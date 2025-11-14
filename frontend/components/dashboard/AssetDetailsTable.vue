<template>
  <UiCard title="資産別VaR / 前日比 / 変動要因">
    <div class="overflow-x-auto">
      <table class="min-w-full table-fixed divide-y divide-border/60 text-sm">
        <thead class="bg-background/80 text-xs uppercase tracking-wide text-muted-foreground">
          <tr>
            <th class="w-24 px-3 py-3 text-left">分類</th>
            <th class="w-48 px-3 py-3 text-left">資産</th>
            <th class="w-20 px-3 py-3 text-right">VaR (億円)</th>
            <th class="w-[28rem] px-4 py-3 text-left">VaR (億円)比較バー</th>
            <th class="w-20 px-3 py-3 text-right">前日比</th>
            <th
              v-for="column in contributionColumns"
              :key="column.key"
              class="px-2 py-3 text-right text-xs font-semibold"
              :class="column.headerClass"
            >
              {{ column.label }}
            </th>
          </tr>
        </thead>
        <tbody class="divide-y divide-border/40">
          <tr class="align-middle bg-muted/10 font-semibold">
            <td class="w-32 px-4 py-3 text-muted-foreground">全体</td>
            <td class="w-56 px-4 py-3">全資産合算</td>
            <td class="w-24 px-4 py-3 text-right text-primary">{{ totalRow.amount.toFixed(2) }}</td>
            <td class="w-[24rem] px-4 py-3">
              <div class="relative h-2 w-full overflow-hidden rounded-full bg-border/60">
                <div class="absolute inset-y-0 left-0 rounded-full bg-sky-400" :style="{ width: `${barWidth(totalRow.amount)}%` }" />
              </div>
            </td>
            <td
              class="w-24 px-4 py-3 text-right font-medium"
              :class="totalRow.change_amount >= 0 ? 'text-emerald-400' : 'text-rose-400'"
            >
              {{ formatChange(totalRow.change_amount, totalRow.change_pct) }}
            </td>
            <td
              v-for="column in contributionColumns"
              :key="`total-${column.key}`"
              class="px-2 py-3 text-right font-medium tabular-nums"
              :class="[column.cellClass, totalRow.contributions[column.key] >= 0 ? 'text-emerald-400' : 'text-rose-400']"
            >
              {{ formatSigned(totalRow.contributions[column.key]) }}
            </td>
          </tr>
          <template v-for="group in groupedAssets" :key="group.key">
            <tr v-for="(asset, index) in group.items" :key="asset.ric" class="align-middle">
              <td v-if="index === 0" class="w-24 px-3 py-3 font-semibold text-muted-foreground" :rowspan="group.items.length">
                {{ group.label }}
              </td>
              <td class="w-48 px-3 py-3 font-medium">{{ asset.name }}</td>
              <td class="w-20 px-3 py-3 text-right font-semibold text-primary">{{ asset.amount.toFixed(2) }}</td>
              <td class="w-[28rem] px-4 py-3">
                <div class="relative h-2 w-full overflow-hidden rounded-full bg-border/60">
                  <div class="absolute inset-y-0 left-0 rounded-full bg-sky-400" :style="{ width: `${barWidth(asset.amount)}%` }" />
                </div>
              </td>
              <td
                class="w-20 px-3 py-3 text-right font-medium"
                :class="asset.change_amount >= 0 ? 'text-emerald-400' : 'text-rose-400'"
              >
                {{ formatChange(asset.change_amount, asset.change_pct) }}
              </td>
              <td
                v-for="column in contributionColumns"
                :key="`${asset.ric}-${column.key}`"
                class="px-2 py-3 text-right font-medium tabular-nums"
                :class="[column.cellClass, asset.contributions[column.key] >= 0 ? 'text-emerald-400' : 'text-rose-400']"
              >
                {{ formatSigned(asset.contributions[column.key]) }}
              </td>
            </tr>
          </template>
        </tbody>
      </table>
    </div>
  </UiCard>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Asset, Portfolio } from '@/types/var'

type ContributionKey = keyof Asset['contributions']

const contributionColumns: { key: ContributionKey; label: string; headerClass: string; cellClass: string }[] = [
  { key: 'window_drop', label: '離脱', headerClass: 'bg-rose-500/10 text-black dark:text-white', cellClass: 'bg-rose-500/5' },
  { key: 'window_add', label: '追加', headerClass: 'bg-sky-500/10 text-black dark:text-white', cellClass: 'bg-sky-500/5' },
  { key: 'position_change', label: 'ポジション', headerClass: 'bg-amber-500/20 text-black dark:text-white', cellClass: 'bg-amber-500/5' },
  { key: 'ranking_shift', label: '順位変動', headerClass: 'bg-emerald-500/10 text-black dark:text-white', cellClass: 'bg-emerald-500/5' },
]

const categoryOrder: { key: string; label: string }[] = [
  { key: '株式', label: '株式' },
  { key: '金利', label: '金利' },
  { key: 'クレジット', label: 'クレジット' },
  { key: 'モーゲージ', label: '不動産（モーゲージ）' },
  { key: 'コモディティ', label: 'コモディティ' },
]

const props = defineProps<{ assets: Asset[]; portfolio: Portfolio }>()

const groupedAssets = computed(() =>
  categoryOrder
    .map((category) => ({
      ...category,
      items: props.assets.filter((asset) => asset.category === category.key).sort((a, b) => b.amount - a.amount),
    }))
    .filter((group) => group.items.length > 0),
)

const maxAmount = computed(() => {
  if (!props.assets.length) {
    return Math.max(props.portfolio.total, 1)
  }
  const assetMax = Math.max(...props.assets.map((asset) => asset.amount))
  return Math.max(assetMax, props.portfolio.total, 1)
})

const totalContributions = computed(() => {
  return contributionColumns.reduce((acc, column) => {
    acc[column.key] = props.assets.reduce((sum, asset) => sum + asset.contributions[column.key], 0)
    return acc
  }, {} as Asset['contributions'])
})

const totalRow = computed(() => ({
  amount: props.portfolio.total,
  change_amount: props.portfolio.change_amount,
  change_pct: props.portfolio.change_pct,
  contributions: totalContributions.value,
}))

const formatChange = (delta: number, pct: number) => {
  const deltaLabel = `${delta >= 0 ? '+' : ''}${delta.toFixed(2)}`
  const pctLabel = `${pct >= 0 ? '+' : ''}${pct.toFixed(1)}`
  return `${deltaLabel} (${pctLabel}%)`
}

const formatSigned = (value: number) => `${value >= 0 ? '+' : ''}${value.toFixed(2)}`

const barWidth = (amount: number) => {
  const max = maxAmount.value
  if (max <= 0) {
    return 0
  }
  const normalized = Math.min(1, Math.max(0, amount / max))
  const ratio = normalized > 0 ? Math.pow(normalized, 0.5) : 0
  return Math.max(0.08, ratio) * 100
}
</script>
