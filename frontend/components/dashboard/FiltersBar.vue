<template>
  <UiCard>
    <UiSelect
      label="基準日"
      :model-value="selectedDate"
      @update:model-value="(value) => emit('date-change', value)"
    >
      <option v-for="date in dates" :key="date" :value="date">
        {{ formatDate(date) }}
      </option>
    </UiSelect>
  </UiCard>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{ dates: string[]; selectedDate: string }>()
const emit = defineEmits<{ (e: 'date-change', value: string): void }>()

const dates = computed(() => props.dates)
const selectedDate = computed(() => props.selectedDate)

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
</script>
