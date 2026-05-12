<script setup lang="ts">
import { computed } from 'vue';
import type { QrSource, QrSpec, ErrorCorrectionLevel } from '@/scene/types';

const props = defineProps<{ source: QrSource }>();
const emit = defineEmits<{ (e: 'patch', patch: Partial<QrSource>): void }>();

const levels: ErrorCorrectionLevel[] = ['L', 'M', 'Q', 'H'];
const levelTitles: Record<ErrorCorrectionLevel, string> = {
  L: 'L: 7% recovery',
  M: 'M: 15% recovery',
  Q: 'Q: 25% recovery',
  H: 'H: 30% recovery',
};

function patch(p: Partial<QrSpec>) {
  emit('patch', { qr: { ...props.source.qr, ...p } });
}

const bgTransparent = computed(() => props.source.qr.bgColor === 'transparent');
</script>

<template>
  <div class="space-y-2.5">
    <label class="block space-y-1">
      <span class="text-[11px] font-medium uppercase tracking-wide text-faint">Data</span>
      <input
        type="text"
        :value="source.qr.data"
        placeholder="https://example.com"
        autocomplete="off"
        spellcheck="false"
        class="w-full rounded bg-bg px-2 py-1 font-mono text-[11px] text-text outline-none focus:ring-1 focus:ring-accent-ring"
        @input="(e) => patch({ data: (e.target as HTMLInputElement).value })"
      />
    </label>

    <div class="grid grid-cols-2 gap-2">
      <label class="space-y-1">
        <span class="text-[11px] font-medium uppercase tracking-wide text-faint">Foreground</span>
        <div class="flex items-center gap-1.5">
          <input
            type="color"
            :value="source.qr.fgColor"
            class="h-7 w-7 cursor-pointer rounded bg-bg"
            @input="(e) => patch({ fgColor: (e.target as HTMLInputElement).value })"
          />
          <input
            type="text"
            :value="source.qr.fgColor"
            class="min-w-0 flex-1 rounded bg-bg px-1.5 py-1 font-mono text-[11px] text-text outline-none focus:ring-1 focus:ring-accent-ring"
            @input="(e) => patch({ fgColor: (e.target as HTMLInputElement).value })"
          />
        </div>
      </label>

      <label class="space-y-1">
        <span class="text-[11px] font-medium uppercase tracking-wide text-faint">Background</span>
        <div class="flex items-center gap-1.5">
          <input
            type="color"
            :disabled="bgTransparent"
            :value="bgTransparent ? '#000000' : source.qr.bgColor"
            class="h-7 w-7 cursor-pointer rounded bg-bg disabled:opacity-40"
            @input="(e) => patch({ bgColor: (e.target as HTMLInputElement).value })"
          />
          <input
            type="text"
            :value="source.qr.bgColor"
            class="min-w-0 flex-1 rounded bg-bg px-1.5 py-1 font-mono text-[11px] text-text outline-none focus:ring-1 focus:ring-accent-ring"
            @input="(e) => patch({ bgColor: (e.target as HTMLInputElement).value })"
          />
        </div>
      </label>
    </div>

    <label class="flex items-center gap-2 text-xs text-text">
      <input
        type="checkbox"
        :checked="bgTransparent"
        class="accent-accent"
        @change="(e) => patch({ bgColor: (e.target as HTMLInputElement).checked ? 'transparent' : '#FFFFFF' })"
      />
      <span>Transparent background</span>
    </label>

    <div class="space-y-1">
      <div class="flex items-center justify-between text-[11px]">
        <span class="font-medium uppercase tracking-wide text-faint">Module radius</span>
        <span class="font-mono text-muted">{{ Math.round(source.qr.radius * 100) }}%</span>
      </div>
      <input
        type="range"
        min="0"
        max="50"
        step="1"
        :value="Math.round(source.qr.radius * 100)"
        class="w-full accent-accent"
        @input="(e) => patch({ radius: parseInt((e.target as HTMLInputElement).value, 10) / 100 })"
      />
    </div>

    <div class="space-y-1">
      <span class="text-[11px] font-medium uppercase tracking-wide text-faint">Error correction</span>
      <div class="flex gap-0.5 rounded bg-bg p-0.5">
        <button
          v-for="l in levels"
          :key="l"
          type="button"
          class="flex-1 rounded px-1 py-1 text-[11px] transition-colors"
          :class="source.qr.errorCorrection === l ? 'bg-accent text-bg' : 'text-muted hover:text-text'"
          :title="levelTitles[l]"
          @click="patch({ errorCorrection: l })"
        >{{ l }}</button>
      </div>
    </div>

    <label class="block space-y-1">
      <span class="text-[11px] font-medium uppercase tracking-wide text-faint">Quiet margin</span>
      <input
        type="number"
        min="0"
        max="8"
        step="1"
        :value="source.qr.margin"
        class="w-full rounded bg-bg px-2 py-1 font-mono text-[12px] text-text outline-none focus:ring-1 focus:ring-accent-ring"
        @input="(e) => patch({ margin: Math.max(0, Math.min(8, parseInt((e.target as HTMLInputElement).value, 10) || 0)) })"
      />
    </label>
  </div>
</template>
