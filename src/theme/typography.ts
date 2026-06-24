import type { TextStyle } from 'react-native';
import { colors, fonts } from './tokens';

/**
 * Named text styles. Display/headings use Shrikhand, body uses Bitter, UI uses Roboto —
 * matching the live site's type roles.
 */
export const typography = {
  display: { fontFamily: fonts.display, fontSize: 40, lineHeight: 44, color: colors.text },
  h1: { fontFamily: fonts.display, fontSize: 32, lineHeight: 38, color: colors.text },
  h2: { fontFamily: fonts.display, fontSize: 24, lineHeight: 30, color: colors.text },
  body: { fontFamily: fonts.bodyRegular, fontSize: 16, lineHeight: 24, color: colors.muted },
  bodyBold: { fontFamily: fonts.bodyBold, fontSize: 16, lineHeight: 24, color: colors.text },
  label: { fontFamily: fonts.uiMedium, fontSize: 15, lineHeight: 20, color: colors.text },
  button: { fontFamily: fonts.uiBold, fontSize: 16, lineHeight: 20, color: colors.surface },
  caption: { fontFamily: fonts.uiRegular, fontSize: 12, lineHeight: 16, color: colors.muted },
} satisfies Record<string, TextStyle>;

export type TypographyVariant = keyof typeof typography;
