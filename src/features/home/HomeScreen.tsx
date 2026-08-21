import { useRouter } from "expo-router";
import { ScrollView, StyleSheet, View } from "react-native";
import { AppHeader } from "@/components/ui/AppHeader";
import { LinkPill } from "@/components/ui/LinkPill";
import { SearchBarButton } from "@/features/directory/SearchBar";
import { CertifiedProviders } from "@/features/providers/CertifiedProviders";
import { useAnalytics } from "@/lib/analytics/useAnalytics";
import { LINKS } from "@/lib/links";
import { openLink } from "@/lib/openLink";
import { useTheme } from "@/theme/ThemeProvider";
import { CommunityBlock } from "./CommunityBlock";
import { ConciergeHero } from "./ConciergeHero";
import { ForkCard } from "./ForkCard";
import { HomeSection, PAGE_PADDING } from "./HomeSection";
// Lives under src/ (not assets/) so the EAS uploader bundles it — see the nav
// icons note in app/(tabs)/_layout.tsx.
import MatchCoverLogo from "./match-cover-logo.svg";
import { NewsletterStrip } from "./NewsletterStrip";
import SmilyPeachLogo from "./smily-peach.svg";

/**
 * Home tab, on the 2026 rebrand tokens (`t.brand`) — the last screen still
 * running the legacy Figma system.
 *
 * The scroll is tiered rather than flat: one hero front door (Concierge), then
 * the registry itself on a porch-cream band, then the two secondary paths as a
 * fork, then community, then the quiet items. Previously all six were
 * full-width rust slabs of identical weight, which made four unequal entries
 * look like peers and buried the registry below the fold.
 */
export function HomeScreen() {
	const t = useTheme();
	const router = useRouter();
	const { resetIdentityForAudience, track } = useAnalytics();

	const callBusiness = (phone: string) => openLink(`tel:${phone}`);

	const startContractorWizard = () => {
		// Audience boundary (review: PR #44): a device identified as a DIFFERENT
		// audience must not attribute the contractor funnel to that person — drop
		// to anonymous BEFORE the entry event. A returning contractor keeps their
		// identity.
		resetIdentityForAudience("contractor");
		track("contractor_portal_started", { entry_point: "home_banner" });
		router.push("/contractor-wizard");
	};

	return (
		<View style={[styles.flex, { backgroundColor: t.brand.colors.bg }]}>
			<AppHeader />
			<ScrollView
				contentContainerStyle={styles.content}
				keyboardShouldPersistTaps="handled"
			>
				{/* Entry point to the Directory search — focus the input on arrival so the
            user can type immediately (no second tap); `from=home` shows the back
            chevron in the Directory search row (H11). */}
				<HomeSection paddingBottom={28} paddingTop={16}>
					<SearchBarButton
						onPress={() => router.push("/directory?focus=1&from=home")}
					/>
				</HomeSection>

				<HomeSection paddingBottom={36} paddingTop={0}>
					<ConciergeHero onPress={() => router.push("/concierge")} />
				</HomeSection>

				{/* The registry is the product (PRODUCT.md principle 5), so it sits
            directly under the front door on its own band instead of below a
            viewport of promos. */}
				<HomeSection bleed paddingBottom={32} paddingTop={32} tone="cream">
					<CertifiedProviders onCallPress={callBusiness} />
				</HomeSection>

				<HomeSection paddingBottom={36}>
					<View style={styles.fork}>
						<ForkCard
							accessibilityHint="Opens the swipe deck"
							cta="Start Matching"
							icon={<MatchCoverLogo height={62} width={86} />}
							onPress={() => router.push("/swipe")}
							subtitle="Tell us what you need, then swipe."
							title="Find Your Match"
						/>
						<ForkCard
							accessibilityHint="Opens the contractor fit check"
							cta="Check My Fit"
							icon={<SmilyPeachLogo height={68} width={70} />}
							onPress={startContractorWizard}
							subtitle="Free, takes about 2 minutes."
							title="Are You a Local Pro?"
						/>
					</View>
				</HomeSection>

				<HomeSection paddingBottom={36} paddingTop={0}>
					<CommunityBlock onPress={() => openLink(LINKS.facebook)} />
				</HomeSection>

				<HomeSection paddingBottom={32} paddingTop={0}>
					<NewsletterStrip onPress={() => openLink(LINKS.newsletter)} />
				</HomeSection>

				{/* Content links (E6): FAQ + About footer row — LinkPills so they read
            as buttons; 44pt minimum target kept (a11y review: PR #35). */}
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
		</View>
	);
}

const styles = StyleSheet.create({
	// No horizontal padding here: sections own their gutter so the provider rail
	// can bleed off the edge.
	content: { paddingBottom: 44 },
	contentLinks: {
		flexDirection: "row",
		gap: 16,
		justifyContent: "center",
		paddingHorizontal: PAGE_PADDING,
	},
	flex: { flex: 1 },
	fork: { flexDirection: "row", gap: 12 },
});
