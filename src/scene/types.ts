import { nanoid } from 'nanoid';

// --- Source spec types ----------------------------------------------------

export type TextSpec = {
  content: string;
  font: string;
  size: number;
  weight: 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900;
  color: string;
  align: 'left' | 'center' | 'right';
  shadow: { enabled: boolean; color: string; blur: number; offsetY: number };
  outline: { enabled: boolean; color: string; width: number };
  letterSpacing: number;
};

export type TimerMode = 'countdown' | 'countup' | 'clock';
export type TimerFormat = 'mm:ss' | 'hh:mm:ss' | 'h:mm' | 'h:mm AM/PM';

export type TimerSpec = {
  mode: TimerMode;
  durationSec: number;
  format: TimerFormat;
  finishedText: string;
  style: Omit<TextSpec, 'content'>;
};

export type ImageFit = 'contain' | 'cover' | 'fill';

export type ErrorCorrectionLevel = 'L' | 'M' | 'Q' | 'H';

export type QrSpec = {
  data: string;
  fgColor: string;
  bgColor: string;
  radius: number;
  errorCorrection: ErrorCorrectionLevel;
  margin: number;
};

// --- Source union ---------------------------------------------------------

export type SourceType = 'web' | 'text' | 'timer' | 'image' | 'rect' | 'qr';

export type SourceBase = {
  id: string;
  name: string;
  x: number;
  y: number;
  w: number;
  h: number;
  visible: boolean;
  z: number;
  opacity: number;
};

export type WebSource = SourceBase & { type: 'web'; url: string };
export type TextSource = SourceBase & { type: 'text'; text: TextSpec };
export type TimerSource = SourceBase & { type: 'timer'; timer: TimerSpec };
export type ImageSource = SourceBase & {
  type: 'image';
  imageUrl: string;
  fit: ImageFit;
};
export type RectSource = SourceBase & {
  type: 'rect';
  color: string;
  radius: number;
};
export type QrSource = SourceBase & { type: 'qr'; qr: QrSpec };

export type Source =
  | WebSource
  | TextSource
  | TimerSource
  | ImageSource
  | RectSource
  | QrSource;

export type Scene = {
  v: 3;
  id: string;
  name: string;
  canvas: { w: number; h: number };
  sources: Source[];
  updatedAt: number;
};

export type Library = {
  v: 3;
  activeId: string;
  scenes: Scene[];
};

export const SCENE_VERSION = 3 as const;
export const LIBRARY_VERSION = 3 as const;

export const DEFAULT_CANVAS = { w: 1920, h: 1080 } as const;

// --- Default text style (shared between Text and Timer) -------------------

export function defaultTextStyle(): Omit<TextSpec, 'content'> {
  return {
    font: 'Inter',
    size: 64,
    weight: 600,
    color: '#EDEDF2',
    align: 'center',
    shadow: {
      enabled: false,
      color: 'rgba(0,0,0,0.6)',
      blur: 8,
      offsetY: 2,
    },
    outline: {
      enabled: false,
      color: '#000000',
      width: 2,
    },
    letterSpacing: 0,
  };
}

// --- Default factories per source type ------------------------------------

function defaultBase(z: number): Omit<SourceBase, 'id'> {
  return {
    name: '',
    x: 0.35,
    y: 0.4,
    w: 0.3,
    h: 0.2,
    visible: true,
    z,
    opacity: 1,
  };
}

export function defaultWebSource(url: string, z: number): Omit<WebSource, 'id'> {
  let name = url;
  try {
    name = new URL(url).hostname.replace(/^www\./, '');
  } catch {
    // keep raw url as name
  }
  return {
    ...defaultBase(z),
    type: 'web',
    name,
    url,
    // Web sources default to the v2 placement
    x: 0.05,
    y: 0.05,
    w: 0.3,
    h: 0.25,
  };
}

export function defaultTextSource(z: number): Omit<TextSource, 'id'> {
  return {
    ...defaultBase(z),
    type: 'text',
    name: 'Text',
    w: 0.4,
    h: 0.12,
    text: {
      ...defaultTextStyle(),
      content: 'Stackr',
    },
  };
}

export function defaultTimerSource(z: number): Omit<TimerSource, 'id'> {
  return {
    ...defaultBase(z),
    type: 'timer',
    name: 'Timer',
    w: 0.25,
    h: 0.12,
    timer: {
      mode: 'countdown',
      durationSec: 300,
      format: 'mm:ss',
      finishedText: '00:00',
      style: defaultTextStyle(),
    },
  };
}

