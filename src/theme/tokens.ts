/**
 * Design tokens for The Southern Shmooze — sourced from the Figma file
 * "Southern Shmooze App" (RMu5KE0z5xbhi08LhY5eMW), Components & Styles page.
 * Figma is the source of truth (see docs/figma-refactor/README.md §3).
 */

export const colors = {
  /** Page base — warm Vanilla, sits under the daisy pattern. */
  bg: '#FFF8EA',
  /** Card / input surface. */
  surface: '#FFFFFF',

  /** Brand rust — primary banner + primary button fill. */
  rust: '#994706',
  /** Orange600 — borders + the signature hard drop shadow. */
  rustDark: '#602A00',
  /** Mustard — community banner + "See More" card. */
  mustard: '#C18D22',
  /** Pumpkin accent. */
  pumpkin: '#DF7C3D',

  /** Primary text (Grey120). */
  text: '#1B1B1C',
  /** Softer text (Neutral700). */
  textSoft: '#302B27',
  /** Muted — input placeholder / inside-label (Neutral600). */
  muted: '#757371',

  /** Input hairline border (Neutral400). */
  inputBorder: '#CCCAC9',

  black: '#000000',
  white: '#FFFFFF',
} as const;

export const radii = {
  input: 4,
  button: 8,
  card: 24,
  pill: 100,
} as const;

/** 8px-based spacing scale. */
export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

/**
 * Signature hard-offset shadow — NOT a blur. Figma "Button Drop Shadow":
 * color rustDark, offset (4,4), radius 0, spread 0.
 */
export const shadow = {
  hard: {
    shadowColor: colors.rustDark,
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 4,
  },
  /** Same offset shadow in black (community banner button). */
  hardBlack: {
    shadowColor: colors.black,
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 4,
  },
} as const;

/** Motion durations (ms). */
export const durations = {
  instant: 75,
  xs: 100,
  sm: 170,
  md: 300,
  lg: 500,
  xl: 1000,
} as const;

/**
 * Font family keys as loaded by `@expo-google-fonts/*` (loaded family name
 * equals the imported export name). Wired in `app/_layout.tsx`.
 */
export const fonts = {
  /** Shrikhand — display/headings. */
  display: 'Shrikhand_400Regular',
  /** Bitter — body. */
  body: 'Bitter_400Regular',
  bodySemi: 'Bitter_600SemiBold',
  bodyBold: 'Bitter_800ExtraBold',
  /** Open Sans — tab bar label only. */
  tab: 'OpenSans_600SemiBold',
} as const;

export type Colors = typeof colors;
export type Fonts = typeof fonts;
