import {
	Pressable,
	type StyleProp,
	StyleSheet,
	Text,
	type ViewStyle,
} from "react-native";
import { useTheme } from "@/theme/ThemeProvider";

interface LinkPillProps {
	accessibilityLabel?: string;
	label: string;
	onPress: () => void;
	style?: StyleProp<ViewStyle>;
}

/**
 * Secondary navigation pill — the app's link-pill family (business-detail
 * LinkButton, FAQ tabs): surface fill, hairline `line` border, pill radius,
 * soft card shadow. Reads as a button over busy backgrounds (photos) where a
 * bare text link disappears (owner polish round).
 */
export function LinkPill({
	label,
	onPress,
	accessibilityLabel,
	style,
}: LinkPillProps) {
	const t = useTheme();
	return (
		<Pressable
			accessibilityLabel={accessibilityLabel ?? label}
			accessibilityRole="button"
			onPress={onPress}
			style={[
				styles.pill,
				{
					backgroundColor: t.brand.colors.surface,
					borderColor: t.brand.colors.line,
					borderRadius: t.brand.radii.pill,
				},
				t.brand.shadow.card,
				style,
			]}
		>
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
		justifyContent: "center",
		minHeight: 44,
		paddingHorizontal: 16,
	},
});
