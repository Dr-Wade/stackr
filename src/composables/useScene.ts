import { computed, reactive, ref, watch } from 'vue';
import { nanoid } from 'nanoid';
import { defaultSource, type Source } from '@/scene/types';
import { useLibrary } from './useLibrary';
import { probeUrl } from './usePreflight';

const { activeScene } = useLibrary();
const selectedId = ref<string | null>(null);

// Per-source reload counters. Bumping these forces the iframe :key to change,
// triggering a clean reload without affecting other sources.
const reloadKeys = reactive<Record<string, number>>({});

function getReloadKey(id: string): number {
  return reloadKeys[id] ?? 0;
}

function reloadSource(id: string) {
  reloadKeys[id] = (reloadKeys[id] ?? 0) + 1;
}

// Reset selection when the active scene changes — a selectedId from scene A
// would otherwise leak into scene B.
watch(
  () => activeScene.value.id,
  () => {
    selectedId.value = null;
  },
);

function clamp01(n: number): number {
  return Math.min(1, Math.max(0, n));
}

function touch() {
  activeScene.value.updatedAt = Date.now();
}

function addSource(url: string): Source {
  const scene = activeScene.value;
  const z = scene.sources.length
    ? Math.max(...scene.sources.map((s) => s.z)) + 1
    : 0;
  const src: Source = { id: nanoid(8), ...defaultSource(url, z) };
  scene.sources.push(src);
  selectedId.value = src.id;
  touch();
  probeUrl(src.id, url);
  return src;
}

function removeSource(id: string): Source | null {
  const scene = activeScene.value;
  const idx = scene.sources.findIndex((s) => s.id === id);
  if (idx < 0) return null;
  const [removed] = scene.sources.splice(idx, 1);
  if (selectedId.value === id) selectedId.value = null;
  touch();
  return removed;
}

function restoreSource(source: Source, atIndex: number) {
  const scene = activeScene.value;
  const idx = Math.max(0, Math.min(atIndex, scene.sources.length));
  scene.sources.splice(idx, 0, source);
  touch();
}

function duplicateSource(id: string): Source | null {
  const scene = activeScene.value;
  const src = scene.sources.find((s) => s.id === id);
  if (!src) return null;
  const maxZ = scene.sources.length
    ? Math.max(...scene.sources.map((s) => s.z)) + 1
    : 0;
  const copy: Source = {
    ...src,
    id: nanoid(8),
    name: `${src.name} copy`,
    // Nudge the duplicate so it's visibly distinct.
    x: clamp01(src.x + 0.02),
    y: clamp01(src.y + 0.02),
    z: maxZ,
  };
  scene.sources.push(copy);
  selectedId.value = copy.id;
  touch();
  return copy;
}

function indexOfSource(id: string): number {
  return activeScene.value.sources.findIndex((s) => s.id === id);
}

function updateSource(id: string, patch: Partial<Source>) {
  const scene = activeScene.value;
  const src = scene.sources.find((s) => s.id === id);
  if (!src) return;
  if (patch.x !== undefined) patch.x = clamp01(patch.x);
  if (patch.y !== undefined) patch.y = clamp01(patch.y);
  if (patch.w !== undefined) patch.w = Math.max(0.02, clamp01(patch.w));
  if (patch.h !== undefined) patch.h = Math.max(0.02, clamp01(patch.h));
  if (patch.opacity !== undefined) patch.opacity = clamp01(patch.opacity);
  Object.assign(src, patch);
  touch();
}

function moveSource(id: string, dir: 'up' | 'down') {
  const scene = activeScene.value;
  const idx = scene.sources.findIndex((s) => s.id === id);
  if (idx < 0) return;
  const target = dir === 'up' ? idx - 1 : idx + 1;
  if (target < 0 || target >= scene.sources.length) return;
  const [item] = scene.sources.splice(idx, 1);
  scene.sources.splice(target, 0, item);
  scene.sources.forEach((s, i) => (s.z = i));
  touch();
}

function clearAll() {
  const scene = activeScene.value;
  scene.sources.splice(0, scene.sources.length);
  selectedId.value = null;
  touch();
}

export type NudgeStep = 'fine' | 'normal' | 'coarse';
const NUDGE_STEPS: Record<NudgeStep, number> = {
  fine: 0.001,
  normal: 0.01,
  coarse: 0.1,
};

function nudgeSelected(dx: number, dy: number, step: NudgeStep = 'normal') {
  const id = selectedId.value;
  if (!id) return;
  const scene = activeScene.value;
  const src = scene.sources.find((s) => s.id === id);
  if (!src) return;
  const amt = NUDGE_STEPS[step];
  updateSource(id, { x: src.x + dx * amt, y: src.y + dy * amt });
}

const scene = computed(() => activeScene.value);
const sortedSources = computed(() =>
  [...activeScene.value.sources].sort((a, b) => a.z - b.z),
);

const selectedSource = computed<Source | null>(() => {
  const id = selectedId.value;
  if (!id) return null;
  return activeScene.value.sources.find((s) => s.id === id) ?? null;
});

export function useScene() {
  return {
    scene,
    sortedSources,
    selectedId,
    selectedSource,
    addSource,
    removeSource,
    restoreSource,
    duplicateSource,
    updateSource,
    moveSource,
    clearAll,
    nudgeSelected,
    indexOfSource,
    getReloadKey,
    reloadSource,
  };
}
