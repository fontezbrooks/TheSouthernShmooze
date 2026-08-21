import { Pressable, StyleSheet, Text, View } from "react-native";
import { useTheme } from "@/theme/ThemeProvider";

/**
 * The one dark block on the page. Pine is the site's treatment for the same
 * section, and it gives a long warm scroll a spine — without it the page is an
 * unbroken run of light cards.
 *
 * The CTA is peach-soft rather than clay: clay on pine measures 1.94:1, which
 * reads as a muddy hole rather than a button.
 */
export function CommunityBlock({ onPress }: { onPress: () => void }) {
	const t = useTheme();

	return (
		<Pressable
			accessibilityHint="Opens the Facebook group in your browser"
			accessibilityLabel="Ask the community — get recommendations and connect with locals"
			accessibilityRole="button"
			onPress={onPress}
			style={({ pressed }) => [
				styles.card,
				{
					backgroundColor: t.brand.colors.pine,
					borderRadius: t.brand.radii.lg,
				},
				pressed && styles.pressed,
			]}
		>
			<Text
				style={[t.brand.typography.accent, { color: t.brand.colors.peachSoft }]}
			>
				Join the neighborhood
			</Text>

			<Text
				style={[
					t.brand.typography.displayL,
					styles.title,
					{ color: t.brand.colors.bg },
				]}
			>
				Ask the community
			</Text>

			<Text
				style={[
					t.brand.typography.body,
					styles.subtitle,
					{ color: t.brand.colors.peachSoft },
				]}
			>
				Get recommendations and connect with locals.
			</Text>

			<View
				style={[
					styles.cta,
					{
						backgroundColor: t.brand.colors.peachSoft,
						borderRadius: t.brand.radii.pill,
					},
				]}
			>
				<Text
					style={[
						t.brand.typography.button,
						{ color: t.brand.colors.pineDark },
					]}
				>
					Join the Facebook Group
				</Text>
			</View>
		</Pressable>
	);
}

const styles = StyleSheet.create({
	card: { padding: 24 },
	cta: {
		alignItems: "center",
		alignSelf: "flex-start",
		justifyContent: "center",
		marginTop: 20,
		minHeight: 44,
		paddingHorizontal: 20,
	},
	pressed: { opacity: 0.92 },
	subtitle: { marginTop: 8 },
	title: { marginTop: 2 },
});
