import { computed, reactive, ref, watch } from 'vue';
import { nanoid } from 'nanoid';
import {
  defaultWebSource,
  defaultTextSource,
  defaultTimerSource,
  defaultImageSource,
  defaultRectSource,
  defaultQrSource,
  type Source,
  type WebSource,
  type TextSource,
  type TimerSource,
  type ImageSource,
  type RectSource,
  type QrSource,
} from '@/scene/types';
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

function nextZ(): number {
  const scene = activeScene.value;
  return scene.sources.length
    ? Math.max(...scene.sources.map((s) => s.z)) + 1
    : 0;
}

// --- addSource overloads, discriminated on `type` -------------------------

export type AddInput =
  | { type: 'web'; url: string }
  | { type: 'text' }
  | { type: 'timer' }
  | { type: 'image'; url: string }
  | { type: 'rect' }
  | { type: 'qr' };

export function addSource(input: { type: 'web'; url: string }): WebSource;
export function addSource(input: { type: 'text' }): TextSource;
export function addSource(input: { type: 'timer' }): TimerSource;
export function addSource(input: { type: 'image'; url: string }): ImageSource;
export function addSource(input: { type: 'rect' }): RectSource;
export function addSource(input: { type: 'qr' }): QrSource;
export function addSource(input: AddInput): Source {
  const scene = activeScene.value;
  const z = nextZ();
  let src: Source;
  switch (input.type) {
    case 'web': {
      src = { id: nanoid(8), ...defaultWebSource(input.url, z) };
      break;
    }
    case 'text': {
      src = { id: nanoid(8), ...defaultTextSource(z) };
      break;
    }
    case 'timer': {
      src = { id: nanoid(8), ...defaultTimerSource(z) };
      break;
    }
    case 'image': {
      src = { id: nanoid(8), ...defaultImageSource(input.url, z) };
      break;
    }
    case 'rect': {
      src = { id: nanoid(8), ...defaultRectSource(z) };
      break;
    }
    case 'qr': {
      src = { id: nanoid(8), ...defaultQrSource(z) };
      break;
    }
  }
  scene.sources.push(src);
  selectedId.value = src.id;
  touch();
  if (src.type === 'web') probeUrl(src.id, src.url);
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
  const maxZ = nextZ();
  const copy: Source = {
    ...src,
    id: nanoid(8),
    name: `${src.name} copy`,
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

// Patch type intentionally broad: a typed patch per source type would be
// strict to define and the runtime is forgiving — we accept any subset of
// the fields and the type-specific renderers ignore irrelevant changes.
type SourcePatch = Partial<Source> & Record<string, unknown>;

function updateSource(id: string, patch: SourcePatch) {
  const scene = activeScene.value;
  const src = scene.sources.find((s) => s.id === id);
  if (!src) return;
  if (typeof patch.x === 'number') patch.x = clamp01(patch.x);
  if (typeof patch.y === 'number') patch.y = clamp01(patch.y);
  if (typeof patch.w === 'number') patch.w = Math.max(0.02, clamp01(patch.w));
  if (typeof patch.h === 'number') patch.h = Math.max(0.02, clamp01(patch.h));
  if (typeof patch.opacity === 'number') patch.opacity = clamp01(patch.opacity);
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
