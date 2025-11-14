<template>
  <button
    type="button"
    class="inline-flex items-center justify-center rounded-md font-medium transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
    :class="computedClasses"
    :disabled="disabled"
    v-bind="$attrs"
    @click="$emit('click', $event)"
  >
    <slot />
  </button>
</template>

<script setup lang="ts">
import { computed } from 'vue'

type Variant = 'primary' | 'outline' | 'ghost'
type Size = 'sm' | 'md' | 'lg'

const props = withDefaults(
  defineProps<{ variant?: Variant; size?: Size; disabled?: boolean }>(),
  {
    variant: 'primary',
    size: 'md',
    disabled: false,
  },
)

const variantClasses: Record<Variant, string> = {
  primary: 'bg-primary text-primary-foreground hover:bg-primary/90 focus-visible:outline-ring',
  outline: 'border border-border bg-transparent text-foreground hover:bg-border/40 focus-visible:outline-ring',
  ghost: 'text-muted-foreground hover:text-foreground hover:bg-border/30 focus-visible:outline-ring',
}

const sizeClasses: Record<Size, string> = {
  sm: 'h-9 px-3 text-sm',
  md: 'h-10 px-4 text-sm',
  lg: 'h-12 px-6 text-base',
}

const computedClasses = computed(() => [variantClasses[props.variant], sizeClasses[props.size], props.disabled && 'opacity-60 pointer-events-none'])
</script>
