<template>
  <section class="grid gap-6 md:grid-cols-3">
    <UiCard
      v-for="metric in metrics"
      :key="metric.label"
      class="relative overflow-hidden"
      :title="`${metric.label}（億円）`"
    >
      <template #actions>
        <span
          class="text-xs font-medium"
          :class="metric.change >= 0 ? 'text-emerald-400' : 'text-rose-400'"
        >
          {{ metric.change >= 0 ? '+' : '' }}{{ metric.change.toFixed(2) }}%
        </span>
      </template>
      <div class="flex flex-col gap-2">
        <p class="text-3xl font-semibold">{{ metric.value.toFixed(1) }}</p>
        <p class="text-sm text-muted-foreground">
          前日差(億円): {{ metric.delta >= 0 ? '+' : '' }}{{ metric.delta.toFixed(2) }}
        </p>
      </div>
    </UiCard>
  </section>
</template>

<script setup lang="ts">
import type { MetricSummary } from '@/lib/metrics'

defineProps<{ metrics: MetricSummary[] }>()
</script>
