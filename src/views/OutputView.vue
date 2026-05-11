<script setup lang="ts">
import { computed, onMounted, onBeforeUnmount, ref } from 'vue';
import { decodeScene } from '@/composables/useSceneEncoding';
import type { Scene } from '@/scene/types';

const hash = ref(window.location.hash.startsWith('#') ? window.location.hash.slice(1) : '');

function onHashChange() {
  hash.value = window.location.hash.startsWith('#') ? window.location.hash.slice(1) : '';
}

const scene = computed<Scene | null>(() => decodeScene(hash.value));
const sorted = computed(() => (scene.value ? [...scene.value.sources].sort((a, b) => a.z - b.z) : []));

// On the output route every layer above the iframes must be transparent,
// AND the root must not be in dark color-scheme — otherwise Chrome paints
// iframe canvases with a dark default, defeating transparency on pages
// that don't declare their own background. See:
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
      <iframe
        v-if="src.visible"
        :src="src.url"
        :title="src.name"
        class="absolute border-0"
        :style="{
          left: `${src.x * 100}%`,
          top: `${src.y * 100}%`,
          width: `${src.w * 100}%`,
          height: `${src.h * 100}%`,
          zIndex: src.z + 1,
          background: 'transparent',
          colorScheme: 'light',
        }"
        allow="autoplay; encrypted-media; clipboard-read; clipboard-write"
        sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
        referrerpolicy="no-referrer-when-downgrade"
      ></iframe>
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
