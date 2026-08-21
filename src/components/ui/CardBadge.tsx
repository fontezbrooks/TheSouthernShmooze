import { StyleSheet, View } from "react-native";
import { useTheme } from "@/theme/ThemeProvider";
import { Icon, type IconName } from "./Icon";

/**
 * 20×20 borderless badge holding a 16px clay glyph — the reviews (thumbsUp) and
 * discount (sale) markers in the business cards' badge rows. Presentational.
 */
export function CardBadge({ icon }: { icon: IconName }) {
	const t = useTheme();
	return (
		<View style={styles.badge}>
			<Icon color={t.brand.colors.clay} name={icon} size={16} />
		</View>
	);
}

const styles = StyleSheet.create({
	badge: {
		alignItems: "center",
		height: 20,
		justifyContent: "center",
		width: 20,
	},
});
