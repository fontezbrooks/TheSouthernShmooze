import { useRouter } from "expo-router";
import {
	ImageBackground,
	KeyboardAvoidingView,
	Platform,
	ScrollView,
	StyleSheet,
	View,
} from "react-native";
import { AppHeader } from "@/components/ui/AppHeader";
import { StrokedHeading } from "@/components/ui/StrokedHeading";
import { StrokedText } from "@/components/ui/StrokedText";
import { ConciergeForm } from "@/features/lead-form/ConciergeForm";
import { daisyBackground } from "@/theme/assets";
import { useTheme } from "@/theme/ThemeProvider";

/** Concierge screen — "Concierge" brand kicker + the two-step Find My Pro flow (E3b). */
export function ConciergeScreen() {
	const t = useTheme();
	const router = useRouter();

	return (
		<ImageBackground
			resizeMode="repeat"
			source={daisyBackground}
			style={[styles.flex]}
		>
			<AppHeader
				onBack={() =>
					router.canGoBack() ? router.back() : router.replace("/")
				}
				showBack
			/>
			<KeyboardAvoidingView
				behavior={Platform.OS === "ios" ? "padding" : undefined}
				style={styles.flex}
			>
				<ScrollView
					contentContainerStyle={styles.content}
					keyboardShouldPersistTaps="handled"
				>
					<View style={styles.headingBlock}>
						{/* Brand kicker (C1) — same overline treatment as the Home banner. */}
						<StrokedText style={t.typography.displayXS}>Concierge</StrokedText>
						<StrokedHeading variant="displayL">Find My Pro</StrokedHeading>
					</View>
					<ConciergeForm
						onBackHome={() =>
							router.canGoBack() ? router.back() : router.replace("/")
						}
					/>
				</ScrollView>
			</KeyboardAvoidingView>
		</ImageBackground>
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
	headingBlock: { gap: 4 },
});
