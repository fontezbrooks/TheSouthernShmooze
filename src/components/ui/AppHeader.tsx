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
}

// Figma ShmoozeLogo-Horizontal viewBox is 264×17.
const LOGO_WIDTH = 264;
const LOGO_HEIGHT = 17;
// Comfortable, symmetric tap slots so the logo stays centered.
const SLOT = 44;

/**
 * Cream top bar with the centered Shmooze wordmark (Figma horizontal logo asset)
 * and an optional back arrow with a 44×44 tap target. Extends cream up into the
 * status bar via the top safe-area inset.
 */
export function AppHeader({ showBack = false, onBack }: AppHeaderProps) {
	const t = useTheme();
	const insets = useSafeAreaInsets();
	return (
		<View
			style={[
				styles.bar,
				{
					backgroundColor: t.colors.bg,
					borderBottomColor: t.colors.divider,
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
						<Icon color={t.colors.text} name="arrowLeft" size={30} />
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
