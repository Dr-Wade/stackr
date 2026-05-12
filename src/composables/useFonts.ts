/**
 * Runtime font loader using the Bunny Fonts CDN.
 *
 * Components call ensureFont('Bebas Neue') and a <link> tag is appended to
 * <head> if that family hasn't been requested yet. Subsequent calls for the
 * same family are no-ops. The editor and /view both go through this path, so
 * the same font shows up wherever it's used.
 *
 * font-display: block is chosen over swap so the fallback flash is invisible
 * for the first 3s — text appears blank, then in the chosen font. After 3s
 * the browser falls back to system default. The tradeoff: a blank moment is
 * less jarring than a re-flow that changes layout for the recording.
 */

const BUNNY_ORIGIN = 'https://fonts.bunny.net';
const WEIGHTS = '300;400;500;600;700;800';

const loaded = new Set<string>();
// Bundled local fonts that don't need a remote fetch.
const BUNDLED = new Set<string>(['Inter', 'JetBrains Mono']);

function bunnyFamilyParam(family: string): string {
  // Bunny accepts spaces as + or %20 in the family name.
  return family.trim().replace(/\s+/g, '+');
}

function bunnyHref(family: string): string {
  return `${BUNNY_ORIGIN}/css?family=${bunnyFamilyParam(family)}:wght@${WEIGHTS}&display=block`;
}

export function ensureFont(family: string | undefined | null): void {
  if (typeof document === 'undefined') return;
  if (!family) return;
  const f = family.trim();
  if (!f) return;
  if (BUNDLED.has(f)) return;
  if (loaded.has(f)) return;

  loaded.add(f);
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = bunnyHref(f);
  link.setAttribute('data-stackr-font', f);
  document.head.appendChild(link);
}

/**
 * Returns a CSS font-family value that quotes multi-word names and adds a
 * sensible fallback chain.
 */
export function fontFamilyValue(family: string | undefined | null): string {
  const f = (family ?? '').trim();
  if (!f) return 'var(--font-ui)';
  const quoted = /\s/.test(f) ? `"${f}"` : f;
  return `${quoted}, var(--font-ui)`;
}
