import {
  ScrollView,
  ImageBackground,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";
import { useTheme } from "@/theme/ThemeProvider";
import { daisyBackground } from "@/theme/assets";
import { AppHeader } from "@/components/ui/AppHeader";
import { LeadForm } from "@/features/lead-form/LeadForm";

/** Concierge screen — "Let's Plan Something Awesome" + the lead form. */
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
          <Text style={t.typography.displayL}>
            Let&apos;s Plan Something Awesome
          </Text>
          <LeadForm />
        </ScrollView>
      </KeyboardAvoidingView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 44,
    gap: 24,
  },
});
