<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue';
import { useScene } from '@/composables/useScene';
import DraggableSource from './DraggableSource.vue';
import EmptyState from './EmptyState.vue';

const { scene, sortedSources, selectedId, updateSource, addSource } = useScene();

const wrapper = ref<HTMLElement | null>(null);
const stage = ref<HTMLElement | null>(null);

const wrapperW = ref(0);
const wrapperH = ref(0);

const aspect = computed(() => scene.canvas.w / scene.canvas.h);

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
          @select="selectedId = $event"
          @update="(id, patch) => updateSource(id, patch)"
        />
      </template>
      <EmptyState v-else @add-sample="(url: string) => addSource(url)" />

      <div
        class="pointer-events-none absolute right-2 bottom-2 rounded bg-bg/70 px-1.5 py-0.5 font-mono text-[10px] text-faint backdrop-blur-sm"
      >
        {{ scene.canvas.w }}×{{ scene.canvas.h }}
      </div>
    </div>
  </div>
</template>
