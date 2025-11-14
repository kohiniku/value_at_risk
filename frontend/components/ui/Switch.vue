<template>
  <button
    type="button"
    class="relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer items-center rounded-full border border-border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
    :class="pressedValue ? 'bg-primary' : 'bg-border/70'"
    :aria-pressed="pressedValue"
    :aria-label="ariaLabel"
    @click="handleClick"
  >
    <span
      class="inline-block h-5 w-5 transform rounded-full bg-background transition"
      :class="pressedValue ? 'translate-x-5' : 'translate-x-1'"
    />
  </button>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{ pressed?: boolean; ariaLabel?: string }>()
const emit = defineEmits<{ (e: 'toggle'): void }>()

const pressedValue = computed(() => props.pressed ?? false)
const handleClick = () => emit('toggle')
</script>
