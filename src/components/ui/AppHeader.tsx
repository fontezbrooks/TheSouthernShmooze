import { Pressable, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "@/theme/ThemeProvider";
// Figma-exported wordmark (source of truth) — transparent vector, imported as a
// component via react-native-svg-transformer.
import ShmoozeLogo from "../../../assets/ShmoozeLogo-Horizontal.svg";
import { Icon } from "./Icon";

interface AppHeaderProps {
	onBack?: () => void;
	/** Show the back arrow (Concierge); hidden on Home. */
	showBack?: boolean;
	/**
	 * Which token set the bar matches. Screens still on the legacy Vanilla /
	 * daisy page surface pass `legacy` so the header does not sit a shade
	 * cooler than the page beneath it (review: PR #50). Delete the override
	 * as each screen migrates; the prop goes with the last one.
	 */
	surface?: "brand" | "legacy";
}

// Figma ShmoozeLogo-Horizontal viewBox is 264×17.
const LOGO_WIDTH = 264;
const LOGO_HEIGHT = 17;
// Comfortable, symmetric tap slots so the logo stays centered.
const SLOT = 44;

/**
 * Magnolia top bar with the centered Shmooze wordmark (Figma horizontal logo
 * asset) and an optional back arrow with a 44×44 tap target. Extends the page
 * colour up into the status bar via the top safe-area inset.
 *
 * Defaults to `t.brand` so the bar no longer sits a shade warmer (#FFF8EA)
 * than the magnolia page (#FFFDF8) beneath it; unmigrated screens opt into
 * the legacy surface. The wordmark SVG is the brand's logo asset and is
 * deliberately left as-is.
 */
export function AppHeader({
	showBack = false,
	onBack,
	surface = "brand",
}: AppHeaderProps) {
	const t = useTheme();
	const insets = useSafeAreaInsets();
	const isLegacy = surface === "legacy";
	const bg = isLegacy ? t.colors.bg : t.brand.colors.bg;
	const line = isLegacy ? t.colors.divider : t.brand.colors.line;
	const ink = isLegacy ? t.colors.text : t.brand.colors.text;
	return (
		<View
			style={[
				styles.bar,
				{
					backgroundColor: bg,
					borderBottomColor: line,
					height: 60 + insets.top,
					paddingTop: insets.top,
				},
			]}
		>
			<View style={styles.side}>
				{showBack ? (
					<Pressable
						accessibilityLabel="Go back"
						accessibilityRole="button"
						hitSlop={12}
						onPress={onBack}
						style={styles.backHit}
					>
						<Icon color={ink} name="arrowLeft" size={30} />
					</Pressable>
				) : null}
			</View>
			<ShmoozeLogo
				accessibilityLabel="The Southern Shmooze"
				accessibilityRole="image"
				height={LOGO_HEIGHT}
				width={LOGO_WIDTH}
			/>
			<View style={styles.side} />
		</View>
	);
}

const styles = StyleSheet.create({
	backHit: {
		alignItems: "center",
		height: SLOT,
		justifyContent: "center",
		width: SLOT,
	},
	bar: {
		alignItems: "center",
		borderBottomWidth: StyleSheet.hairlineWidth,
		flexDirection: "row",
		height: 60,
		justifyContent: "space-between",
		paddingHorizontal: 16,
	},
	side: {
		alignItems: "center",
		height: SLOT,
		justifyContent: "center",
		width: SLOT,
	},
});
