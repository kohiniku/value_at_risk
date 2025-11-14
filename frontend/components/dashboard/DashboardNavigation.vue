<template>
  <nav
    v-if="sections.length"
    aria-label="ダッシュボードナビゲーションバー"
    class="fixed inset-y-0 left-0 z-30 hidden w-72 flex-col border-r border-border/60 bg-gradient-to-b from-background/95 via-background/90 to-background/95 px-5 py-6 text-sm shadow-[0_25px_60px_rgba(0,0,0,0.35)] backdrop-blur lg:flex"
  >
    <div class="space-y-4">
      <div class="flex items-center gap-3 text-foreground">
        <span class="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/15 text-lg font-semibold text-primary">
          VaR
        </span>
        <div>
          <p class="text-xs font-semibold uppercase tracking-[0.5em] text-muted-foreground/80">Value at Risk</p>
          <p class="text-base font-bold">リスクモニター</p>
        </div>
      </div>
      <div>
        <p class="text-[0.65rem] font-semibold uppercase tracking-[0.45em] text-muted-foreground/80">NAVIGATION</p>
        <p class="text-sm text-muted-foreground/80">主要セクションへジャンプ</p>
      </div>
    </div>
    <div class="mt-6 flex-1 space-y-2 overflow-y-auto pr-1">
      <a
        v-for="(section, index) in sections"
        :key="section.id"
        :href="`#${section.id}`"
        class="group relative flex items-start gap-3 rounded-2xl border border-transparent px-4 py-3 text-muted-foreground transition hover:border-primary/40 hover:bg-primary/5 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
        @click.prevent="emit('navigate', section.id)"
      >
        <span class="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-[0.7rem] font-semibold text-primary">
          {{ String(index + 1).padStart(2, '0') }}
        </span>
        <span class="flex flex-col">
          <span class="text-sm font-semibold tracking-wide">{{ section.label }}</span>
          <span v-if="section.description" class="text-xs font-normal text-muted-foreground/80">{{ section.description }}</span>
        </span>
        <span class="absolute inset-y-2 left-0 w-1 rounded-full bg-transparent transition group-hover:bg-primary" />
      </a>
    </div>
    <div class="border-t border-border/50 pt-4 text-xs text-muted-foreground">
      <p class="font-semibold uppercase tracking-[0.3em] text-muted-foreground/80">ショートカット</p>
      <p class="mt-1 text-muted-foreground/70">セクション名をクリックして即座に移動できます。</p>
    </div>
  </nav>
</template>

<script setup lang="ts">
type Section = { id: string; label: string; description?: string }

defineProps<{ sections: Section[] }>()

const emit = defineEmits<{ (e: 'navigate', sectionId: string): void }>()
</script>
