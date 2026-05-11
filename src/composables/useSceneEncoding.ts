import pako from 'pako';
import type { Scene } from '@/scene/types';
import { SCENE_VERSION, migrateV1Scene } from '@/scene/types';

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

    // v2: native
    if (parsed.v === SCENE_VERSION && Array.isArray(parsed.sources)) {
      // Tolerate missing opacity on individual sources
      return {
        ...parsed,
        sources: parsed.sources.map((s: { opacity?: number }) => ({
          ...s,
          opacity: typeof s.opacity === 'number' ? s.opacity : 1,
        })),
      } as Scene;
    }

    // v1: migrate (used by Import-from-URL on legacy URLs shared from v1 deploys)
    if (parsed.v === 1 && Array.isArray(parsed.sources)) {
      return migrateV1Scene(parsed);
    }

    return null;
  } catch {
    return null;
  }
}

/**
 * Extracts an encoded scene payload from a `/view#…` URL, or returns the
 * input as-is if the user pasted the raw payload. Returns null on shapes we
 * don't recognise.
 */
export function extractEncodedFromUrl(input: string): string | null {
  const trimmed = input.trim();
  if (!trimmed) return null;
  // Bare payload (no #)
  if (!trimmed.includes('#') && !/^https?:/i.test(trimmed)) {
    return trimmed;
  }
  try {
    const url = new URL(trimmed);
    if (url.hash.startsWith('#')) return url.hash.slice(1);
    return null;
  } catch {
    // Maybe a hash fragment with leading '#'
    if (trimmed.startsWith('#')) return trimmed.slice(1);
    return null;
  }
}
