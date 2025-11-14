<template>
  <UiCard title="関連ニュース">
    <div v-if="loading" class="space-y-3">
      <UiSkeleton height-class="h-6" />
      <UiSkeleton height-class="h-6" />
      <UiSkeleton height-class="h-6" />
    </div>
    <ul v-else class="space-y-4">
      <li
        v-for="item in items"
        :key="item.id"
        class="border-b border-border/60 pb-3 last:border-none"
      >
        <p class="text-sm font-semibold">{{ item.headline }}</p>
        <p class="mt-1 text-xs text-muted-foreground">{{ formatMeta(item) }}</p>
        <p v-if="item.summary" class="mt-2 text-sm text-muted-foreground">{{ item.summary }}</p>
      </li>
      <li v-if="items.length === 0" class="text-sm text-muted-foreground">
        表示できるニュースはありません。
      </li>
    </ul>
  </UiCard>
</template>

<script setup lang="ts">
import type { NewsItem } from '@/types/var'

defineProps<{ items: NewsItem[]; loading?: boolean }>()

const formatMeta = (item: NewsItem) => {
  const when = new Date(item.published_at)
  return `${item.source} • ${when.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })}`
}
</script>
