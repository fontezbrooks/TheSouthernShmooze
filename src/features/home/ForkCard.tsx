import type { ReactNode } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useTheme } from "@/theme/ThemeProvider";

interface ForkCardProps {
	accessibilityHint?: string;
	cta: string;
	icon: ReactNode;
	onPress: () => void;
	subtitle: string;
	title: string;
}

/**
 * One half of the audience fork. The two secondary entries (Match, contractor
 * intake) used to be full-width slabs indistinguishable from the Concierge;
 * side-by-side they read as a choice between two paths rather than two more
 * offers, which is how the site frames the same split.
 */
export function ForkCard({
	accessibilityHint,
	cta,
	icon,
	onPress,
	subtitle,
	title,
}: ForkCardProps) {
	const t = useTheme();

	return (
		<Pressable
			accessibilityHint={accessibilityHint}
			accessibilityLabel={`${title} — ${subtitle}`}
			accessibilityRole="button"
			onPress={onPress}
			style={({ pressed }) => [
				styles.card,
				t.brand.shadow.card,
				{
					backgroundColor: t.brand.colors.surface,
					borderColor: t.brand.colors.line,
					borderRadius: t.brand.radii.md,
				},
				pressed && styles.pressed,
			]}
		>
			<View style={styles.icon}>{icon}</View>
			<Text style={t.brand.typography.displayS}>{title}</Text>
			<Text style={[t.brand.typography.caption, styles.subtitle]}>
				{subtitle}
			</Text>
			<Text
				style={[
					t.brand.typography.chip,
					styles.cta,
					{ color: t.brand.colors.clay },
				]}
			>
				{cta}
			</Text>
		</Pressable>
	);
}

const styles = StyleSheet.create({
	card: {
		borderWidth: StyleSheet.hairlineWidth,
		flex: 1,
		padding: 16,
	},
	// Pushed to the bottom so both cards align their CTAs regardless of how many
	// lines the title wraps to.
	cta: { marginTop: "auto", paddingTop: 12 },
	icon: { alignItems: "flex-start", height: 72, justifyContent: "center" },
	pressed: { opacity: 0.92 },
	subtitle: { marginTop: 4 },
});
