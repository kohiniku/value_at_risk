<template>
  <label class="flex w-full flex-col gap-2 text-sm text-muted-foreground">
    <span v-if="label" class="font-medium uppercase tracking-wide">{{ label }}</span>
    <select
      class="rounded-md border border-border bg-background px-3 py-2 text-foreground focus:border-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
      :value="modelValue"
      @change="handleChange"
    >
      <slot />
    </select>
  </label>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{ label?: string; modelValue?: string | number }>()
const emit = defineEmits<{ (e: 'update:modelValue', value: string): void; (e: 'change', event: Event): void }>()

const handleChange = (event: Event) => {
  const target = event.target as HTMLSelectElement
  emit('update:modelValue', target.value)
  emit('change', event)
}

const modelValue = computed(() => props.modelValue)
</script>
