import { reactive, watch, computed, ref } from 'vue';
import { useDebounceFn } from '@vueuse/core';
import { nanoid } from 'nanoid';
import { emptyScene, defaultSource, type Scene, type Source } from '@/scene/types';

const STORAGE_KEY = 'stackr.scene.v1';

function loadFromStorage(): Scene {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return emptyScene();
    const parsed = JSON.parse(raw) as Scene;
    if (parsed.v !== 1 || !Array.isArray(parsed.sources)) return emptyScene();
    return parsed;
  } catch {
    return emptyScene();
  }
}

const scene = reactive<Scene>(loadFromStorage());
const selectedId = ref<string | null>(null);

const persist = useDebounceFn(() => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(scene));
  } catch {
    // localStorage unavailable (privacy mode etc.) — silently skip
  }
}, 250);

watch(scene, () => persist(), { deep: true });

function clamp01(n: number): number {
  return Math.min(1, Math.max(0, n));
}

function addSource(url: string): Source {
  const z = scene.sources.length
    ? Math.max(...scene.sources.map((s) => s.z)) + 1
    : 0;
  const src: Source = { id: nanoid(8), ...defaultSource(url, z) };
  scene.sources.push(src);
  selectedId.value = src.id;
  return src;
}

function removeSource(id: string) {
  const idx = scene.sources.findIndex((s) => s.id === id);
  if (idx >= 0) scene.sources.splice(idx, 1);
  if (selectedId.value === id) selectedId.value = null;
}

function updateSource(id: string, patch: Partial<Source>) {
  const src = scene.sources.find((s) => s.id === id);
  if (!src) return;
  if (patch.x !== undefined) patch.x = clamp01(patch.x);
  if (patch.y !== undefined) patch.y = clamp01(patch.y);
  if (patch.w !== undefined) patch.w = Math.max(0.02, clamp01(patch.w));
  if (patch.h !== undefined) patch.h = Math.max(0.02, clamp01(patch.h));
  Object.assign(src, patch);
}

function moveSource(id: string, dir: 'up' | 'down') {
  const idx = scene.sources.findIndex((s) => s.id === id);
  if (idx < 0) return;
  const target = dir === 'up' ? idx - 1 : idx + 1;
  if (target < 0 || target >= scene.sources.length) return;
  const [item] = scene.sources.splice(idx, 1);
  scene.sources.splice(target, 0, item);
  scene.sources.forEach((s, i) => (s.z = i));
}

function clearAll() {
  scene.sources.splice(0, scene.sources.length);
  selectedId.value = null;
}

const sortedSources = computed(() =>
  [...scene.sources].sort((a, b) => a.z - b.z),
);

export function useScene() {
  return {
    scene,
    sortedSources,
    selectedId,
    addSource,
    removeSource,
    updateSource,
    moveSource,
    clearAll,
  };
}
