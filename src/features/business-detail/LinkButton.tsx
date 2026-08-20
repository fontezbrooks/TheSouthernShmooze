import { Pressable, StyleSheet, Text } from "react-native";
import { Icon, type IconName } from "@/components/ui/Icon";
import { useTheme } from "@/theme/ThemeProvider";

interface LinkButtonProps {
	icon: IconName;
	label: string;
	onPress: () => void;
}

/**
 * External-link pill (P6): brand/Feather icon + short label on a cream pill
 * with the hard shadow — one visual for website, socials, and brand links.
 */
export function LinkButton({ icon, label, onPress }: LinkButtonProps) {
	const t = useTheme();
	return (
		<Pressable
			accessibilityLabel={label}
			accessibilityRole="link"
			onPress={onPress}
			style={[
				styles.pill,
				{
					backgroundColor: t.brand.colors.surface,
					borderColor: t.brand.colors.line,
					borderRadius: t.brand.radii.pill,
				},
				t.brand.shadow.card,
			]}
		>
			<Icon color={t.brand.colors.clay} name={icon} size={18} />
			<Text style={[t.brand.typography.chip, { color: t.brand.colors.text }]}>
				{label}
			</Text>
		</Pressable>
	);
}

const styles = StyleSheet.create({
	pill: {
		alignItems: "center",
		borderWidth: StyleSheet.hairlineWidth,
		flexDirection: "row",
		gap: 6,
		height: 40,
		paddingHorizontal: 14,
	},
});
