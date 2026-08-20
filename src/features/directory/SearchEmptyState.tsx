import { StyleSheet, Text, View } from "react-native";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { useTheme } from "@/theme/ThemeProvider";

interface SearchEmptyStateProps {
	onAskCommunity: () => void;
}

/**
 * Registry search "no results" state: a file-question icon, a Fraunces
 * heading (rebrand, design.md §E2), a full sentence of guidance, and an
 * "Ask the Community" button. Top-aligned under the search bar, centered
 * horizontally.
 */
export function SearchEmptyState({ onAskCommunity }: SearchEmptyStateProps) {
	const t = useTheme();
	return (
		<View style={styles.wrap}>
			<Icon color={t.brand.colors.clay} name="fileQuestion" size={32} />
			<View style={styles.text}>
				<Text
					style={[
						styles.heading,
						{ color: t.brand.colors.text, fontFamily: t.brand.fonts.display },
					]}
				>
					No results
				</Text>
				<Text
					style={[
						t.brand.typography.body,
						styles.body,
						{ color: t.brand.colors.textSoft },
					]}
				>
					Please try your search again or ask the community for their
					recommendations.
				</Text>
			</View>
			<Button
				label="Ask the Community"
				onPress={onAskCommunity}
				variant="solid"
			/>
		</View>
	);
}

const styles = StyleSheet.create({
	body: { textAlign: "center" },
	// Fraunces 700 24/1.25, slight negative tracking (brand displayM metrics).
	heading: {
		fontSize: 24,
		letterSpacing: -0.24,
		lineHeight: 30,
		textAlign: "center",
	},
	text: { alignItems: "center", gap: 4 },
	wrap: {
		alignItems: "center",
		gap: 24,
		paddingBottom: 64,
		paddingHorizontal: 64,
		paddingTop: 24,
	},
});
