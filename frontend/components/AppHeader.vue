<template>
  <header class="sticky top-0 z-20 border-b border-border bg-background/80 backdrop-blur">
    <div class="mx-auto w-full max-w-[108rem] px-6 py-4">
      <div class="flex flex-wrap items-center gap-4">
        <div class="flex items-center gap-3 lg:hidden">
          <span class="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary font-semibold">
            VaR
          </span>
          <div>
            <p class="text-sm font-semibold uppercase tracking-[0.3em] text-muted-foreground">ダッシュボード</p>
            <h1 class="text-lg font-bold">Value at Risk モニター</h1>
          </div>
        </div>
        <div class="ml-auto flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">
          <span>ダークモード</span>
          <UiSwitch aria-label="ダークモード切り替え" :pressed="theme === 'dark'" @toggle="toggleTheme" />
        </div>
      </div>
      <nav v-if="hasTabs" aria-label="主要アプリケーションタブ" class="mt-3">
        <div class="flex flex-wrap gap-3">
          <button
            v-for="tab in tabs"
            :key="tab.key"
            type="button"
            class="rounded-full border px-4 py-2 text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
            :class="tab.key === activeTab
              ? 'bg-primary/20 text-primary border-primary/60'
              : 'border-border text-muted-foreground hover:border-primary/40 hover:text-foreground'
            "
            :aria-pressed="tab.key === activeTab"
            @click="emit('tab-change', tab.key)"
          >
            {{ tab.label }}
          </button>
        </div>
      </nav>
    </div>
  </header>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useTheme } from '@/composables/useTheme'

type TabOption = { key: string; label: string }

const props = defineProps<{ tabs?: TabOption[]; activeTab?: string }>()
const emit = defineEmits<{ (e: 'tab-change', key: string): void }>()

const { theme, toggleTheme } = useTheme()
const tabs = computed(() => props.tabs ?? [])
const activeTab = computed(() => props.activeTab ?? tabs.value[0]?.key ?? '')
const hasTabs = computed(() => tabs.value.length > 0)
</script>
