import { StyleSheet, Text, View } from "react-native";
import { useTheme } from "@/theme/ThemeProvider";
import { Icon } from "./Icon";

interface PaddedErrorMessageProps {
	message: string;
}

/**
 * Field error message in a padded cream box (Figma V3 32:4684) — gives the
 * warning + text breathing room beneath the input for readability. Red
 * triangle icon + black caption text on a Vanilla background.
 */
export function PaddedErrorMessage({ message }: PaddedErrorMessageProps) {
	const t = useTheme();
	return (
		<View
			accessibilityLiveRegion="polite"
			style={[
				styles.box,
				{ backgroundColor: t.colors.bg, borderRadius: t.radii.input },
			]}
		>
			<Icon color={t.colors.error} name="triangleWarning" size={12} />
			<Text style={[t.typography.caption, { color: t.colors.black }]}>
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
