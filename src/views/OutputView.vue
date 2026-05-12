<script setup lang="ts">
import { computed, onMounted, onBeforeUnmount, provide, reactive, ref } from 'vue';
import { decodeScene } from '@/composables/useSceneEncoding';
import type { Scene, Source } from '@/scene/types';
import SourceWeb from '@/components/sources/SourceWeb.vue';
import SourceText from '@/components/sources/SourceText.vue';
import SourceTimer from '@/components/sources/SourceTimer.vue';
import SourceImage from '@/components/sources/SourceImage.vue';
import SourceRect from '@/components/sources/SourceRect.vue';
import SourceQr from '@/components/sources/SourceQr.vue';

const hash = ref(window.location.hash.startsWith('#') ? window.location.hash.slice(1) : '');

function onHashChange() {
  hash.value = window.location.hash.startsWith('#') ? window.location.hash.slice(1) : '';
}

const scene = computed<Scene | null>(() => decodeScene(hash.value));
const sorted = computed(() =>
  scene.value ? [...scene.value.sources].sort((a, b) => a.z - b.z) : [],
);

// /view renders at native canvas resolution (1080-px reference) — scale is 1.
provide('canvasScale', reactive({ value: 1 }));

function wrapperStyle(s: Source) {
  return {
    left: `${s.x * 100}%`,
    top: `${s.y * 100}%`,
    width: `${s.w * 100}%`,
    height: `${s.h * 100}%`,
    zIndex: s.z + 1,
    opacity: s.opacity ?? 1,
  };
}

// On the output route every layer above the iframes must be transparent,
// AND the root must not be in dark color-scheme — otherwise Chrome paints
// iframe canvases with a dark default, defeating transparency on pages
// that don't declare their own background.
// https://fvsch.com/transparent-iframes
function applyTransparentChrome() {
  if (!scene.value) return;
  document.documentElement.style.background = 'transparent';
  document.documentElement.style.colorScheme = 'light';
  document.documentElement.classList.remove('dark');
  document.body.style.background = 'transparent';
  const root = document.getElementById('app');
  if (root) root.style.background = 'transparent';
}
function clearTransparentChrome() {
  document.documentElement.style.background = '';
  document.documentElement.style.colorScheme = '';
  document.documentElement.classList.add('dark');
  document.body.style.background = '';
  const root = document.getElementById('app');
  if (root) root.style.background = '';
}

onMounted(() => {
  applyTransparentChrome();
  window.addEventListener('hashchange', onHashChange);
});
onBeforeUnmount(() => {
  clearTransparentChrome();
  window.removeEventListener('hashchange', onHashChange);
});
</script>

<template>
  <div v-if="scene" class="fixed inset-0 overflow-hidden bg-transparent">
    <template v-for="src in sorted" :key="src.id">
      <div
        v-if="src.visible"
        class="absolute"
        :style="wrapperStyle(src)"
      >
        <SourceWeb v-if="src.type === 'web'" :source="src" :reload-key="0" />
        <SourceText v-else-if="src.type === 'text'" :source="src" />
        <SourceTimer v-else-if="src.type === 'timer'" :source="src" />
        <SourceImage v-else-if="src.type === 'image'" :source="src" :reload-key="0" />
        <SourceRect v-else-if="src.type === 'rect'" :source="src" />
        <SourceQr v-else-if="src.type === 'qr'" :source="src" />
      </div>
    </template>
  </div>

  <div v-else class="flex h-full w-full items-center justify-center bg-bg p-6">
    <div class="panel max-w-md p-6 text-center">
      <h1 class="text-base font-medium text-text">No scene loaded</h1>
      <p class="mt-1 text-sm text-muted">
        This URL doesn't contain a valid scene. Head to the editor to build one.
      </p>
      <a
        href="/"
        class="mt-4 inline-flex items-center gap-1.5 rounded-md bg-accent px-3 py-1.5 text-sm font-medium text-bg transition-colors hover:bg-accent-hover"
      >
        Open editor
      </a>
    </div>
  </div>
</template>
