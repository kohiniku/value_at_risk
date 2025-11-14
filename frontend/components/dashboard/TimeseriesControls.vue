<template>
  <UiCard>
    <div class="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <UiSelect
        label="資産"
        :model-value="selectedRic"
        @update:model-value="(value) => emit('asset-change', value)"
      >
        <option v-for="option in options" :key="option.value" :value="option.value">
          {{ option.label }}
        </option>
      </UiSelect>
      <UiSelect
        label="観測日数"
        :model-value="String(windowDays)"
        @update:model-value="(value) => emit('window-change', Number(value))"
      >
        <option value="14">14日</option>
        <option value="30">30日</option>
        <option value="60">60日</option>
      </UiSelect>
    </div>
  </UiCard>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  options: { value: string; label: string }[]
  selectedRic: string
  windowDays: number
}>()

const emit = defineEmits<{ (e: 'asset-change', value: string): void; (e: 'window-change', value: number): void }>()

const selectedRic = computed(() => props.selectedRic)
const windowDays = computed(() => props.windowDays)
const options = computed(() => props.options)
</script>
