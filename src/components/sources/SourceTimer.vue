<script setup lang="ts">
import { computed, inject, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import type { TimerSource, TimerFormat } from '@/scene/types';
import { ensureFont, fontFamilyValue } from '@/composables/useFonts';
import { sourceTextStyle } from './SourceText.vue';

const props = defineProps<{ source: TimerSource }>();

const canvasScale = inject<{ value: number }>('canvasScale', { value: 1 });

const mountedAt = ref(Date.now());
const now = ref(Date.now());
let timer: ReturnType<typeof setInterval> | null = null;

onMounted(() => {
  mountedAt.value = Date.now();
  ensureFont(props.source.timer.style.font);
  timer = setInterval(() => {
    now.value = Date.now();
  }, 250);
});
onBeforeUnmount(() => {
  if (timer) clearInterval(timer);
  timer = null;
});

watch(
  () => props.source.timer.style.font,
  (f) => ensureFont(f),
);

// Reset the relative-duration baseline when the duration or mode changes
// so the editor preview reflects what /view would show on a fresh load.
watch(
  () => [props.source.timer.mode, props.source.timer.durationSec],
  () => {
    mountedAt.value = Date.now();
  },
);

const elapsedSec = computed(() =>
  Math.floor((now.value - mountedAt.value) / 1000),
);

function pad(n: number, width = 2): string {
  return n.toString().padStart(width, '0');
}

function format(totalSec: number, fmt: TimerFormat): string {
  const t = Math.max(0, totalSec);
  const h = Math.floor(t / 3600);
  const m = Math.floor((t % 3600) / 60);
  const s = t % 60;
  switch (fmt) {
    case 'mm:ss':
      return `${pad(Math.floor(t / 60))}:${pad(s)}`;
    case 'hh:mm:ss':
      return `${pad(h)}:${pad(m)}:${pad(s)}`;
    case 'h:mm':
      return `${h}:${pad(m)}`;
    case 'h:mm AM/PM': {
      // Time-of-day formatting only meaningful in clock mode; for non-clock
      // we fall back to h:mm
      return `${h}:${pad(m)}`;
    }
  }
}

function formatClock(d: Date, fmt: TimerFormat): string {
  const h24 = d.getHours();
  const m = d.getMinutes();
  const s = d.getSeconds();
  switch (fmt) {
    case 'mm:ss':
      return `${pad(m)}:${pad(s)}`;
    case 'hh:mm:ss':
      return `${pad(h24)}:${pad(m)}:${pad(s)}`;
    case 'h:mm':
      return `${h24}:${pad(m)}`;
    case 'h:mm AM/PM': {
      const ampm = h24 >= 12 ? 'PM' : 'AM';
      let h12 = h24 % 12;
      if (h12 === 0) h12 = 12;
      return `${h12}:${pad(m)} ${ampm}`;
    }
  }
}

const display = computed(() => {
  const { mode, durationSec, format: fmt, finishedText } = props.source.timer;
  if (mode === 'clock') {
    return formatClock(new Date(now.value), fmt);
  }
  if (mode === 'countup') {
    return format(elapsedSec.value, fmt);
  }
  // countdown
  const remaining = durationSec - elapsedSec.value;
  if (remaining <= 0) return finishedText || '00:00';
  return format(remaining, fmt);
});

const style = computed(() => {
  // Reuse the text styling helper but supply 'content' via the display ref.
  const s = sourceTextStyle(
    { ...props.source.timer.style, content: '' },
    canvasScale.value,
  );
  // Timers look right with tabular numerals so digits don't jiggle.
  s.fontVariantNumeric = 'tabular-nums';
  s.fontFamily = fontFamilyValue(props.source.timer.style.font);
  return s;
});
</script>

<template>
  <div
    class="pointer-events-none flex h-full w-full items-center"
    :class="{
      'justify-start': source.timer.style.align === 'left',
      'justify-center': source.timer.style.align === 'center',
      'justify-end': source.timer.style.align === 'right',
    }"
  >
    <div class="w-full" :style="style">{{ display }}</div>
  </div>
</template>
