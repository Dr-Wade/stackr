/**
 * Curated list of fonts available via the Bunny Fonts CDN.
 * Bunny Fonts re-hosts the Google Fonts library with GDPR-friendly headers
 * and the same URL shape: https://fonts.bunny.net/css?family=<Name>:wght@…
 */
export const CURATED_FONTS = [
  // Body / UI
  'Inter',
  'Roboto',
  'Open Sans',
  'Montserrat',
  // Display / condensed
  'Bebas Neue',
  'Oswald',
  'Anton',
  // Serif
  'Lora',
  'Playfair Display',
  'Merriweather',
  // Hand / script
  'Pacifico',
  'Caveat',
  'Permanent Marker',
  'Bangers',
  // Mono / retro
  'JetBrains Mono',
  'Press Start 2P',
] as const;

export type CuratedFont = (typeof CURATED_FONTS)[number];

export const DEFAULT_FONT: CuratedFont = 'Inter';
