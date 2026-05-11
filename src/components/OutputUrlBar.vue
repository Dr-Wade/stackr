<script setup lang="ts">
import { useClipboard } from '@vueuse/core';
import { useOutputUrl } from '@/composables/useOutputUrl';
import { useScene } from '@/composables/useScene';
import { useToast } from '@/composables/useToast';

const { outputUrl } = useOutputUrl();
const { sortedSources } = useScene();
const { copy } = useClipboard({ legacy: true });
const { push } = useToast();

async function onCopy() {
  await copy(outputUrl.value);
  push({ message: 'Output URL copied', kind: 'success', durationMs: 2000 });
}
</script>

<template>
  <div class="panel flex w-full items-center gap-2 px-3 py-2">
    <span
      class="hidden text-xs font-medium uppercase tracking-wide text-muted sm:inline"
      :class="{ 'text-faint': sortedSources.length === 0 }"
    >
      Output URL
    </span>
    <code
      class="min-w-0 flex-1 truncate rounded-md bg-bg/60 px-2 py-1.5 font-mono text-[12px] text-text"
      :title="outputUrl"
    >{{ outputUrl }}</code>
    <button
      type="button"
      class="flex items-center gap-1.5 rounded-md bg-accent px-3 py-1.5 text-sm font-medium text-bg transition-colors duration-150 hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-50"
      :disabled="sortedSources.length === 0"
      @click="onCopy"
    >
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
        <rect x="9" y="9" width="13" height="13" rx="2" />
        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
      </svg>
      <span>Copy</span>
    </button>
    <a
      :href="outputUrl"
      target="_blank"
      rel="noopener noreferrer"
      class="flex items-center gap-1.5 rounded-md border border-border-strong bg-raised px-3 py-1.5 text-sm text-text transition-colors duration-150 hover:bg-hover"
      :class="{ 'pointer-events-none opacity-50': sortedSources.length === 0 }"
      :aria-disabled="sortedSources.length === 0"
    >
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
        <polyline points="15 3 21 3 21 9" />
        <line x1="10" y1="14" x2="21" y2="3" />
      </svg>
      <span>Open</span>
    </a>
  </div>
</template>
