<script setup lang="ts">
import { ref, watch } from 'vue';
import type { ImageSource } from '@/scene/types';

const props = defineProps<{
  source: ImageSource;
  reloadKey: number;
}>();

const errored = ref(false);

watch(
  () => [props.source.imageUrl, props.reloadKey],
  () => {
    errored.value = false;
  },
);
</script>

<template>
  <div class="pointer-events-none flex h-full w-full items-center justify-center">
    <img
      v-if="!errored && source.imageUrl"
      :key="`${source.imageUrl}-${reloadKey}`"
      :src="source.imageUrl"
      :alt="source.name"
      class="h-full w-full"
      :style="{
        objectFit: source.fit,
        background: 'transparent',
      }"
      referrerpolicy="no-referrer"
      @error="errored = true"
    />
    <div
      v-else
      class="flex h-full w-full flex-col items-center justify-center gap-1 rounded-sm border border-dashed border-border-strong bg-bg/40 px-2 text-center text-xs text-faint"
    >
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
        <circle cx="8.5" cy="8.5" r="1.5" />
        <polyline points="21 15 16 10 5 21" />
      </svg>
      <span v-if="!source.imageUrl">No image URL</span>
      <span v-else>Failed to load</span>
    </div>
  </div>
</template>
