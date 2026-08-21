import { StyleSheet, Text, View } from "react-native";
import { useTheme } from "@/theme/ThemeProvider";

interface StepIndicatorProps {
	step: 1 | 2;
	total: 2;
}

/** "Step 1 of 2" caption + two segments; exposed as a progressbar to AT. */
export function StepIndicator({ step, total }: StepIndicatorProps) {
	const t = useTheme();
	const segments = Array.from({ length: total }, (_, i) => i + 1);
	return (
		<View
			accessibilityRole="progressbar"
			accessibilityValue={{ max: total, min: 0, now: step }}
			accessible
			style={styles.wrap}
		>
			<Text
				style={[t.brand.typography.caption, { color: t.brand.colors.textSoft }]}
			>
				{`Step ${step} of ${total}`}
			</Text>
			<View style={styles.track}>
				{segments.map((n) => (
					<View
						key={n}
						style={[
							styles.segment,
							{
								backgroundColor:
									n <= step ? t.brand.colors.clay : t.brand.colors.line,
								borderRadius: t.brand.radii.pill,
							},
						]}
					/>
				))}
			</View>
		</View>
	);
}

const styles = StyleSheet.create({
	segment: { flex: 1, height: 4 },
	track: { flexDirection: "row", gap: 6 },
	wrap: { gap: 6 },
});
