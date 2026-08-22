/**
 * Design tokens for The Southern Shmooze — sourced from the Figma file
 * "Southern Shmooze App" (RMu5KE0z5xbhi08LhY5eMW), Components & Styles page.
 * Figma is the source of truth (see docs/figma-refactor/README.md §3).
 */

/** Motion durations (ms). */
export const durations = {
	instant: 75,
	lg: 500,
	md: 300,
	sm: 170,
	xl: 1000,
	xs: 100,
} as const;

/* ------------------------------------------------------------------------- *
 * 2026 rebrand — tokens extracted from the live site (design truth per the
 * site-reconciliation round; see claudedocs/site-reconciliation/design.md §E1
 * and report.md §5/§8.5). The Figma-era palette/ramp was removed once every
 * screen had migrated (Aug 2026); `t.brand.*` is the only token set.
 * ------------------------------------------------------------------------- */

export const brandColors = {
	/** Page base — Magnolia. */
	bg: "#FFFDF8",
	black: "#000000",

	/** Primary accent — Clay (buttons, links, active states). */
	clay: "#A8472B",
	/** Clay pressed/border. */
	clayDark: "#8A3820",

	error: "#EE4145",
	/** Gold — badges, stars, pins. */
	gold: "#C98F2B",
	goldLight: "#E7B85A",
	/** Hairline borders/dividers. */
	line: "#E4D6BE",
	/** Warm peach tints. */
	peach: "#EFA85F",
	peachSoft: "#F9E0BE",
	/** Secondary — deep Pine green. */
	pine: "#26402F",
	pineDark: "#1B2E21",
	/** Warm section background — Porch Cream. */
	porchCream: "#FBF1E1",
	/** Card / input surface. */
	surface: "#FFFFFF",

	/** Primary text — Ink. */
	text: "#2A2420",
	/** Secondary text. */
	textSoft: "#5B5148",
	white: "#FFFFFF",
} as const;

/** Site radii scale (10/16/28 + pill). */
export const brandRadii = {
	lg: 28,
	md: 16,
	pill: 999,
	sm: 10,
} as const;

/**
 * Soft blurred shadows (replace the legacy 4px hard offset).
 * Site: card `0 8px 20px -10px rgba(42,36,32,.18)`, pin `0 12px 24px -12px …,.35`.
 * RN has no shadow spread — approximated via radius/opacity + elevation.
 */
export const brandShadow = {
	card: {
		elevation: 4,
		shadowColor: brandColors.text,
		shadowOffset: { height: 8, width: 0 },
		shadowOpacity: 0.18,
		shadowRadius: 10,
	},
	pin: {
		elevation: 8,
		shadowColor: brandColors.text,
		shadowOffset: { height: 12, width: 0 },
		shadowOpacity: 0.35,
		shadowRadius: 12,
	},
} as const;

/**
 * Rebrand families (loaded in `app/_layout.tsx`):
 * Fraunces = display serif, Public Sans = body, Caveat = handwritten accent.
 */
export const brandFonts = {
	/**
	 * Caveat 500, deliberately: the site's CSS computes weight 400, but its
	 * Google Fonts URL loads only Caveat 500/600/700, so browsers map 400 to
	 * the 500 face — 500 is what actually renders.
	 */
	accent: "Caveat_500Medium",
	accentSemi: "Caveat_600SemiBold",
	body: "PublicSans_400Regular",
	bodyBold: "PublicSans_700Bold",
	bodySemi: "PublicSans_600SemiBold",
	display: "Fraunces_700Bold",
	displayBlack: "Fraunces_900Black",
	/** Emphasis word inside a display line — the site sets it italic + clay. */
	displayItalic: "Fraunces_700Bold_Italic",
	displaySemi: "Fraunces_600SemiBold",
} as const;

export type BrandColors = typeof brandColors;
export type BrandFonts = typeof brandFonts;
