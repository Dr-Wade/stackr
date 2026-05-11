<script setup lang="ts">
const SAMPLE_URL = 'https://overlay-template.com/clock/?theme=dark';
const emit = defineEmits<{ (e: 'add-sample', url: string): void }>();
</script>

<template>
  <div class="flex h-full w-full flex-col items-center justify-center gap-4 px-6 text-center">
    <div class="space-y-1">
      <h2 class="text-base font-medium text-text">Your canvas is empty</h2>
      <p class="text-sm text-muted">
        Drop in a URL to start building an overlay.
      </p>
    </div>
    <button
      type="button"
      class="rounded-md border border-border-strong bg-raised px-3 py-1.5 text-sm text-text transition-colors duration-150 hover:bg-hover"
      @click="emit('add-sample', SAMPLE_URL)"
    >
      Try a sample clock overlay
    </button>
  </div>
</template>
