import { useRouter } from "expo-router";
import {
	ActivityIndicator,
	FlatList,
	StyleSheet,
	Text,
	View,
} from "react-native";
import { LinkPill } from "@/components/ui/LinkPill";
import { useTheme } from "@/theme/ThemeProvider";
import { BusinessCard } from "./BusinessCard";
import type { DirectoryBusiness } from "./providerTypes";
import { useProviders } from "./useProviders";

interface CertifiedProvidersProps {
	onCallPress: (phone: string) => void;
}

const GUTTER = 16;

interface RailProps {
	cards: DirectoryBusiness[];
	emptyText: string;
	loading: boolean;
	loadingMore: boolean;
	loadMore: () => void;
	onCallPress: (phone: string) => void;
	onCardPress: (sourceUid: string) => void;
}

/** Rail body: spinner, empty message, or the horizontal list. */
function Rail({
	cards,
	emptyText,
	loadMore,
	loading,
	loadingMore,
	onCallPress,
	onCardPress,
}: RailProps) {
	const t = useTheme();

	if (loading) {
		return (
			<ActivityIndicator color={t.brand.colors.clay} style={styles.loading} />
		);
	}

	if (cards.length === 0) {
		return (
			<Text
				style={[
					t.brand.typography.body,
					styles.gutter,
					{ color: t.brand.colors.textSoft },
				]}
			>
				{emptyText}
			</Text>
		);
	}

	return (
		<FlatList
			contentContainerStyle={styles.row}
			data={cards}
			horizontal
			keyExtractor={(b) => b.id}
			ListFooterComponent={
				loadingMore ? (
					<ActivityIndicator
						accessibilityLabel="Loading more providers"
						color={t.brand.colors.clay}
						style={styles.footer}
					/>
				) : null
			}
			onEndReached={loadMore}
			onEndReachedThreshold={0.5}
			renderItem={({ item }) => (
				<BusinessCard
					business={item}
					onCallPress={onCallPress}
					onCardPress={onCardPress}
				/>
			)}
			showsHorizontalScrollIndicator={false}
			testID="providers-rail"
		/>
	);
}

/**
 * Home section: header (+ "View all" pill) and a horizontal rail of provider
 * cards. The rail auto-appends the next PAGE_SIZE batch as the user nears the
 * end — no "See More" tile (July 2026 round, H6/H7).
 *
 * On the 2026 rebrand tokens: Fraunces heading in place of the Shrikhand
 * stroked display, and the rail bleeds past the page gutter so the row visibly
 * continues off-screen — the affordance the clipped-at-the-margin version
 * never gave.
 */
export function CertifiedProviders({ onCallPress }: CertifiedProvidersProps) {
	const t = useTheme();
	const router = useRouter();
	const { pinned, more, loading, loadingMore, error, loadMore } =
		useProviders();
	const cards = [...pinned, ...more];

	const openBiz = (sourceUid: string) => router.push(`/business/${sourceUid}`);

	return (
		<View style={styles.section}>
			<View style={styles.headerRow}>
				<View style={styles.headerText}>
					<Text
						style={[t.brand.typography.accent, { color: t.brand.colors.clay }]}
					>
						Vouched for by neighbors
					</Text>
					<Text accessibilityRole="header" style={t.brand.typography.displayL}>
						Shmooze Certified
					</Text>
				</View>
				<LinkPill
					accessibilityLabel="View all certified providers"
					label="View all"
					onPress={() => router.push("/directory")}
				/>
			</View>

			<Rail
				cards={cards}
				emptyText={error ?? "No providers to show yet."}
				loading={loading}
				loadingMore={loadingMore}
				loadMore={loadMore}
				onCallPress={onCallPress}
				onCardPress={openBiz}
			/>

			{error && cards.length > 0 ? (
				<Text
					accessibilityLiveRegion="polite"
					style={[
						t.brand.typography.caption,
						styles.gutter,
						{ color: t.brand.colors.clayDark },
					]}
				>
					{error}
				</Text>
			) : null}
		</View>
	);
}

const styles = StyleSheet.create({
	footer: { alignSelf: "center", paddingHorizontal: GUTTER },
	gutter: { paddingHorizontal: GUTTER },
	headerRow: {
		alignItems: "flex-end",
		flexDirection: "row",
		gap: 12,
		justifyContent: "space-between",
		paddingHorizontal: GUTTER,
	},
	headerText: { flex: 1 },
	loading: { alignSelf: "flex-start", marginLeft: GUTTER, marginVertical: 12 },
	// paddingTop clears the cards' gold pin (half outside the card edge);
	// paddingBottom clears the soft card shadow so the list doesn't clip it;
	// the gutter padding lets the rail bleed off the edge.
	row: {
		gap: 16,
		paddingBottom: 20,
		paddingHorizontal: GUTTER,
		paddingTop: 6,
	},
	section: { gap: 16 },
});
