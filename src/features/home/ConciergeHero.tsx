import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import { bannerHelp } from "@/theme/assets";
import { useTheme } from "@/theme/ThemeProvider";

/**
 * The front door. Home used to open with a full-viewport rust slab that made
 * the Concierge one of six equal promos; this is the one block on the page with
 * hero weight, so the primary path is unambiguous (PRODUCT.md principle 2).
 *
 * The emphasized word follows the site's move exactly: Fraunces italic + clay
 * (a real italic face is loaded in app/_layout.tsx — synthesised obliques on a
 * high-contrast serif look broken, so never fall back to fontStyle).
 */
export function ConciergeHero({ onPress }: { onPress: () => void }) {
	const t = useTheme();

	return (
		<Pressable
			accessibilityHint="Opens the concierge request form"
			accessibilityLabel="Concierge — we'll email recommendations of trusted local businesses based on your specific needs"
			accessibilityRole="button"
			onPress={onPress}
			style={({ pressed }) => [styles.root, pressed && styles.pressed]}
		>
			<Text style={[t.brand.typography.accent, { color: t.brand.colors.clay }]}>
				Not sure who to call?
			</Text>

			<Text style={[t.brand.typography.displayXL, styles.title]}>
				Ask the{" "}
				<Text
					style={{
						color: t.brand.colors.clay,
						fontFamily: t.brand.fonts.displayItalic,
					}}
				>
					Concierge
				</Text>
				.
			</Text>

			<Text style={[t.brand.typography.body, styles.subtitle]}>
				We'll email recommendations of trusted local businesses based on your
				specific needs.
			</Text>

			<View
				style={[
					styles.photoFrame,
					t.brand.shadow.card,
					{ borderRadius: t.brand.radii.md },
				]}
			>
				{/* Decorative inside a labelled tap target: marking it accessible
				    would give VoiceOver a second stop announcing the same block. */}
				<Image
					accessibilityElementsHidden
					importantForAccessibility="no-hide-descendants"
					resizeMode="cover"
					source={bannerHelp}
					style={[styles.photoFill, { borderRadius: t.brand.radii.md }]}
				/>
			</View>

			<View
				style={[
					styles.cta,
					{
						backgroundColor: t.brand.colors.clay,
						borderRadius: t.brand.radii.pill,
					},
				]}
			>
				<Text style={t.brand.typography.button}>Reach Out</Text>
			</View>
		</Pressable>
	);
}

const styles = StyleSheet.create({
	// Same scale as the Button primary (56pt, Public Sans bold 15/20) and the
	// same full width as the detail screen's Call, so the page's two clay CTAs
	// read as one control. minHeight, not height: Dynamic Type must be able to
	// grow the label without clipping it (review: PR #52).
	cta: {
		alignItems: "center",
		alignSelf: "stretch",
		justifyContent: "center",
		marginTop: 24,
		minHeight: 56,
		paddingHorizontal: 20,
	},
	photoFill: { height: "100%", width: "100%" },
	// The frame owns the ratio: a bare Image with `width: "100%"` + aspectRatio
	// still lays out at the asset's intrinsic height, which ran the photo past
	// the fold. 3:2 keeps it readable without eating the viewport the way the
	// old full-bleed banner image did.
	photoFrame: { aspectRatio: 3 / 2, marginTop: 20, width: "100%" },
	pressed: { opacity: 0.92 },
	root: { paddingTop: 4 },
	// Body copy caps near 60 characters per line at this width — inside the
	// 65-75ch target without a maxWidth hack.
	subtitle: { marginTop: 8 },
	title: { marginTop: 2 },
});
