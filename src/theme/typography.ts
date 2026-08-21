import type { TextStyle } from "react-native";
import { brandColors, brandFonts } from "./tokens";

/* ------------------------------------------------------------------------- *
 * 2026 rebrand ramp — Fraunces display / Public Sans body / Caveat accent.
 * Desktop anchors measured on the live site (report.md §8.5: H1 59/64,
 * H2 44/49, H3 18.4/24, body 17.3, accent Caveat 24, buttons 14.4 pill),
 * scaled for mobile. The Figma-era ramp was removed once every screen had
 * migrated (Aug 2026).
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
	/** Control label — chips, checkbox rows, field captions that must stay legible. */
	label: {
		color: brandColors.text,
		fontFamily: brandFonts.bodySemi,
		fontSize: 14,
		lineHeight: 18,
	},
	/** Tab bar label — Public Sans semibold at the iOS 10pt tab size. */
	tab: {
		color: brandColors.text,
		fontFamily: brandFonts.bodySemi,
		fontSize: 10,
		lineHeight: 14,
	},
} satisfies Record<string, TextStyle>;

export type BrandTypographyVariant = keyof typeof brandTypography;
