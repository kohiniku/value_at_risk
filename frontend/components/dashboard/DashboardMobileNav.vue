<template>
  <div v-if="sections.length" class="lg:hidden">
    <div class="mb-3 flex items-center gap-3 rounded-2xl border border-border/60 bg-background/95 px-4 py-3 shadow-inner">
      <span class="flex h-9 w-9 items-center justify-center rounded-2xl bg-primary/15 text-sm font-semibold text-primary">
        VaR
      </span>
      <div>
        <p class="text-[0.65rem] font-semibold uppercase tracking-[0.4em] text-muted-foreground/80">Value at Risk</p>
        <p class="text-sm font-bold text-foreground">リスクモニター</p>
      </div>
    </div>
    <div class="flex snap-x gap-2 overflow-x-auto rounded-2xl border border-border/60 bg-background/90 px-3 py-3 shadow-inner">
      <a
        v-for="section in sections"
        :key="section.id"
        :href="`#${section.id}`"
        class="flex-shrink-0 rounded-full border border-border/60 px-4 py-2 text-xs font-semibold text-muted-foreground transition hover:border-primary hover:bg-primary/10 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
        @click.prevent="emit('navigate', section.id)"
      >
        {{ section.label }}
      </a>
    </div>
  </div>
</template>

<script setup lang="ts">
type Section = { id: string; label: string; description?: string }

defineProps<{ sections: Section[] }>()

const emit = defineEmits<{ (e: 'navigate', sectionId: string): void }>()
</script>