export function defaultImageSource(url: string, z: number): Omit<ImageSource, 'id'> {
  return {
    ...defaultBase(z),
    type: 'image',
    name: 'Image',
    w: 0.2,
    h: 0.2,
    imageUrl: url,
    fit: 'contain',
  };
}

export function defaultRectSource(z: number): Omit<RectSource, 'id'> {
  return {
    ...defaultBase(z),
    type: 'rect',
    name: 'Rectangle',
    w: 0.4,
    h: 0.1,
    color: 'rgba(11,11,15,0.7)',
    radius: 8,
  };
}

export function defaultQrSource(z: number): Omit<QrSource, 'id'> {
  return {
    ...defaultBase(z),
    type: 'qr',
    name: 'QR code',
    w: 0.15,
    h: 0.15 * (1920 / 1080), // square in canvas-pixel terms
    qr: {
      data: 'https://example.com',
      fgColor: '#EDEDF2',
      bgColor: 'transparent',
      radius: 0.3,
      errorCorrection: 'H',
      margin: 2,
    },
  };
}

// --- Scene & library factories --------------------------------------------

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

// --- Migrations -----------------------------------------------------------

// v1 — a single bare scene at storage key stackr.scene.v1
type V1Source = {
  id: string;
  name: string;
  url: string;
  x: number;
  y: number;
  w: number;
  h: number;
  visible: boolean;
  z: number;
  opacity?: number;
};
type V1Scene = {
  v: 1;
  canvas: { w: number; h: number };
  sources: V1Source[];
};

// v2 — a scene with explicit id/name/updatedAt; sources are URL-only
type V2Source = V1Source & { opacity: number };
type V2Scene = {
  v: 2;
  id: string;
  name: string;
  canvas: { w: number; h: number };
  sources: V2Source[];
  updatedAt: number;
};
type V2Library = {
  v: 2;
  activeId: string;
  scenes: V2Scene[];
};

function isV1Scene(x: unknown): x is V1Scene {
  if (!x || typeof x !== 'object') return false;
  const o = x as { v?: unknown; sources?: unknown };
  return o.v === 1 && Array.isArray(o.sources);
}

function isV2Scene(x: unknown): x is V2Scene {
  if (!x || typeof x !== 'object') return false;
  const o = x as { v?: unknown; sources?: unknown };
  return o.v === 2 && Array.isArray(o.sources);
}

function isV2Library(x: unknown): x is V2Library {
  if (!x || typeof x !== 'object') return false;
  const o = x as { v?: unknown; scenes?: unknown };
  return o.v === 2 && Array.isArray(o.scenes);
}

function migrateV2Source(s: V2Source): WebSource {
  return {
    type: 'web',
    id: s.id,
    name: s.name,
    url: s.url,
    x: s.x,
    y: s.y,
    w: s.w,
    h: s.h,
    visible: s.visible,
    z: s.z,
    opacity: typeof s.opacity === 'number' ? s.opacity : 1,
  };
}

function migrateV2Scene(scene: V2Scene): Scene {
  return {
    v: SCENE_VERSION,
    id: scene.id,
    name: scene.name,
    canvas: { ...scene.canvas },
    sources: scene.sources.map(migrateV2Source),
    updatedAt: scene.updatedAt,
  };
}

export function migrateV1Scene(v1: V1Scene, name = 'My scene'): Scene {
  return {
    v: SCENE_VERSION,
    id: nanoid(8),
    name,
    canvas: { ...v1.canvas },
    sources: v1.sources.map<WebSource>((s) => ({
      type: 'web',
      id: s.id,
      name: s.name,
      url: s.url,
      x: s.x,
      y: s.y,
      w: s.w,
      h: s.h,
      visible: s.visible,
      z: s.z,
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

export function migrateV2Library(lib: V2Library): Library {
  return {
    v: LIBRARY_VERSION,
    activeId: lib.activeId,
    scenes: lib.scenes.map(migrateV2Scene),
  };
}

export function tryMigrateV2Library(raw: string): Library | null {
  try {
    const parsed = JSON.parse(raw);
    if (!isV2Library(parsed)) return null;
    return migrateV2Library(parsed);
  } catch {
    return null;
  }
}

/**
 * Best-effort migration of an arbitrary parsed scene object to v3.
 * Used by the URL decoder to accept v1, v2, and v3 payloads.
 */
export function migrateSceneIfNeeded(parsed: unknown): Scene | null {
  if (!parsed || typeof parsed !== 'object') return null;
  const v = (parsed as { v?: unknown }).v;
  if (v === SCENE_VERSION) {
    return parsed as Scene;
  }
  if (isV2Scene(parsed)) return migrateV2Scene(parsed);
  if (isV1Scene(parsed)) return migrateV1Scene(parsed);
  return null;
}
