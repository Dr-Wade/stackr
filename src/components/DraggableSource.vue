<script setup lang="ts">
import { ref } from 'vue';
import type { Source } from '@/scene/types';

const props = defineProps<{
  source: Source;
  containerWidth: number;
  containerHeight: number;
  selected: boolean;
}>();

const emit = defineEmits<{
  (e: 'select', id: string): void;
  (e: 'update', id: string, patch: Partial<Source>): void;
}>();

type Mode = 'idle' | 'move' | 'resize-br';
const mode = ref<Mode>('idle');

const start = ref({
  pointerX: 0,
  pointerY: 0,
  x: 0,
  y: 0,
  w: 0,
  h: 0,
});

function onPointerDown(e: PointerEvent, m: Exclude<Mode, 'idle'>) {
  e.preventDefault();
  e.stopPropagation();
  (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  mode.value = m;
  start.value = {
    pointerX: e.clientX,
    pointerY: e.clientY,
    x: props.source.x,
    y: props.source.y,
    w: props.source.w,
    h: props.source.h,
  };
  emit('select', props.source.id);
}

function onPointerMove(e: PointerEvent) {
  if (mode.value === 'idle') return;
  if (props.containerWidth === 0 || props.containerHeight === 0) return;
  const dxFrac = (e.clientX - start.value.pointerX) / props.containerWidth;
  const dyFrac = (e.clientY - start.value.pointerY) / props.containerHeight;
  if (mode.value === 'move') {
    emit('update', props.source.id, {
      x: start.value.x + dxFrac,
      y: start.value.y + dyFrac,
    });
  } else if (mode.value === 'resize-br') {
    emit('update', props.source.id, {
      w: start.value.w + dxFrac,
      h: start.value.h + dyFrac,
    });
  }
}

function onPointerUp(e: PointerEvent) {
  if (mode.value === 'idle') return;
  (e.currentTarget as HTMLElement).releasePointerCapture?.(e.pointerId);
  mode.value = 'idle';
}

const styleObj = (s: Source, isSelected: boolean) => ({
  left: `${s.x * 100}%`,
  top: `${s.y * 100}%`,
  width: `${s.w * 100}%`,
  height: `${s.h * 100}%`,
  // Selected source floats above siblings in the editor so its chrome is
  // visible and it remains the topmost click target. The scene's real z
  // order is unchanged (output renders by source.z only).
  zIndex: isSelected ? 9999 : s.z + 1,
});
</script>

<template>
  <div
    v-if="source.visible"
    class="absolute select-none transition-shadow duration-150"
    :style="styleObj(source, selected)"
    @pointerdown="onPointerDown($event, 'move')"
    @pointermove="onPointerMove"
    @pointerup="onPointerUp"
    @pointercancel="onPointerUp"
  >
    <iframe
      :src="source.url"
      :title="source.name"
      class="pointer-events-none h-full w-full border-0"
      :style="{ background: 'transparent', colorScheme: 'light' }"
      sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
      referrerpolicy="no-referrer-when-downgrade"
      loading="lazy"
    ></iframe>

    <!-- Inset selection ring so it's never clipped by the stage's overflow.
         Uses inset box-shadow rather than outline so it tracks the box exactly. -->
    <div
      class="pointer-events-none absolute inset-0 rounded-sm transition-shadow duration-150"
      :class="
        selected
          ? 'shadow-[inset_0_0_0_2px_var(--accent),inset_0_0_0_4px_rgba(255,107,107,0.18)]'
          : 'shadow-[inset_0_0_0_1px_rgba(237,237,242,0.18)] group-hover:shadow-[inset_0_0_0_1px_rgba(237,237,242,0.3)]'
      "
    ></div>

    <div
      v-if="selected"
      class="pointer-events-none absolute top-1 left-1 max-w-[calc(100%-0.5rem)] truncate rounded bg-accent px-1.5 py-0.5 font-mono text-[10px] font-medium text-bg"
    >
      {{ source.name }}
    </div>

    <div
      v-if="selected"
      class="absolute right-0 bottom-0 h-4 w-4 cursor-nwse-resize rounded-tl-sm border border-bg bg-accent"
      role="slider"
      aria-label="Resize"
      @pointerdown.stop="onPointerDown($event, 'resize-br')"
      @pointermove.stop="onPointerMove"
      @pointerup.stop="onPointerUp"
      @pointercancel.stop="onPointerUp"
    ></div>
  </div>
</template>
