<script setup lang="ts">
import type { ImageSource, ImageFit } from '@/scene/types';

defineProps<{ source: ImageSource }>();
const emit = defineEmits<{ (e: 'patch', patch: Partial<ImageSource>): void }>();

const fits: ImageFit[] = ['contain', 'cover', 'fill'];
</script>

<template>
  <div class="space-y-2.5">
    <label class="block space-y-1">
      <span class="text-[11px] font-medium uppercase tracking-wide text-faint">Image URL</span>
      <input
        type="text"
        :value="source.imageUrl"
        placeholder="https://example.com/logo.png"
        autocomplete="off"
        spellcheck="false"
        class="w-full rounded bg-bg px-2 py-1 font-mono text-[11px] text-text outline-none focus:ring-1 focus:ring-accent-ring"
        @input="(e) => emit('patch', { imageUrl: (e.target as HTMLInputElement).value })"
      />
    </label>

    <div class="space-y-1">
      <span class="text-[11px] font-medium uppercase tracking-wide text-faint">Fit</span>
      <div class="flex gap-0.5 rounded bg-bg p-0.5">
        <button
          v-for="f in fits"
          :key="f"
          type="button"
          class="flex-1 rounded px-1 py-1 text-[11px] capitalize transition-colors"
          :class="source.fit === f ? 'bg-accent text-bg' : 'text-muted hover:text-text'"
          @click="emit('patch', { fit: f })"
        >{{ f }}</button>
      </div>
    </div>
  </div>
</template>
