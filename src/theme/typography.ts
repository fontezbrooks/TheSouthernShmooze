import type { TextStyle } from "react-native";
import { brandColors, brandFonts, colors, fonts } from "./tokens";

/**
 * Named text styles mapped 1:1 to the Figma "Components and Styles" type ramp.
 * Display = Shrikhand (italic), body/labels = Bitter, tab label = Open Sans.
 */
export const typography = {
  // Shrikhand is a heavy italic display face with tall ascenders. lineHeight ≈ fontSize
  // clips the tops of glyphs (the "h"/"l"/"d") on iOS, so display line heights carry
  // ~1.25-1.3x headroom. StrokedHeading draws all copies from the same metrics, so its
  // stroke/fill stay aligned. (Figma line heights were near-1.0 — visually too tight here.)
  /** Header L — Concierge title. */
  displayL: {
    fontFamily: fonts.display,
    fontStyle: "italic",
    fontSize: 56,
    lineHeight: 72,
    letterSpacing: -0.56,
    color: colors.text,
  },
  /** Header S — banner titles. */
  displayS: {
    fontFamily: fonts.display,
    fontStyle: "italic",
    fontSize: 32,
    lineHeight: 42,
    letterSpacing: -0.32,
    color: colors.text,
  },
  /** Header XS — section headers ("Certified Providers"). */
  displayXS: {
    fontFamily: fonts.display,
    fontStyle: "italic",
    fontSize: 24,
    lineHeight: 31,
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
  /** Caption XS Semibold — chip labels ("Certified"). */
  captionSemiXS: {
    fontFamily: fonts.bodySemi,
    fontSize: 10,
    lineHeight: 15,
    color: colors.text,
  },

  /** Body XS Semibold — "See More". */
  seeMore: {
    fontFamily: fonts.bodySemi,
    fontSize: 14,
    lineHeight: 21,
    color: colors.text,
  },

  /** Tab bar label — Bitter SemiBold 10/1.5 (RC1 NavBar). */
  tab: {
    fontFamily: fonts.tab,
    fontSize: 10,
    lineHeight: 15,
    color: colors.rust,
  },
} satisfies Record<string, TextStyle>;

export type TypographyVariant = keyof typeof typography;

/* ------------------------------------------------------------------------- *
 * 2026 rebrand ramp — Fraunces display / Public Sans body / Caveat accent.
 * Desktop anchors measured on the live site (report.md §8.5: H1 59/64,
 * H2 44/49, H3 18.4/24, body 17.3, accent Caveat 24, buttons 14.4 pill),
 * scaled for mobile. Additive during migration (E2–E7); `typography` above
 * remains until every screen has moved over.
 * ------------------------------------------------------------------------- */

export const brandTypography = {
  /** Hero — screen-level headline (site H1). */
  displayXL: {
    fontFamily: brandFonts.display,
    fontSize: 40,
    lineHeight: 46,
    letterSpacing: -0.4,
    color: brandColors.text,
  },
  /** Section headline (site H2). */
  displayL: {
    fontFamily: brandFonts.display,
    fontSize: 30,
    lineHeight: 35,
    letterSpacing: -0.3,
    color: brandColors.text,
  },
  /** Sub-section headline. */
  displayM: {
    fontFamily: brandFonts.display,
    fontSize: 24,
    lineHeight: 29,
    color: brandColors.text,
  },
  /** Card/feature title (site H3). */
  displayS: {
    fontFamily: brandFonts.display,
    fontSize: 18,
    lineHeight: 23,
    color: brandColors.text,
  },

  /** Body Regular. */
  body: {
    fontFamily: brandFonts.body,
    fontSize: 16,
    lineHeight: 24,
    color: brandColors.textSoft,
  },
  /** Body emphasized. */
  bodySemi: {
    fontFamily: brandFonts.bodySemi,
    fontSize: 16,
    lineHeight: 24,
    color: brandColors.text,
  },

  /** Button label — Public Sans bold, pairs with pill radius. */
  button: {
    fontFamily: brandFonts.bodyBold,
    fontSize: 15,
    lineHeight: 20,
    color: brandColors.bg,
  },

  /** Caption / meta. */
  caption: {
    fontFamily: brandFonts.body,
    fontSize: 12,
    lineHeight: 18,
    color: brandColors.textSoft,
  },
  /** Chip/badge label. */
  chip: {
    fontFamily: brandFonts.bodyBold,
    fontSize: 11,
    lineHeight: 14,
    color: brandColors.text,
  },

  /** Handwritten accent — porch-note flourishes. */
  accent: {
    fontFamily: brandFonts.accent,
    fontSize: 22,
    lineHeight: 28,
    color: brandColors.text,
  },
} satisfies Record<string, TextStyle>;

export type BrandTypographyVariant = keyof typeof brandTypography;
