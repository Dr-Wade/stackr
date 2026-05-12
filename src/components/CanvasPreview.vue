<script setup lang="ts">
import { provide, reactive, ref, computed, onMounted, onBeforeUnmount, watch } from 'vue';
import { useScene } from '@/composables/useScene';
import type { SnapGuide } from '@/composables/useSnap';
import DraggableSource from './DraggableSource.vue';
import EmptyState from './EmptyState.vue';
import SnapGuides from './SnapGuides.vue';

const { scene, sortedSources, selectedId, updateSource, getReloadKey } = useScene();

const wrapper = ref<HTMLElement | null>(null);
const stage = ref<HTMLElement | null>(null);

const wrapperW = ref(0);
const wrapperH = ref(0);

const activeGuides = ref<SnapGuide[]>([]);

const aspect = computed(() => scene.value.canvas.w / scene.value.canvas.h);

const stageSize = computed(() => {
  if (!wrapperW.value || !wrapperH.value) return { w: 0, h: 0 };
  const a = aspect.value;
  let w = wrapperW.value;
  let h = wrapperW.value / a;
  if (h > wrapperH.value) {
    h = wrapperH.value;
    w = wrapperH.value * a;
  }
  return { w: Math.floor(w), h: Math.floor(h) };
});

// Provide canvas scale (screen px / canvas px) for type-native components
// (text size, rect radius). A reactive object so .value updates flow.
const canvasScale = reactive({ value: 1 });
watch(
  () => [stageSize.value.h, scene.value.canvas.h],
  ([sh, ch]) => {
    if (sh && ch) canvasScale.value = sh / ch;
  },
  { immediate: true },
);
provide('canvasScale', canvasScale);

function siblingsFor(currentId: string) {
  return sortedSources.value
    .filter((s) => s.id !== currentId)
    .map((s) => ({ x: s.x, y: s.y, w: s.w, h: s.h }));
}

let resizeObserver: ResizeObserver | null = null;

onMounted(() => {
  if (!wrapper.value) return;
  resizeObserver = new ResizeObserver(([entry]) => {
    const cr = entry.contentRect;
    wrapperW.value = cr.width;
    wrapperH.value = cr.height;
  });
  resizeObserver.observe(wrapper.value);
});

onBeforeUnmount(() => {
  resizeObserver?.disconnect();
  resizeObserver = null;
});

function deselect(e: MouseEvent) {
  if (e.target === stage.value) selectedId.value = null;
}
</script>

<template>
  <div ref="wrapper" class="relative flex h-full w-full items-center justify-center p-4">
    <div
      ref="stage"
      class="checker relative overflow-hidden rounded-lg border border-border-strong shadow-[0_30px_80px_-30px_rgba(0,0,0,0.6)]"
      :style="{ width: `${stageSize.w}px`, height: `${stageSize.h}px` }"
      @mousedown="deselect"
    >
      <template v-if="sortedSources.length > 0">
        <DraggableSource
          v-for="src in sortedSources"
          :key="src.id"
          :source="src"
          :container-width="stageSize.w"
          :container-height="stageSize.h"
          :selected="selectedId === src.id"
          :siblings="siblingsFor(src.id)"
          :reload-key="getReloadKey(src.id)"
          @select="selectedId = $event"
          @update="(id, patch) => updateSource(id, patch)"
          @drag-guides="(g) => (activeGuides = g)"
          @drag-end="activeGuides = []"
        />
      </template>
      <EmptyState v-else />

      <SnapGuides :guides="activeGuides" />

      <div
        class="pointer-events-none absolute right-2 bottom-2 rounded bg-bg/70 px-1.5 py-0.5 font-mono text-[10px] text-faint backdrop-blur-sm"
      >
        {{ scene.canvas.w }}×{{ scene.canvas.h }}
      </div>
    </div>
  </div>
</template>
