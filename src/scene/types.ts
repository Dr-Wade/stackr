import { nanoid } from 'nanoid';

export type Source = {
  id: string;
  name: string;
  url: string;
  x: number;
  y: number;
  w: number;
  h: number;
  visible: boolean;
  z: number;
  opacity: number;
};

export type Scene = {
  v: 2;
  id: string;
  name: string;
  canvas: { w: number; h: number };
  sources: Source[];
  updatedAt: number;
};

export type Library = {
  v: 2;
  activeId: string;
  scenes: Scene[];
};

export const SCENE_VERSION = 2 as const;
export const LIBRARY_VERSION = 2 as const;

export const DEFAULT_CANVAS = { w: 1920, h: 1080 } as const;

export function emptyScene(name = 'Untitled scene'): Scene {
  return {
    v: SCENE_VERSION,
    id: nanoid(8),
    name,
    canvas: { ...DEFAULT_CANVAS },
    sources: [],
    updatedAt: Date.now(),
  };
}

export function emptyLibrary(): Library {
  const first = emptyScene('My scene');
  return {
    v: LIBRARY_VERSION,
    activeId: first.id,
    scenes: [first],
  };
}

export function defaultSource(url: string, z: number): Omit<Source, 'id'> {
  let name = url;
  try {
    name = new URL(url).hostname.replace(/^www\./, '');
  } catch {
    // keep raw url as name
  }
  return {
    name,
    url,
    x: 0.05,
    y: 0.05,
    w: 0.3,
    h: 0.25,
    visible: true,
    z,
    opacity: 1,
  };
}

// --- v1 → v2 migration ---------------------------------------------------

type V1Source = Omit<Source, 'opacity'> & { opacity?: number };
type V1Scene = {
  v: 1;
  canvas: { w: number; h: number };
  sources: V1Source[];
};

function isV1Scene(x: unknown): x is V1Scene {
  if (!x || typeof x !== 'object') return false;
  const o = x as { v?: unknown; sources?: unknown };
  return o.v === 1 && Array.isArray(o.sources);
}

export function migrateV1Scene(v1: V1Scene, name = 'My scene'): Scene {
  return {
    v: SCENE_VERSION,
    id: nanoid(8),
    name,
    canvas: { ...v1.canvas },
    sources: v1.sources.map((s) => ({
      ...s,
      opacity: typeof s.opacity === 'number' ? s.opacity : 1,
    })),
    updatedAt: Date.now(),
  };
}

export function tryMigrateV1Scene(raw: string): Scene | null {
  try {
    const parsed = JSON.parse(raw);
    if (!isV1Scene(parsed)) return null;
    return migrateV1Scene(parsed);
  } catch {
    return null;
  }
}
