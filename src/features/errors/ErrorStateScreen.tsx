import { StyleSheet, Text, View } from "react-native";
import { Button } from "@/components/ui/Button";
import { useTheme } from "@/theme/ThemeProvider";

interface ErrorStateScreenProps {
	actionLabel: string;
	body: string;
	heading: string;
	kicker: string;
	onAction: () => void;
}

/**
 * The full-screen dead end, shared by the router's 404 and the crash boundary.
 *
 * Both are places a user lands by accident, so the screen stays on brand
 * rather than dropping to a system font on white: magnolia ground, Caveat
 * kicker, Fraunces heading, one clay action. There is always exactly one way
 * out — a dead end with no button is how a session ends.
 */
export function ErrorStateScreen({
	actionLabel,
	body,
	heading,
	kicker,
	onAction,
}: ErrorStateScreenProps) {
	const t = useTheme();

	return (
		<View style={[styles.root, { backgroundColor: t.brand.colors.bg }]}>
			<Text style={[t.brand.typography.accent, { color: t.brand.colors.clay }]}>
				{kicker}
			</Text>
			<Text
				accessibilityRole="header"
				style={[styles.heading, t.brand.typography.displayL]}
			>
				{heading}
			</Text>
			<Text
				style={[
					styles.body,
					t.brand.typography.body,
					{ color: t.brand.colors.textSoft },
				]}
			>
				{body}
			</Text>
			<Button label={actionLabel} onPress={onAction} variant="solid" />
		</View>
	);
}

const styles = StyleSheet.create({
	body: {
		marginBottom: 32,
		maxWidth: 320,
		textAlign: "center",
	},
	heading: {
		marginBottom: 12,
		marginTop: 8,
		textAlign: "center",
	},
	root: {
		alignItems: "center",
		flex: 1,
		justifyContent: "center",
		paddingHorizontal: 24,
	},
});
