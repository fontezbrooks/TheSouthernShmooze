import { useRouter } from "expo-router";
import {
	KeyboardAvoidingView,
	Platform,
	ScrollView,
	StyleSheet,
	Text,
	View,
} from "react-native";
import { AppHeader } from "@/components/ui/AppHeader";
import { ConciergeForm } from "@/features/lead-form/ConciergeForm";
import { useTheme } from "@/theme/ThemeProvider";

/**
 * Concierge screen on the 2026 brand tokens — Caveat kicker + Fraunces title
 * (the Home hero pattern) over the two-step Find My Pro flow (E3b).
 */
export function ConciergeScreen() {
	const t = useTheme();
	const router = useRouter();
	const goHome = () =>
		router.canGoBack() ? router.back() : router.replace("/");

	return (
		<View style={[styles.flex, { backgroundColor: t.brand.colors.bg }]}>
			<AppHeader onBack={goHome} showBack />
			<KeyboardAvoidingView
				behavior={Platform.OS === "ios" ? "padding" : undefined}
				style={styles.flex}
			>
				<ScrollView
					contentContainerStyle={styles.content}
					keyboardShouldPersistTaps="handled"
				>
					<View style={styles.headingBlock}>
						<Text
							style={[
								t.brand.typography.accent,
								{ color: t.brand.colors.clay },
							]}
						>
							Concierge
						</Text>
						<Text
							accessibilityRole="header"
							style={t.brand.typography.displayXL}
						>
							Find My Pro
						</Text>
					</View>
					<ConciergeForm
						onBackHome={goHome}
						onSeeDirectory={() => router.push("/directory")}
					/>
				</ScrollView>
			</KeyboardAvoidingView>
		</View>
	);
}

const styles = StyleSheet.create({
	content: {
		gap: 24,
		paddingBottom: 44,
		paddingHorizontal: 16,
		paddingTop: 16,
	},
	flex: { flex: 1 },
	headingBlock: { gap: 2 },
});
