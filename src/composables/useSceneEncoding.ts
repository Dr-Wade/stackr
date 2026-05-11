import pako from 'pako';
import type { Scene } from '@/scene/types';
import { SCENE_VERSION } from '@/scene/types';

function base64UrlEncode(bytes: Uint8Array): string {
  let bin = '';
  for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function base64UrlDecode(str: string): Uint8Array {
  const pad = str.length % 4 === 0 ? '' : '='.repeat(4 - (str.length % 4));
  const b64 = (str + pad).replace(/-/g, '+').replace(/_/g, '/');
  const bin = atob(b64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return bytes;
}

export function encodeScene(scene: Scene): string {
  const json = JSON.stringify(scene);
  const deflated = pako.deflate(new TextEncoder().encode(json));
  return base64UrlEncode(deflated);
}

export function decodeScene(payload: string): Scene | null {
  if (!payload) return null;
  try {
    const bytes = base64UrlDecode(payload);
    const json = new TextDecoder().decode(pako.inflate(bytes));
    const parsed = JSON.parse(json);
    if (!parsed || typeof parsed !== 'object') return null;
    if (parsed.v !== SCENE_VERSION) return null;
    if (!Array.isArray(parsed.sources)) return null;
    return parsed as Scene;
  } catch {
    return null;
  }
}
