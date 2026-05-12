<script setup lang="ts">
import { useScene } from '@/composables/useScene';

const { addSource } = useScene();

function addText() {
  addSource({ type: 'text' });
}
function addTimer() {
  addSource({ type: 'timer' });
}
</script>

<template>
  <div class="flex h-full w-full flex-col items-center justify-center gap-5 px-6 text-center">
    <div class="space-y-1">
      <h2 class="text-base font-medium text-text">Your canvas is empty</h2>
      <p class="text-sm text-muted">
        Add a source from the sidebar — or get started with one click.
      </p>
    </div>
    <div class="flex flex-wrap items-center justify-center gap-2">
      <button
        type="button"
        class="flex items-center gap-1.5 rounded-md border border-border-strong bg-raised px-3 py-1.5 text-sm text-text transition-colors duration-150 hover:bg-hover"
        @click="addText"
      >
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-muted">
          <polyline points="4 7 4 4 20 4 20 7" />
          <line x1="9" y1="20" x2="15" y2="20" />
          <line x1="12" y1="4" x2="12" y2="20" />
        </svg>
        <span>Add text</span>
      </button>
      <button
        type="button"
        class="flex items-center gap-1.5 rounded-md border border-border-strong bg-raised px-3 py-1.5 text-sm text-text transition-colors duration-150 hover:bg-hover"
        @click="addTimer"
      >
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-muted">
          <circle cx="12" cy="13" r="8" />
          <polyline points="12 9 12 13 14 15" />
          <line x1="9" y1="2" x2="15" y2="2" />
        </svg>
        <span>Add timer</span>
      </button>
    </div>
  </div>
</template>
