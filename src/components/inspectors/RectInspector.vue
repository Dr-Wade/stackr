<script setup lang="ts">
import type { RectSource } from '@/scene/types';

defineProps<{ source: RectSource }>();
const emit = defineEmits<{ (e: 'patch', patch: Partial<RectSource>): void }>();
</script>

<template>
  <div class="space-y-2.5">
    <label class="block space-y-1">
      <span class="text-[11px] font-medium uppercase tracking-wide text-faint">Color</span>
      <div class="flex items-center gap-1.5">
        <input
          type="color"
          :value="source.color.startsWith('#') ? source.color : '#0B0B0F'"
          class="h-7 w-7 cursor-pointer rounded bg-bg"
          @input="(e) => emit('patch', { color: (e.target as HTMLInputElement).value })"
        />
        <input
          type="text"
          :value="source.color"
          placeholder="#0B0B0F or rgba(…)"
          class="min-w-0 flex-1 rounded bg-bg px-1.5 py-1 font-mono text-[11px] text-text outline-none focus:ring-1 focus:ring-accent-ring"
          @input="(e) => emit('patch', { color: (e.target as HTMLInputElement).value })"
        />
      </div>
    </label>

    <label class="block space-y-1">
      <span class="text-[11px] font-medium uppercase tracking-wide text-faint">Corner radius (px)</span>
      <input
        type="number"
        min="0"
        max="200"
        step="1"
        :value="source.radius"
        class="w-full rounded bg-bg px-2 py-1 font-mono text-[12px] text-text outline-none focus:ring-1 focus:ring-accent-ring"
        @input="(e) => emit('patch', { radius: parseInt((e.target as HTMLInputElement).value, 10) || 0 })"
      />
    </label>
  </div>
</template>
