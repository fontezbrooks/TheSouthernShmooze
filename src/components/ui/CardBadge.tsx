import { StyleSheet, View } from "react-native";
import { useTheme } from "@/theme/ThemeProvider";
import { Icon, type IconName } from "./Icon";

/**
 * 20×20 borderless badge holding a 16px rust glyph — the reviews (thumbsUp) and
 * discount (sale) markers in the horizontal directory card's top badge row
 * (Figma "Business Card/Atoms/Reviews Tag" + "Discount Tag"). Presentational.
 */
export function CardBadge({ icon }: { icon: IconName }) {
	const t = useTheme();
	return (
		<View style={styles.badge}>
			<Icon color={t.colors.rust} name={icon} size={16} />
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
