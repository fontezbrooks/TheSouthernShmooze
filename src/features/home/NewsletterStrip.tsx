import { Pressable, StyleSheet, Text, View } from "react-native";
import { useTheme } from "@/theme/ThemeProvider";

/**
 * Deliberately the quietest thing on the page — a ruled row, not a card. It
 * replaces a former promo slab that had the same visual weight as the Concierge
 * despite being the lowest-value action on the screen.
 */
export function NewsletterStrip({ onPress }: { onPress: () => void }) {
	const t = useTheme();

	return (
		<Pressable
			accessibilityHint="Opens the newsletter signup in your browser"
			accessibilityLabel="The Newsletter — local finds and happenings, delivered straight to your inbox"
			accessibilityRole="button"
			onPress={onPress}
			style={({ pressed }) => [
				styles.row,
				{ borderTopColor: t.brand.colors.line },
				pressed && styles.pressed,
			]}
		>
			<View style={styles.copy}>
				<Text style={t.brand.typography.displayS}>The Newsletter</Text>
				<Text style={[t.brand.typography.caption, styles.subtitle]}>
					Local finds and happenings, delivered straight to your inbox.
				</Text>
			</View>
			<Text style={[t.brand.typography.chip, { color: t.brand.colors.clay }]}>
				Subscribe
			</Text>
		</Pressable>
	);
}

const styles = StyleSheet.create({
	copy: { flex: 1 },
	pressed: { opacity: 0.92 },
	row: {
		alignItems: "center",
		borderTopWidth: StyleSheet.hairlineWidth,
		flexDirection: "row",
		gap: 16,
		minHeight: 44,
		paddingTop: 20,
	},
	subtitle: { marginTop: 2 },
});
