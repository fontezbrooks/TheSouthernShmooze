/**
 * Design tokens for The Southern Shmooze — sourced from the designlang extraction
 * (`design-extract-output/`) reconciled against the live site. See
 * `docs/architecture/README.md` §9.
 */

export const colors = {
  /** Page background — warm cream. */
  bg: '#e1ded4',
  /** Card / input surface. */
  surface: '#ffffff',
  /** Primary text + primary button fill. */
  text: '#000000',
  /** Muted body text. */
  muted: '#333333',
  /** Brand blue (links). */
  secondary: '#0099dd',
  /** Brand orange (daisy accent). */
  accent: '#f1694f',
  /** Hairline borders. */
  line: '#bbbbbb',
} as const;

export const radii = {
  input: 2,
  card: 12,
  pill: 300,
} as const;

/** 8px-based spacing scale (Dembrandt observed an 8px base). */
export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

/** Motion durations (ms) observed by designlang. */
export const durations = {
  instant: 75,
  xs: 100,
  sm: 170,
  md: 300,
  lg: 500,
  xl: 1000,
} as const;

/**
 * Font family keys as loaded by `@expo-google-fonts/*` (the loaded family name
 * equals the imported export name). Wired in `app/_layout.tsx`.
 */
export const fonts = {
  display: 'Shrikhand_400Regular',
  bodyRegular: 'Bitter_400Regular',
  bodyBold: 'Bitter_700Bold',
  uiRegular: 'Roboto_400Regular',
  uiMedium: 'Roboto_500Medium',
  uiBold: 'Roboto_700Bold',
} as const;

export type Colors = typeof colors;
export type Fonts = typeof fonts;
