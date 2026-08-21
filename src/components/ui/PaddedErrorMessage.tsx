import { StyleSheet, Text, View } from "react-native";
import { useTheme } from "@/theme/ThemeProvider";
import { Icon } from "./Icon";

interface PaddedErrorMessageProps {
	message: string;
}

/**
 * Field error message in a padded porch-cream box — gives the warning + text
 * breathing room beneath the input. Error-red triangle, ink caption (13.69:1).
 */
export function PaddedErrorMessage({ message }: PaddedErrorMessageProps) {
	const t = useTheme();
	return (
		<View
			accessibilityLiveRegion="polite"
			style={[
				styles.box,
				{
					backgroundColor: t.brand.colors.porchCream,
					borderRadius: t.brand.radii.sm,
				},
			]}
		>
			<Icon color={t.brand.colors.error} name="triangleWarning" size={12} />
			<Text
				style={[t.brand.typography.caption, { color: t.brand.colors.text }]}
			>
				{message}
			</Text>
		</View>
	);
}

const styles = StyleSheet.create({
	box: {
		alignItems: "center",
		flexDirection: "row",
		gap: 6,
		paddingHorizontal: 12,
		paddingVertical: 4,
	},
});
