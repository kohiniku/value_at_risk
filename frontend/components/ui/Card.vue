<template>
  <div class="rounded-lg border border-border bg-card text-card-foreground shadow-card" v-bind="$attrs">
    <header
      v-if="title || hasActions"
      class="flex items-center justify-between border-b border-border px-4 py-3"
    >
      <h2
        v-if="title"
        class="text-sm font-semibold tracking-wide text-muted-foreground uppercase"
      >
        {{ title }}
      </h2>
      <slot name="actions" />
    </header>
    <div class="px-4 py-5">
      <slot />
    </div>
    <footer
      v-if="footerContent"
      class="border-t border-border px-4 py-3 text-sm text-muted-foreground"
    >
      <slot name="footer">
        {{ footerText }}
      </slot>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { computed, useSlots } from 'vue'

defineOptions({ inheritAttrs: false })

const props = defineProps<{ title?: string; footer?: string | number | null }>()

const slots = useSlots()
const hasActions = computed(() => !!slots.actions)
const footerContent = computed(() => !!props.footer || !!slots.footer)
const footerText = computed(() => props.footer ?? '')
</script>
