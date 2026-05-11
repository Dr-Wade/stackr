<script setup lang="ts">
import { ref } from 'vue';
import SourceList from '@/components/SourceList.vue';
import CanvasPreview from '@/components/CanvasPreview.vue';
import OutputUrlBar from '@/components/OutputUrlBar.vue';
import HowToModal from '@/components/HowToModal.vue';

const howToOpen = ref(false);
</script>

<template>
  <div class="flex h-full w-full flex-col gap-3 p-3">
    <header class="flex items-center justify-between px-1">
      <div class="flex items-center gap-2">
        <span class="inline-flex h-6 w-6 items-center justify-center rounded-md bg-accent text-bg">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="4" y="4" width="13" height="8" rx="1.5" />
            <rect x="7" y="9" width="13" height="8" rx="1.5" fill="currentColor" fill-opacity="0.25" />
            <rect x="10" y="14" width="11" height="7" rx="1.5" fill="currentColor" />
          </svg>
        </span>
        <h1 class="text-sm font-semibold tracking-tight text-text">Stackr</h1>
        <span class="font-mono text-[11px] text-faint">v0.1</span>
      </div>
      <button
        type="button"
        class="flex items-center gap-1.5 rounded-md border border-border-strong bg-raised px-2.5 py-1 text-xs text-text transition-colors duration-150 hover:bg-hover"
        @click="howToOpen = true"
      >
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="10" />
          <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
          <line x1="12" y1="17" x2="12.01" y2="17" />
        </svg>
        <span>How-To</span>
      </button>
    </header>

    <HowToModal :open="howToOpen" @close="howToOpen = false" />

    <div class="grid min-h-0 flex-1 grid-cols-1 gap-3 lg:grid-cols-[280px_1fr]">
      <SourceList />
      <main class="panel min-h-0 overflow-hidden">
        <CanvasPreview />
      </main>
    </div>

    <OutputUrlBar />
  </div>
</template>
