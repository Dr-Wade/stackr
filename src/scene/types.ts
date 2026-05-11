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
};

export type Scene = {
  v: 1;
  canvas: { w: number; h: number };
  sources: Source[];
};

export const SCENE_VERSION = 1 as const;

export const DEFAULT_CANVAS = { w: 1920, h: 1080 } as const;

export function emptyScene(): Scene {
  return {
    v: SCENE_VERSION,
    canvas: { ...DEFAULT_CANVAS },
    sources: [],
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
  };
}
