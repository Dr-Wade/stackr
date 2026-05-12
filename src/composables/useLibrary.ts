import { reactive, computed, watch } from 'vue';
import { useDebounceFn } from '@vueuse/core';
import { nanoid } from 'nanoid';
import {
  emptyLibrary,
  emptyScene,
  tryMigrateV1Scene,
  tryMigrateV2Library,
  LIBRARY_VERSION,
  SCENE_VERSION,
  type Library,
  type Scene,
} from '@/scene/types';
import { decodeScene, extractEncodedFromUrl } from './useSceneEncoding';

const LIBRARY_KEY = 'stackr.library.v3';
const LEGACY_V2_KEY = 'stackr.library.v2';
const LEGACY_V1_KEY = 'stackr.scene.v1';

function loadLibrary(): Library {
  // 1. Native v3 library
  try {
    const raw = localStorage.getItem(LIBRARY_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Library;
      if (
        parsed.v === LIBRARY_VERSION &&
        Array.isArray(parsed.scenes) &&
        parsed.scenes.length > 0
      ) {
        return parsed;
      }
    }
  } catch {
    // fall through
  }

  // 2. v2 library → migrate
  try {
    const v2Raw = localStorage.getItem(LEGACY_V2_KEY);
    if (v2Raw) {
      const migrated = tryMigrateV2Library(v2Raw);
      if (migrated) {
        localStorage.removeItem(LEGACY_V2_KEY);
        return migrated;
      }
      localStorage.removeItem(LEGACY_V2_KEY);
    }
  } catch {
    // fall through
  }

  // 3. v1 single-scene → wrap as library + migrate
  try {
    const v1Raw = localStorage.getItem(LEGACY_V1_KEY);
    if (v1Raw) {
      const migrated = tryMigrateV1Scene(v1Raw);
      if (migrated) {
        migrated.name = 'My scene';
        const lib: Library = {
          v: LIBRARY_VERSION,
          activeId: migrated.id,
          scenes: [migrated],
        };
        localStorage.removeItem(LEGACY_V1_KEY);
        return lib;
      }
      localStorage.removeItem(LEGACY_V1_KEY);
    }
  } catch {
    // fall through
  }

  // 4. Fresh empty library
  return emptyLibrary();
}

const library = reactive<Library>(loadLibrary());

const persist = useDebounceFn(() => {
  try {
    localStorage.setItem(LIBRARY_KEY, JSON.stringify(library));
  } catch {
    // localStorage unavailable — silently skip
  }
}, 250);

watch(library, () => persist(), { deep: true });

const activeScene = computed<Scene>(() => {
  const found = library.scenes.find((s) => s.id === library.activeId);
  return found ?? library.scenes[0];
});

function uniqueName(base: string): string {
  const existing = new Set(library.scenes.map((s) => s.name));
  if (!existing.has(base)) return base;
  for (let i = 2; i < 1000; i++) {
    const candidate = `${base} ${i}`;
    if (!existing.has(candidate)) return candidate;
  }
  return `${base} ${Date.now()}`;
}

function setActive(id: string) {
  if (library.scenes.some((s) => s.id === id)) library.activeId = id;
}

function createScene(name?: string): Scene {
  const scene = emptyScene(uniqueName(name?.trim() || 'New scene'));
  library.scenes.push(scene);
  library.activeId = scene.id;
  return scene;
}

function renameScene(id: string, name: string) {
  const scene = library.scenes.find((s) => s.id === id);
  if (!scene) return;
  const trimmed = name.trim();
  if (!trimmed) return;
  scene.name = trimmed;
  scene.updatedAt = Date.now();
}

function duplicateScene(id: string): Scene | null {
  const scene = library.scenes.find((s) => s.id === id);
  if (!scene) return null;
  const copy: Scene = {
    v: SCENE_VERSION,
    id: nanoid(8),
    name: uniqueName(`${scene.name} copy`),
    canvas: { ...scene.canvas },
    sources: scene.sources.map((src) => ({ ...src, id: nanoid(8) })),
    updatedAt: Date.now(),
  };
  library.scenes.push(copy);
  library.activeId = copy.id;
  return copy;
}

function deleteScene(id: string) {
  const idx = library.scenes.findIndex((s) => s.id === id);
  if (idx < 0) return;
  library.scenes.splice(idx, 1);
  if (library.scenes.length === 0) {
    const fresh = emptyScene('My scene');
    library.scenes.push(fresh);
    library.activeId = fresh.id;
    return;
  }
  if (library.activeId === id) {
    const fallback = library.scenes[Math.min(idx, library.scenes.length - 1)];
    library.activeId = fallback.id;
  }
}

type ImportResult =
  | { ok: true; scene: Scene }
  | { ok: false; reason: 'empty' | 'invalid' };

function importSceneFromUrl(input: string, nameHint?: string): ImportResult {
  if (!input.trim()) return { ok: false, reason: 'empty' };
  const payload = extractEncodedFromUrl(input);
  if (!payload) return { ok: false, reason: 'invalid' };
  const decoded = decodeScene(payload);
  if (!decoded) return { ok: false, reason: 'invalid' };
  const scene: Scene = {
    ...decoded,
    id: nanoid(8),
    name: uniqueName(nameHint?.trim() || decoded.name || 'Imported scene'),
    updatedAt: Date.now(),
  };
  library.scenes.push(scene);
  library.activeId = scene.id;
  return { ok: true, scene };
}

export function useLibrary() {
  return {
    library,
    activeScene,
    setActive,
    createScene,
    renameScene,
    duplicateScene,
    deleteScene,
    importSceneFromUrl,
  };
}
