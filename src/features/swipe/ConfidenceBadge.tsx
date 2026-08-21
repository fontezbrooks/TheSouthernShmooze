import { StyleSheet, Text, View } from "react-native";
import { useTheme } from "@/theme/ThemeProvider";

interface ConfidenceBadgeProps {
	confidence: number;
	isFeatured?: boolean;
}

/** "87% match" pill + an optional "Featured" tag (always shows the TRUE confidence). */
export function ConfidenceBadge({
	confidence,
	isFeatured = false,
}: ConfidenceBadgeProps) {
	const t = useTheme();
	return (
		<View style={styles.row}>
			<View
				style={[
					styles.pill,
					{
						backgroundColor: t.brand.colors.clay,
						borderRadius: t.brand.radii.pill,
					},
				]}
			>
				<Text style={[t.brand.typography.chip, { color: t.brand.colors.bg }]}>
					{Math.round(confidence)}% match
				</Text>
			</View>
			{isFeatured ? (
				<View
					style={[
						styles.pill,
						{
							backgroundColor: t.brand.colors.peachSoft,
							borderRadius: t.brand.radii.pill,
						},
					]}
				>
					<Text
						style={[
							t.brand.typography.chip,
							{ color: t.brand.colors.clayDark },
						]}
					>
						Featured
					</Text>
				</View>
			) : null}
		</View>
	);
}

const styles = StyleSheet.create({
	pill: { paddingHorizontal: 10, paddingVertical: 4 },
	row: { flexDirection: "row", gap: 6 },
});
