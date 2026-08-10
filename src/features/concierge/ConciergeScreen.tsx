import {
  View,
  Text,
  ScrollView,
  ImageBackground,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";
import { useTheme } from "@/theme/ThemeProvider";
import { daisyBackground } from "@/theme/assets";
import { AppHeader } from "@/components/ui/AppHeader";
import { StrokedHeading } from "@/components/ui/StrokedHeading";
import { ConciergeForm } from "@/features/lead-form/ConciergeForm";

/** Concierge screen — "Concierge" brand kicker + the two-step Find My Pro flow (E3b). */
export function ConciergeScreen() {
  const t = useTheme();
  const router = useRouter();

  return (
    <ImageBackground
      source={daisyBackground}
      resizeMode="repeat"
      style={[styles.flex]}
    >
      <AppHeader
        showBack
        onBack={() =>
          router.canGoBack() ? router.back() : router.replace("/")
        }
      />
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.headingBlock}>
            {/* Brand kicker (C1) — same overline treatment as the Home banner. */}
            <Text style={t.typography.displayXS}>Concierge</Text>
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
  flex: { flex: 1 },
  headingBlock: { gap: 4 },
  content: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 44,
    gap: 24,
  },
});
