import pako from 'pako';
import type { Scene } from '@/scene/types';
import { migrateSceneIfNeeded } from '@/scene/types';

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
    return migrateSceneIfNeeded(parsed);
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
  if (!trimmed.includes('#') && !/^https?:/i.test(trimmed)) {
    return trimmed;
  }
  try {
    const url = new URL(trimmed);
    if (url.hash.startsWith('#')) return url.hash.slice(1);
    return null;
  } catch {
    if (trimmed.startsWith('#')) return trimmed.slice(1);
    return null;
  }
}
