import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useRef, useState } from "react";
import {
	ActivityIndicator,
	FlatList,
	InteractionManager,
	Pressable,
	StyleSheet,
	Text,
	type TextInput,
	View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Icon } from "@/components/ui/Icon";
import { LinkPill } from "@/components/ui/LinkPill";
import { PhysicalPressable } from "@/components/ui/PhysicalPressable";
import { CategoryChips } from "@/features/providers/CategoryChips";
import { useAnalytics } from "@/lib/analytics/useAnalytics";
import { LINKS } from "@/lib/links";
import { openLink } from "@/lib/openLink";
import { useTheme } from "@/theme/ThemeProvider";
import { BusinessCardHorizontal } from "./BusinessCardHorizontal";
import { SearchBar } from "./SearchBar";
import { SearchEmptyState } from "./SearchEmptyState";
import { useDirectorySearch } from "./useDirectorySearch";

/**
 * Directory tab — search bar pinned at the top (no app header), category chips
 * under it, and the certified-first list. The search bar filters via the
 * `directory_search` RPC and walks browse → results → no-results in place. A
 * back chevron appears when the user arrived from another screen (`?from=`);
 * the heart button is the pinned entry into Find Your Perfect Local Match.
 */
export function DirectoryScreen() {
	const t = useTheme();
	const router = useRouter();
	const { resetIdentity, track } = useAnalytics();
	const insets = useSafeAreaInsets();
	const s = useDirectorySearch();
	const { setQuery } = s;
	const inputRef = useRef<TextInput | null>(null);
	const { focus, from, q } = useLocalSearchParams<{
		focus?: string;
		from?: string;
		q?: string;
	}>();

	const [showBack, setShowBack] = useState(false);
	const pendingFocus = useRef(false);

	// Consume arrival params (Home search → ?focus=1&from=home; end-of-deck →
	// ?q=…), then clear them — tab params persist across visits, so a stale param
	// would re-trigger on the next plain tab press. The focus WORK lives in the
	// stable effect below: this effect re-runs when the params clear, and a
	// cleanup here would cancel the pending focus task mid-transition (the
	// original "second tap to type" bug).
	useFocusEffect(
		useCallback(() => {
			if (!(focus || from || q)) {
				return;
			}
			if (focus) {
				pendingFocus.current = true;
			}
			if (from) {
				setShowBack(true);
			}
			if (typeof q === "string" && q.length > 0) {
				setQuery(q);
			}
			router.setParams({ focus: undefined, from: undefined, q: undefined });
		}, [focus, from, q, router, setQuery])
	);

	// Focus after the tab/push transition settles, retrying on the next frame if
	// the first shot landed before the input was ready. Stable callback: the
	// cleanup cancels only on a real blur, never on a param-clearing re-render.
	useFocusEffect(
		useCallback(() => {
			if (!pendingFocus.current) {
				return;
			}
			pendingFocus.current = false;
			const task = InteractionManager.runAfterInteractions(() => {
				inputRef.current?.focus();
				requestAnimationFrame(() => {
					if (!inputRef.current?.isFocused()) {
						inputRef.current?.focus();
					}
				});
			});
			return () => task.cancel();
		}, [])
	);

	// The back chevron is per-visit: leaving the tab clears it.
	useFocusEffect(useCallback(() => () => setShowBack(false), []));

	const openDetail = (sourceUid: string) =>
		router.push(`/business/${sourceUid}`);

	return (
		// Registry tab wears the rebrand: plain Magnolia base (design.md §E2).
		<View style={[styles.flex, { backgroundColor: t.brand.colors.bg }]}>
			<View style={[styles.searchWrap, { paddingTop: insets.top + 8 }]}>
				<View style={styles.searchRow}>
					{showBack ? (
						<Pressable
							accessibilityLabel="Back"
							accessibilityRole="button"
							hitSlop={12}
							onPress={() => router.back()}
						>
							<Icon color={t.brand.colors.clay} name="chevronLeft" size={28} />
						</Pressable>
					) : null}
					<View style={styles.searchBarFlex}>
						<SearchBar
							inputRef={inputRef}
							onBlur={() => s.setFocused(false)}
							onChangeText={s.setQuery}
							onFocus={() => s.setFocused(true)}
							value={s.query}
						/>
					</View>
					{/* Pinned Find Your Perfect Local Match entry (D1) — interim Feather
              heart glyph per design §8. */}
					<PhysicalPressable
						accessibilityLabel="Find Your Perfect Local Match"
						fullWidth={false}
						onPress={() => router.push("/swipe")}
						radius={24}
						style={[
							styles.matchBtn,
							{
								backgroundColor: t.brand.colors.clay,
								borderColor: t.brand.colors.clayDark,
							},
						]}
					>
						<Icon color={t.colors.white} name="heart" size={22} />
					</PhysicalPressable>
				</View>
				<CategoryChips onSelect={setQuery} selected={s.query} />
			</View>

			{s.loading ? (
				<ActivityIndicator
					accessibilityLabel="Loading registry"
					color={t.brand.colors.clay}
					style={styles.center}
				/>
			) : s.mode === "no-results" ? (
				<SearchEmptyState onAskCommunity={() => openLink(LINKS.facebook)} />
			) : (
				<FlatList
					contentContainerStyle={styles.list}
					data={s.items}
					keyboardShouldPersistTaps="handled"
					keyExtractor={(b) => b.id}
					ListFooterComponent={
						<View>
							{s.searching && s.items.length === 0 ? (
								<ActivityIndicator
									color={t.brand.colors.clay}
									style={styles.footer}
								/>
							) : s.error ? (
								<Text
									style={[
										t.typography.caption,
										styles.error,
										{ color: t.colors.error },
									]}
								>
									{s.error}
								</Text>
							) : null}
							{/* Contractor entry (design.md §E5: home + registry footer) —
                  LinkPill so it reads as a button (owner polish round). */}
							<LinkPill
								label="I run a business — Check My Fit"
								onPress={() => {
									// Audience boundary (review: PR #44) — see HomeScreen CTA.
									resetIdentity();
									track("contractor_portal_started", {
										entry_point: "registry_footer",
									});
									router.push("/contractor-wizard");
								}}
								style={styles.proFooter}
							/>
						</View>
					}
					renderItem={({ item }) => (
						<BusinessCardHorizontal business={item} onPress={openDetail} />
					)}
				/>
			)}
		</View>
	);
}

const styles = StyleSheet.create({
	center: { marginTop: 48 },
	error: { paddingVertical: 24, textAlign: "center" },
	flex: { flex: 1 },
	footer: { paddingVertical: 24 },
	list: { gap: 16, paddingBottom: 44, paddingHorizontal: 16, paddingTop: 8 },
	matchBtn: {
		alignItems: "center",
		borderRadius: 24,
		borderWidth: 2,
		height: 48,
		justifyContent: "center",
		width: 48,
	},
	proFooter: { alignSelf: "center", marginVertical: 16 },
	searchBarFlex: { flex: 1 },
	searchRow: {
		alignItems: "center",
		flexDirection: "row",
		gap: 12,
	},
	searchWrap: {
		gap: 12,
		paddingBottom: 8,
		paddingHorizontal: 16,
	},
});
