<script setup lang="ts">
import { ref } from 'vue';
import type { Source } from '@/scene/types';
import { snap, type Rect, type SnapGuide, type SnapMode } from '@/composables/useSnap';
import SourceWeb from './sources/SourceWeb.vue';
import SourceText from './sources/SourceText.vue';
import SourceTimer from './sources/SourceTimer.vue';
import SourceImage from './sources/SourceImage.vue';
import SourceRect from './sources/SourceRect.vue';
import SourceQr from './sources/SourceQr.vue';

const props = defineProps<{
  source: Source;
  containerWidth: number;
  containerHeight: number;
  selected: boolean;
  siblings: Rect[];
  reloadKey: number;
}>();

const emit = defineEmits<{
  (e: 'select', id: string): void;
  (e: 'update', id: string, patch: Partial<Source>): void;
  (e: 'drag-guides', guides: SnapGuide[]): void;
  (e: 'drag-end'): void;
}>();

const mode = ref<SnapMode | 'idle'>('idle');

const start = ref({
  pointerX: 0,
  pointerY: 0,
  x: 0,
  y: 0,
  w: 0,
  h: 0,
  altKey: false,
});

function onPointerDown(e: PointerEvent, m: SnapMode) {
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
    altKey: e.altKey,
  };
  emit('select', props.source.id);
}

function applyDelta(
  m: SnapMode,
  s: typeof start.value,
  dxFrac: number,
  dyFrac: number,
): Rect {
  let { x, y, w, h } = s;
  switch (m) {
    case 'move':
      x = s.x + dxFrac;
      y = s.y + dyFrac;
      break;
    case 'resize-br':
      w = s.w + dxFrac;
      h = s.h + dyFrac;
      break;
    case 'resize-bl':
      x = s.x + dxFrac;
      w = s.w - dxFrac;
      h = s.h + dyFrac;
      break;
    case 'resize-tr':
      y = s.y + dyFrac;
      w = s.w + dxFrac;
      h = s.h - dyFrac;
      break;
    case 'resize-tl':
      x = s.x + dxFrac;
      y = s.y + dyFrac;
      w = s.w - dxFrac;
      h = s.h - dyFrac;
      break;
    case 'resize-t':
      y = s.y + dyFrac;
      h = s.h - dyFrac;
      break;
    case 'resize-b':
      h = s.h + dyFrac;
      break;
    case 'resize-l':
      x = s.x + dxFrac;
      w = s.w - dxFrac;
      break;
    case 'resize-r':
      w = s.w + dxFrac;
      break;
  }
  return { x, y, w, h };
}

function onPointerMove(e: PointerEvent) {
  const m = mode.value;
  if (m === 'idle') return;
  if (props.containerWidth === 0 || props.containerHeight === 0) return;
  const dxFrac = (e.clientX - start.value.pointerX) / props.containerWidth;
  const dyFrac = (e.clientY - start.value.pointerY) / props.containerHeight;

  let next = applyDelta(m, start.value, dxFrac, dyFrac);

  // Hold Alt while dragging to suppress snapping.
  if (!e.altKey) {
    const result = snap(
      next,
      props.siblings,
      props.containerWidth,
      props.containerHeight,
      m,
    );
    next = result.rect;
    emit('drag-guides', result.guides);
  } else {
    emit('drag-guides', []);
  }

  emit('update', props.source.id, {
    x: next.x,
    y: next.y,
    w: next.w,
    h: next.h,
  });
}

function onPointerUp(e: PointerEvent) {
  if (mode.value === 'idle') return;
  (e.currentTarget as HTMLElement).releasePointerCapture?.(e.pointerId);
  mode.value = 'idle';
  emit('drag-guides', []);
  emit('drag-end');
}

const styleObj = (s: Source, isSelected: boolean) => ({
  left: `${s.x * 100}%`,
  top: `${s.y * 100}%`,
  width: `${s.w * 100}%`,
  height: `${s.h * 100}%`,
  zIndex: isSelected ? 9999 : s.z + 1,
  opacity: s.opacity ?? 1,
});

// Each resize handle binds the same three pointer handlers; this keeps the
// template tidy.
const handleCommon = {
  pointermove: onPointerMove,
  pointerup: onPointerUp,
  pointercancel: onPointerUp,
};
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
    <SourceWeb v-if="source.type === 'web'" :source="source" :reload-key="reloadKey" />
    <SourceText v-else-if="source.type === 'text'" :source="source" />
    <SourceTimer v-else-if="source.type === 'timer'" :source="source" />
    <SourceImage v-else-if="source.type === 'image'" :source="source" :reload-key="reloadKey" />
    <SourceRect v-else-if="source.type === 'rect'" :source="source" />
    <SourceQr v-else-if="source.type === 'qr'" :source="source" />

    <!-- Inset selection ring so it's never clipped by the stage's overflow. -->
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

    <!-- Edge handles -->
    <template v-if="selected">
      <div
        class="absolute top-0 left-2 right-2 h-1.5 cursor-ns-resize"
        @pointerdown.stop="onPointerDown($event, 'resize-t')"
        v-on="handleCommon"
      ></div>
      <div
        class="absolute bottom-0 left-2 right-2 h-1.5 cursor-ns-resize"
        @pointerdown.stop="onPointerDown($event, 'resize-b')"
        v-on="handleCommon"
      ></div>
      <div
        class="absolute top-2 bottom-2 left-0 w-1.5 cursor-ew-resize"
        @pointerdown.stop="onPointerDown($event, 'resize-l')"
        v-on="handleCommon"
      ></div>
      <div
        class="absolute top-2 bottom-2 right-0 w-1.5 cursor-ew-resize"
        @pointerdown.stop="onPointerDown($event, 'resize-r')"
        v-on="handleCommon"
      ></div>

      <!-- Corner handles -->
      <div
        class="absolute top-0 left-0 h-3 w-3 cursor-nwse-resize rounded-sm border border-bg bg-accent"
        role="slider"
        aria-label="Resize top-left"
        @pointerdown.stop="onPointerDown($event, 'resize-tl')"
        v-on="handleCommon"
      ></div>
      <div
        class="absolute top-0 right-0 h-3 w-3 cursor-nesw-resize rounded-sm border border-bg bg-accent"
        role="slider"
        aria-label="Resize top-right"
        @pointerdown.stop="onPointerDown($event, 'resize-tr')"
        v-on="handleCommon"
      ></div>
      <div
        class="absolute bottom-0 left-0 h-3 w-3 cursor-nesw-resize rounded-sm border border-bg bg-accent"
        role="slider"
        aria-label="Resize bottom-left"
        @pointerdown.stop="onPointerDown($event, 'resize-bl')"
        v-on="handleCommon"
      ></div>
      <div
        class="absolute bottom-0 right-0 h-3 w-3 cursor-nwse-resize rounded-sm border border-bg bg-accent"
        role="slider"
        aria-label="Resize bottom-right"
        @pointerdown.stop="onPointerDown($event, 'resize-br')"
        v-on="handleCommon"
      ></div>
    </template>
  </div>
</template>
