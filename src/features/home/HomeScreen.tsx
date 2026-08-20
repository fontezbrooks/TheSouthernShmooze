import { useRouter } from "expo-router";
import { ImageBackground, ScrollView, StyleSheet, View } from "react-native";
import { AppHeader } from "@/components/ui/AppHeader";
import { Banner } from "@/components/ui/Banner";
import { LinkPill } from "@/components/ui/LinkPill";
import { SearchBarButton } from "@/features/directory/SearchBar";
import { CertifiedProviders } from "@/features/providers/CertifiedProviders";
import { LINKS } from "@/lib/links";
import { openLink } from "@/lib/openLink";
import { bannerCommunity, bannerHelp, daisyBackground } from "@/theme/assets";
import { useTheme } from "@/theme/ThemeProvider";
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
			resizeMode="repeat"
			source={daisyBackground}
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
					cta={{ label: "Reach Out" }}
					image={bannerHelp}
					layout="imageTop"
					onPress={() => router.push("/concierge")}
					subtitle="We'll email recommendations of trusted local businesses based on your specific needs."
					title="Concierge"
					titleAlign="center"
				/>

				<CertifiedProviders onCallPress={callBusiness} />

				{/* Match block (H1, SR3 grid layout) — logo + title row, full-width CTA.
            Copy: draft, owner approves at PR. */}
				<Banner
					cta={{ label: "Start Matching" }}
					ctaSize="lg"
					imageNode={<MatchCoverLogo height={86} width={120} />}
					layout="titleRow"
					onPress={() => router.push("/swipe")}
					subtitle="Tell us what you need, then swipe to match with trusted local businesses."
					title="Find Your Perfect Local Match"
				/>

				{/* Contractor entry (E5) — Check My Fit wizard; swapped above the
            community banner + SmilyPeach icon per owner (polish round). */}
				<Banner
					cta={{ label: "Check My Fit" }}
					ctaSize="lg"
					imageNode={<SmilyPeachLogo height={94} width={96} />}
					layout="titleRow"
					onPress={() => router.push("/contractor-wizard")}
					subtitle="See if you're a fit for the Shmooze registry — free, takes about 2 minutes."
					title="Are You a Local Pro?"
				/>

				<Banner
					cta={{ label: "Join the Facebook Group" }}
					ctaSize="lg"
					image={bannerCommunity}
					layout="imageLeft"
					onPress={() => openLink(LINKS.facebook)}
					subtitle="Get recommendations and connect with locals."
					title="Ask the community"
					// Much tighter leading than the 42px token default; 36 keeps just enough
					// headroom for Shrikhand ascenders (see typography.ts) — verify on device.
					titleLineHeight={36}
				/>

				{/* Newsletter block (H1) — replaces the Newsletter tab. Copy: draft, owner approves at PR. */}
				<Banner
					cta={{ label: "Subscribe" }}
					layout="imageTop"
					onPress={() => openLink(LINKS.newsletter)}
					subtitle="Local finds and happenings, delivered straight to your inbox."
					title="The Newsletter"
				/>

				{/* Content links (E6): FAQ + About footer row — LinkPills so they
            read as buttons over the daisy background (owner polish round);
            44pt minimum target kept (a11y review: PR #35). */}
				<View style={styles.contentLinks}>
					<LinkPill
						accessibilityLabel="Frequently asked questions"
						label="FAQ"
						onPress={() => router.push("/faq")}
					/>
					<LinkPill
						accessibilityLabel="About The Southern Shmooze"
						label="About the Shmooze"
						onPress={() => router.push("/about")}
					/>
				</View>
			</ScrollView>
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
	contentLinks: {
		flexDirection: "row",
		gap: 16,
		justifyContent: "center",
	},
	flex: { flex: 1 },
});
