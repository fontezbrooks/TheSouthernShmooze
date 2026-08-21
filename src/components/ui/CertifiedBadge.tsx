import { StyleSheet, Text, View } from "react-native";
import { useTheme } from "@/theme/ThemeProvider";
import { Icon } from "./Icon";

interface CertifiedBadgeProps {
	/** Pill label — directory card uses "Shmooze Certified"; Home card uses "Certified". */
	label?: string;
}

/**
 * Certified pill on the 2026 brand tokens: peach-soft fill, gold-light
 * hairline, gold star, clay-dark label (6.16:1 on the fill). The legacy 2px
 * mustard hard shadow is gone — a 20px chip never needed depth. Shared by the
 * provider card, the directory row, the detail screen and the swipe deck.
 */
export function CertifiedBadge({
	label = "Shmooze Certified",
}: CertifiedBadgeProps) {
	const t = useTheme();
	return (
		<View
			style={[
				styles.badge,
				{
					backgroundColor: t.brand.colors.peachSoft,
					borderColor: t.brand.colors.goldLight,
					borderRadius: t.brand.radii.pill,
				},
			]}
		>
			<Icon color={t.brand.colors.gold} name="starFilled" size={12} />
			<Text
				style={[t.brand.typography.chip, { color: t.brand.colors.clayDark }]}
			>
				{label}
			</Text>
		</View>
	);
}

const styles = StyleSheet.create({
	badge: {
		alignItems: "center",
		alignSelf: "flex-start",
		borderWidth: StyleSheet.hairlineWidth,
		flexDirection: "row",
		gap: 4,
		height: 20,
		paddingHorizontal: 6,
	},
});
