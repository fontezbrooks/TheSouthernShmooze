import type { TextStyle } from "react-native";
import { brandColors, brandFonts, colors, fonts } from "./tokens";

/**
 * Named text styles mapped 1:1 to the Figma "Components and Styles" type ramp.
 * Display = Shrikhand (italic), body/labels = Bitter, tab label = Open Sans.
 */
export const typography = {
	/** Body Regular. */
	body: {
		color: colors.text,
		fontFamily: fonts.body,
		fontSize: 16,
		lineHeight: 24,
	},
	/** Body Semibold — Button Full label. */
	bodySemibold: {
		color: colors.text,
		fontFamily: fonts.bodySemi,
		fontSize: 16,
		lineHeight: 24,
	},
	/** Caption Regular. */
	caption: {
		color: colors.text,
		fontFamily: fonts.body,
		fontSize: 12,
		lineHeight: 18,
	},
	/** Caption Semibold — Button S label, inside-input label. */
	captionSemi: {
		color: colors.text,
		fontFamily: fonts.bodySemi,
		fontSize: 12,
		lineHeight: 18,
	},
	/** Caption XS Semibold — chip labels ("Certified"). */
	captionSemiXS: {
		color: colors.text,
		fontFamily: fonts.bodySemi,
		fontSize: 10,
		lineHeight: 15,
	},

	/** Caption Bold — business card name. */
	cardTitle: {
		color: colors.text,
		fontFamily: fonts.bodyBold,
		fontSize: 12,
		lineHeight: 18,
	},
	// Shrikhand is a heavy italic display face with tall ascenders. lineHeight ≈ fontSize
	// clips the tops of glyphs (the "h"/"l"/"d") on iOS, so display line heights carry
	// ~1.25-1.3x headroom. StrokedHeading draws all copies from the same metrics, so its
	// stroke/fill stay aligned. (Figma line heights were near-1.0 — visually too tight here.)
	/** Header L — Concierge title. */
	displayL: {
		color: colors.text,
		fontFamily: fonts.display,
		fontSize: 56,
		fontStyle: "italic",
		letterSpacing: -0.56,
		lineHeight: 72,
	},
	/** Header S — banner titles. */
	displayS: {
		color: colors.text,
		fontFamily: fonts.display,
		fontSize: 32,
		fontStyle: "italic",
		letterSpacing: -0.32,
		lineHeight: 42,
	},
	/** Header XS — section headers ("Certified Providers"). */
	displayXS: {
		color: colors.text,
		fontFamily: fonts.display,
		fontSize: 24,
		fontStyle: "italic",
		letterSpacing: -0.24,
		lineHeight: 31,
	},

	/** Body XS Semibold — "See More". */
	seeMore: {
		color: colors.text,
		fontFamily: fonts.bodySemi,
		fontSize: 14,
		lineHeight: 21,
	},

	/** Tab bar label — Bitter SemiBold 10/1.5 (RC1 NavBar). */
	tab: {
		color: colors.rust,
		fontFamily: fonts.tab,
		fontSize: 10,
		lineHeight: 15,
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
	/** Handwritten accent — porch-note flourishes. */
	accent: {
		color: brandColors.text,
		fontFamily: brandFonts.accent,
		fontSize: 22,
		lineHeight: 28,
	},

	/** Body Regular. */
	body: {
		color: brandColors.textSoft,
		fontFamily: brandFonts.body,
		fontSize: 16,
		lineHeight: 24,
	},
	/** Body emphasized. */
	bodySemi: {
		color: brandColors.text,
		fontFamily: brandFonts.bodySemi,
		fontSize: 16,
		lineHeight: 24,
	},

	/** Button label — Public Sans bold, pairs with pill radius. */
	button: {
		color: brandColors.bg,
		fontFamily: brandFonts.bodyBold,
		fontSize: 15,
		lineHeight: 20,
	},

	/** Caption / meta. */
	caption: {
		color: brandColors.textSoft,
		fontFamily: brandFonts.body,
		fontSize: 12,
		lineHeight: 18,
	},
	/** Chip/badge label. */
	chip: {
		color: brandColors.text,
		fontFamily: brandFonts.bodyBold,
		fontSize: 11,
		lineHeight: 14,
	},
	/** Section headline (site H2). */
	displayL: {
		color: brandColors.text,
		fontFamily: brandFonts.display,
		fontSize: 30,
		letterSpacing: -0.3,
		lineHeight: 35,
	},
	/** Sub-section headline. */
	displayM: {
		color: brandColors.text,
		fontFamily: brandFonts.display,
		fontSize: 24,
		lineHeight: 29,
	},
	/** Card/feature title (site H3). */
	displayS: {
		color: brandColors.text,
		fontFamily: brandFonts.display,
		fontSize: 18,
		lineHeight: 23,
	},
	/** Hero — screen-level headline (site H1). */
	displayXL: {
		color: brandColors.text,
		fontFamily: brandFonts.display,
		fontSize: 40,
		letterSpacing: -0.4,
		lineHeight: 46,
	},
} satisfies Record<string, TextStyle>;

export type BrandTypographyVariant = keyof typeof brandTypography;
