import { ScrollView, ImageBackground, StyleSheet, View } from "react-native";
import { useRouter } from "expo-router";
import { useTheme } from "@/theme/ThemeProvider";
import { daisyBackground, bannerHelp, bannerCommunity } from "@/theme/assets";
import { AppHeader } from "@/components/ui/AppHeader";
import { Banner } from "@/components/ui/Banner";
import { LinkPill } from "@/components/ui/LinkPill";
import { SearchBarButton } from "@/features/directory/SearchBar";
import { CertifiedProviders } from "@/features/providers/CertifiedProviders";
import { openLink } from "@/lib/openLink";
import { LINKS } from "@/lib/links";
// Lives under src/ (not assets/) so the EAS uploader bundles it — see the nav
// icons note in app/(tabs)/_layout.tsx.
import MatchCoverLogo from "./match-cover-logo.svg";
import SmilyPeachLogo from "./smily-peach.svg";

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
            user can type immediately (no second tap); `from=home` shows the back
            chevron in the Directory search row (H11). */}
        <SearchBarButton
          onPress={() => router.push("/directory?focus=1&from=home")}
        />

        {/* Top card per owner Figma 85:3127 (amendment A1): centered "Concierge"
            title, photo, helper text, standard Button S. */}
        <Banner
          layout="imageTop"
          image={bannerHelp}
          title="Concierge"
          titleAlign="center"
          subtitle="We'll email recommendations of trusted local businesses based on your specific needs."
          cta={{ label: "Reach Out" }}
          onPress={() => router.push("/concierge")}
        />

        <CertifiedProviders onCallPress={callBusiness} />

        {/* Match block (H1, SR3 grid layout) — logo + title row, full-width CTA.
            Copy: draft, owner approves at PR. */}
        <Banner
          layout="titleRow"
          imageNode={<MatchCoverLogo width={120} height={86} />}
          title="Find Your Perfect Local Match"
          subtitle="Tell us what you need, then swipe to match with trusted local businesses."
          cta={{ label: "Start Matching" }}
          ctaSize="lg"
          onPress={() => router.push("/swipe")}
        />

        {/* Contractor entry (E5) — Check My Fit wizard; swapped above the
            community banner + SmilyPeach icon per owner (polish round). */}
        <Banner
          layout="titleRow"
          imageNode={<SmilyPeachLogo width={96} height={94} />}
          title="Are You a Local Pro?"
          subtitle="See if you're a fit for the Shmooze registry — free, takes about 2 minutes."
          cta={{ label: "Check My Fit" }}
          ctaSize="lg"
          onPress={() => router.push("/contractor-wizard")}
        />

        <Banner
          layout="imageLeft"
          image={bannerCommunity}
          title="Ask the community"
          // Much tighter leading than the 42px token default; 36 keeps just enough
          // headroom for Shrikhand ascenders (see typography.ts) — verify on device.
          titleLineHeight={36}
          subtitle="Get recommendations and connect with locals."
          cta={{ label: "Join the Facebook Group" }}
          ctaSize="lg"
          onPress={() => openLink(LINKS.facebook)}
        />

        {/* Newsletter block (H1) — replaces the Newsletter tab. Copy: draft, owner approves at PR. */}
        <Banner
          layout="imageTop"
          title="The Newsletter"
          subtitle="Local finds and happenings, delivered straight to your inbox."
          cta={{ label: "Subscribe" }}
          onPress={() => openLink(LINKS.newsletter)}
        />

        {/* Content links (E6): FAQ + About footer row — LinkPills so they
            read as buttons over the daisy background (owner polish round);
            44pt minimum target kept (a11y review: PR #35). */}
        <View style={styles.contentLinks}>
          <LinkPill
            label="FAQ"
            accessibilityLabel="Frequently asked questions"
            onPress={() => router.push("/faq")}
          />
          <LinkPill
            label="About the Shmooze"
            accessibilityLabel="About The Southern Shmooze"
            onPress={() => router.push("/about")}
          />
        </View>
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
  contentLinks: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 16,
  },
});
