<script setup lang="ts">
import { computed } from 'vue';
import type { TimerSource, TimerSpec, TextSpec } from '@/scene/types';
import TextStyleControls from './TextStyleControls.vue';

const props = defineProps<{ source: TimerSource }>();
const emit = defineEmits<{ (e: 'patch', patch: Partial<TimerSource>): void }>();

const modes: Array<TimerSpec['mode']> = ['countdown', 'countup', 'clock'];
const formats: Array<TimerSpec['format']> = ['mm:ss', 'hh:mm:ss', 'h:mm', 'h:mm AM/PM'];

function patchTimer(t: Partial<TimerSpec>) {
  emit('patch', { timer: { ...props.source.timer, ...t } });
}

function patchStyle(style: Partial<Omit<TextSpec, 'content'>>) {
  patchTimer({ style: { ...props.source.timer.style, ...style } });
}

// mm:ss <-> seconds
const durationMmss = computed({
  get: () => {
    const m = Math.floor(props.source.timer.durationSec / 60);
    const s = props.source.timer.durationSec % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  },
  set: (v: string) => {
    const match = /^(\d+):(\d{1,2})$/.exec(v.trim());
    if (!match) return;
    const m = parseInt(match[1], 10);
    const s = parseInt(match[2], 10);
    if (Number.isNaN(m) || Number.isNaN(s) || s >= 60) return;
    patchTimer({ durationSec: m * 60 + s });
  },
});
</script>

<template>
  <div class="space-y-2.5">
    <!-- Mode -->
    <div class="space-y-1">
      <span class="text-[11px] font-medium uppercase tracking-wide text-faint">Mode</span>
      <div class="flex gap-0.5 rounded bg-bg p-0.5">
        <button
          v-for="m in modes"
          :key="m"
          type="button"
          class="flex-1 rounded px-1 py-1 text-[11px] capitalize transition-colors"
          :class="source.timer.mode === m ? 'bg-accent text-bg' : 'text-muted hover:text-text'"
          @click="patchTimer({ mode: m })"
        >{{ m }}</button>
      </div>
    </div>

    <!-- Duration (countdown/countup only) -->
    <label v-if="source.timer.mode !== 'clock'" class="block space-y-1">
      <span class="text-[11px] font-medium uppercase tracking-wide text-faint">
        {{ source.timer.mode === 'countdown' ? 'Countdown from' : 'Start at' }} (mm:ss)
      </span>
      <input
        v-model="durationMmss"
        type="text"
        placeholder="5:00"
        class="w-full rounded bg-bg px-2 py-1 font-mono text-[12px] text-text outline-none focus:ring-1 focus:ring-accent-ring"
      />
    </label>

    <!-- Format -->
    <label class="block space-y-1">
      <span class="text-[11px] font-medium uppercase tracking-wide text-faint">Format</span>
      <select
        :value="source.timer.format"
        class="w-full rounded bg-bg px-2 py-1 text-xs text-text outline-none focus:ring-1 focus:ring-accent-ring"
        @change="(e) => patchTimer({ format: (e.target as HTMLSelectElement).value as TimerSpec['format'] })"
      >
        <option v-for="f in formats" :key="f" :value="f">{{ f }}</option>
      </select>
    </label>

    <!-- Finished text (countdown only) -->
    <label v-if="source.timer.mode === 'countdown'" class="block space-y-1">
      <span class="text-[11px] font-medium uppercase tracking-wide text-faint">Finished text</span>
      <input
        type="text"
        :value="source.timer.finishedText"
        placeholder="00:00"
        class="w-full rounded bg-bg px-2 py-1 text-sm text-text outline-none focus:ring-1 focus:ring-accent-ring"
        @input="(e) => patchTimer({ finishedText: (e.target as HTMLInputElement).value })"
      />
    </label>

    <div class="border-t border-border pt-2">
      <h4 class="mb-2 text-[11px] font-medium uppercase tracking-wide text-faint">Style</h4>
      <TextStyleControls :style="source.timer.style" @patch="patchStyle" />
    </div>
  </div>
</template>
