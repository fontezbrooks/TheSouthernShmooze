import { ScrollView, ImageBackground, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { useTheme } from "@/theme/ThemeProvider";
import { daisyBackground, bannerHelp, bannerCommunity } from "@/theme/assets";
import { AppHeader } from "@/components/ui/AppHeader";
import { Banner } from "@/components/ui/Banner";
import { SearchBarButton } from "@/features/directory/SearchBar";
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
        {/* Entry point to the Directory search — focus the input on arrival so the
            user can type immediately (no second tap). */}
        <SearchBarButton onPress={() => router.push("/directory?focus=1")} />

        <Banner
          layout="imageTop"
          image={bannerHelp}
          title="Let us help you plan"
          subtitle="We'll email recommendations of trusted local businesses based on your specific needs."
          cta={{ label: "Reach Out" }}
          onPress={() => router.push("/concierge")}
        />

        <CertifiedProviders onCallPress={callBusiness} />

        <Banner
          layout="imageLeft"
          image={bannerCommunity}
          title="Ask the community"
          subtitle="Get recommendations and connect with locals."
          cta={{ label: "Join the Facebook Group" }}
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
