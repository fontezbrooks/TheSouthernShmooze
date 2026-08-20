import { useRouter } from "expo-router";
import {
	ActivityIndicator,
	FlatList,
	StyleSheet,
	Text,
	View,
} from "react-native";
import { Button } from "@/components/ui/Button";
import { StrokedHeading } from "@/components/ui/StrokedHeading";
import { useTheme } from "@/theme/ThemeProvider";
import { BusinessCard } from "./BusinessCard";
import { useProviders } from "./useProviders";

interface CertifiedProvidersProps {
	onCallPress: (phone: string) => void;
}

/**
 * Home section: header (+ "View all" pill) and a horizontal rail of provider
 * cards. The rail auto-appends the next PAGE_SIZE batch as the user nears the
 * end — no "See More" tile (July 2026 round, H6/H7). Layout and placement are
 * unchanged from the ScrollView version.
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
				<StrokedHeading variant="displayXS">Shmooze Certified</StrokedHeading>
				<Button
					label="View all"
					onPress={() => router.push("/directory")}
					variant="pill"
				/>
			</View>

			{loading ? (
				<ActivityIndicator color={t.colors.rust} style={styles.loading} />
			) : cards.length === 0 ? (
				<Text style={[t.typography.body, { color: t.colors.muted }]}>
					{error ?? "No providers to show yet."}
				</Text>
			) : (
				<FlatList
					contentContainerStyle={styles.row}
					data={cards}
					horizontal
					keyExtractor={(b) => b.id}
					ListFooterComponent={
						loadingMore ? (
							<ActivityIndicator
								accessibilityLabel="Loading more providers"
								color={t.colors.rust}
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
							onCardPress={openBiz}
						/>
					)}
					showsHorizontalScrollIndicator={false}
					testID="providers-rail"
				/>
			)}

			{error && cards.length > 0 ? (
				<Text
					accessibilityLiveRegion="polite"
					style={[t.typography.caption, { color: t.colors.rust }]}
				>
					{error}
				</Text>
			) : null}
		</View>
	);
}

const styles = StyleSheet.create({
	footer: { alignSelf: "center", paddingHorizontal: 16 },
	headerRow: {
		alignItems: "center",
		flexDirection: "row",
		justifyContent: "space-between",
	},
	loading: { alignSelf: "flex-start", marginVertical: 12 },
	// paddingBottom/Right clear the cards' hard shadow (offset 4,4) so the
	// horizontal list doesn't clip it.
	row: { gap: 16, paddingBottom: 12, paddingRight: 16 },
	section: { gap: 12 },
});
