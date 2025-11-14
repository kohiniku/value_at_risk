<template>
  <div
    class="w-full animate-pulse rounded-md bg-muted/40"
    :class="heightClass"
  />
</template>

<script setup lang="ts">
withDefaults(defineProps<{ heightClass?: string }>(), {
  heightClass: 'h-4',
})
</script>
