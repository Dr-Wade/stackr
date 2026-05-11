<script setup lang="ts">
import { computed } from 'vue';
import { useScene } from '@/composables/useScene';

const { selectedSource, updateSource } = useScene();

// All four position/size values are stored as 0..1 fractions; show as
// percentages with one decimal place in the UI.
function fracToPct(n: number): number {
  return Math.round(n * 1000) / 10;
}
function pctToFrac(n: number): number {
  return n / 100;
}

function onField(field: 'x' | 'y' | 'w' | 'h', raw: string) {
  const id = selectedSource.value?.id;
  if (!id) return;
  const parsed = parseFloat(raw);
  if (Number.isNaN(parsed)) return;
  updateSource(id, { [field]: pctToFrac(parsed) });
}

function onOpacity(raw: string) {
  const id = selectedSource.value?.id;
  if (!id) return;
  const parsed = parseInt(raw, 10);
  if (Number.isNaN(parsed)) return;
  updateSource(id, { opacity: parsed / 100 });
}

const opacityPct = computed(() =>
  selectedSource.value ? Math.round((selectedSource.value.opacity ?? 1) * 100) : 100,
);
</script>

<template>
  <div v-if="selectedSource" class="space-y-3 border-t border-border bg-bg/40 px-2.5 py-2.5">
    <header class="flex items-center justify-between">
      <h3 class="text-[11px] font-medium uppercase tracking-wide text-muted">
        Selected
      </h3>
      <span class="max-w-[10rem] truncate text-xs text-text">{{ selectedSource.name }}</span>
    </header>

    <div class="grid grid-cols-2 gap-1.5">
      <label class="flex items-center gap-1.5">
        <span class="w-4 font-mono text-[11px] text-faint">X</span>
        <input
          type="number"
          step="0.1"
          min="0"
          max="100"
          :value="fracToPct(selectedSource.x)"
          class="min-w-0 flex-1 rounded bg-bg px-1.5 py-1 font-mono text-[12px] text-text outline-none focus:ring-1 focus:ring-accent-ring"
          @input="(e) => onField('x', (e.target as HTMLInputElement).value)"
        />
      </label>
      <label class="flex items-center gap-1.5">
        <span class="w-4 font-mono text-[11px] text-faint">Y</span>
        <input
          type="number"
          step="0.1"
          min="0"
          max="100"
          :value="fracToPct(selectedSource.y)"
          class="min-w-0 flex-1 rounded bg-bg px-1.5 py-1 font-mono text-[12px] text-text outline-none focus:ring-1 focus:ring-accent-ring"
          @input="(e) => onField('y', (e.target as HTMLInputElement).value)"
        />
      </label>
      <label class="flex items-center gap-1.5">
        <span class="w-4 font-mono text-[11px] text-faint">W</span>
        <input
          type="number"
          step="0.1"
          min="2"
          max="100"
          :value="fracToPct(selectedSource.w)"
          class="min-w-0 flex-1 rounded bg-bg px-1.5 py-1 font-mono text-[12px] text-text outline-none focus:ring-1 focus:ring-accent-ring"
          @input="(e) => onField('w', (e.target as HTMLInputElement).value)"
        />
      </label>
      <label class="flex items-center gap-1.5">
        <span class="w-4 font-mono text-[11px] text-faint">H</span>
        <input
          type="number"
          step="0.1"
          min="2"
          max="100"
          :value="fracToPct(selectedSource.h)"
          class="min-w-0 flex-1 rounded bg-bg px-1.5 py-1 font-mono text-[12px] text-text outline-none focus:ring-1 focus:ring-accent-ring"
          @input="(e) => onField('h', (e.target as HTMLInputElement).value)"
        />
      </label>
    </div>

    <div class="space-y-1">
      <div class="flex items-center justify-between text-[11px]">
        <span class="font-medium uppercase tracking-wide text-faint">Opacity</span>
        <span class="font-mono text-muted">{{ opacityPct }}%</span>
      </div>
      <input
        type="range"
        min="0"
        max="100"
        step="1"
        :value="opacityPct"
        class="w-full accent-accent"
        @input="(e) => onOpacity((e.target as HTMLInputElement).value)"
      />
    </div>
  </div>
</template>
