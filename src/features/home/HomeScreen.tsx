import { ScrollView, ImageBackground, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { useTheme } from "@/theme/ThemeProvider";
import { daisyBackground } from "@/theme/assets";
import { AppHeader } from "@/components/ui/AppHeader";
import { Banner } from "@/components/ui/Banner";
import { CertifiedProviders } from "@/features/providers/CertifiedProviders";
import { openLink } from "@/lib/openLink";
import { LINKS } from "@/lib/links";

/** Home tab — help banner → concierge, certified providers, community banner. */
export function HomeScreen() {
  const t = useTheme();
  const router = useRouter();

  const callBusiness = (phone: string) => openLink(`tel:${phone}`);

  return (
    <ImageBackground
      source={daisyBackground}
      resizeMode="repeat"
      style={[styles.flex, { backgroundColor: t.colors.bg }]}
    >
      <AppHeader />
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <Banner
          tone="rust"
          title="Let us help you plan"
          subtitle="We'll email you personalized recommendations based on your needs."
          cta={{ label: "Contact Us", icon: "arrowRight" }}
          onPress={() => router.push("/concierge")}
        />

        <CertifiedProviders onCallPress={callBusiness} />

        <Banner
          tone="mustard"
          title="Ask the community"
          subtitle="Get recommendations and connect with locals in our Facebook group."
          cta={{ label: "Join the Facebook Group", icon: "arrowRight" }}
          onPress={() => openLink(LINKS.facebook)}
        />
      </ScrollView>
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
