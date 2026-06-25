import type { TextStyle } from "react-native";
import { colors, fonts } from "./tokens";

/**
 * Named text styles mapped 1:1 to the Figma "Components and Styles" type ramp.
 * Display = Shrikhand (italic), body/labels = Bitter, tab label = Open Sans.
 */
export const typography = {
  /** Header L — Concierge title. */
  displayL: {
    fontFamily: fonts.display,
    fontStyle: "italic",
    fontSize: 56,
    lineHeight: 64,
    letterSpacing: -0.56,
    color: colors.text,
  },
  /** Header S — banner titles. */
  displayS: {
    fontFamily: fonts.display,
    fontStyle: "italic",
    fontSize: 32,
    lineHeight: 33,
    letterSpacing: -0.32,
    color: colors.text,
  },
  /** Header XS — section headers ("Certified Providers"). */
  displayXS: {
    fontFamily: fonts.display,
    fontStyle: "italic",
    fontSize: 24,
    lineHeight: 30,
    letterSpacing: -0.24,
    color: colors.text,
  },

  /** Body Regular. */
  body: {
    fontFamily: fonts.body,
    fontSize: 16,
    lineHeight: 24,
    color: colors.text,
  },
  /** Body Semibold — Button Full label. */
  bodySemibold: {
    fontFamily: fonts.bodySemi,
    fontSize: 16,
    lineHeight: 24,
    color: colors.text,
  },

  /** Caption Bold — business card name. */
  cardTitle: {
    fontFamily: fonts.bodyBold,
    fontSize: 12,
    lineHeight: 18,
    color: colors.text,
  },
  /** Caption Regular. */
  caption: {
    fontFamily: fonts.body,
    fontSize: 12,
    lineHeight: 18,
    color: colors.text,
  },
  /** Caption Semibold — Button S label, inside-input label. */
  captionSemi: {
    fontFamily: fonts.bodySemi,
    fontSize: 12,
    lineHeight: 18,
    color: colors.text,
  },

  /** Body XS Semibold — "See More". */
  seeMore: {
    fontFamily: fonts.bodySemi,
    fontSize: 14,
    lineHeight: 21,
    color: colors.text,
  },

  /** Tab bar label. */
  tab: {
    fontFamily: fonts.tab,
    fontSize: 10,
    lineHeight: 12,
    color: colors.rust,
  },
} satisfies Record<string, TextStyle>;

export type TypographyVariant = keyof typeof typography;
