import type { SwipeDeckRef } from "@fontezbrooks/swipedaddy";
import { useRouter } from "expo-router";
import { useEffect, useMemo, useRef, useState } from "react";
import {
	ActivityIndicator,
	Pressable,
	StyleSheet,
	Text,
	View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { useTheme } from "@/theme/ThemeProvider";
import { FiltersModal } from "./FiltersModal";
import { ProfileQuickView } from "./ProfileQuickView";
import { SwipeDeck } from "./SwipeDeck";
import { useSwipeSession } from "./SwipeSessionProvider";
import type { DeckCard, SwipeTask } from "./swipeTypes";
import { useSwipeDeck } from "./useSwipeDeck";

/** How long the transient "Passed" flash stays up (ST3). */
const PASS_FLASH_MS = 900;

/**
 * Find Your Perfect Local Match flow: state a need (type-only overlay intake) →
 * swipe a confidence-ranked deck → a right-swipe sends an intent-rich lead
 * (confirmed via the prefilled contact form). Page states: ST1/ST4 match
 * confirmations, ST3 pass flash, ST5 no-matches, ST6 end-of-deck → directory.
 */
export function SwipeScreen() {
	const t = useTheme();
	const router = useRouter();
	const insets = useSafeAreaInsets();
	const session = useSwipeSession();
	const deck = useSwipeDeck(session.task, session.sessionToken);
	// Deck engine controls (swipedaddy): buttons and the post-confirmation
	// commit drive the deck through this ref.
	const deckRef = useRef<SwipeDeckRef | null>(null);
	// New search = wholesale deck replacement → remount the engine.
	const deckKey = useMemo(() => JSON.stringify(session.task), [session.task]);

	const [filtersOpen, setFiltersOpen] = useState(false);
	/** Error feedback only — success feedback lives in the ST2/ST4 states. */
	const [banner, setBanner] = useState<string | null>(null);
	/** ST3 transient pass flash. */
	const [passed, setPassed] = useState(false);
	const [quickViewUid, setQuickViewUid] = useState<string | null>(null);

	useEffect(() => {
		if (!passed) {
			return;
		}
		const id = setTimeout(() => setPassed(false), PASS_FLASH_MS);
		return () => clearTimeout(id);
	}, [passed]);

	// Change the active search from the deck → re-runs useSwipeDeck with new matches.
	const applyFilters = (next: SwipeTask) => {
		setFiltersOpen(false);
		setBanner(null);
		session.clearMatchResult();
		session.setTask(next);
	};

	// The contact page (CP1) reports a successful send via session.matchResult —
	// rendered directly as the ST2 confirmation. "Keep swiping" advances past the
	// matched card and clears it. Backing out of the page sets nothing, so the
	// card stays current (cancel).
	const confirmation = session.matchResult;
	const keepSwiping = () => {
		// Commit the confirmed match: the engine flings the card and advances
		// (a gesture right-swipe only ever springs back — intent mode).
		deckRef.current?.swipeRight();
		session.clearMatchResult();
	};

	const onLike = (card: DeckCard) => {
		if (!deck.taskId) {
			return;
		}
		// Confirm every Match: the routed contact page — nothing sends silently.
		setBanner(null);
		session.setPending({ card, taskId: deck.taskId });
		router.push("/match-contact");
	};

	// A left swipe already committed in the engine — this is just the ST3 flash.
	const onPass = () => {
		setBanner(null);
		setPassed(true);
	};

	const newSearch = () => {
		setBanner(null);
		session.clearMatchResult();
		session.clearTask();
	};

	// ST6: hand off into the regular directory, seeded with the search term.
	const browseDirectory = () => {
		const q = session.task?.keyword ?? "";
		router.push(`/directory?q=${encodeURIComponent(q)}`);
	};

	if (!session.ready) {
		return (
			<View
				style={[styles.flex, styles.center, { backgroundColor: t.colors.bg }]}
			>
				<ActivityIndicator color={t.colors.rust} />
			</View>
		);
	}

	// S1: no task yet → the type-only intake opens as an overlay over a dimmed,
	// empty deck. Dismissing without a task exits the flow (can't swipe taskless).
	const intakeOpen = !session.task;

	return (
		<View
			style={[
				styles.flex,
				{ backgroundColor: t.colors.bg, paddingTop: insets.top },
			]}
		>
			{/* S5/S6: functional header only — chevron back + filters, no logo. */}
			<View style={styles.header}>
				<Pressable
					accessibilityLabel="Back"
					accessibilityRole="button"
					hitSlop={12}
					onPress={() => router.back()}
					style={styles.navBtn}
				>
					<Icon color={t.colors.rust} name="chevronLeft" size={28} />
				</Pressable>
				{session.task ? (
					<Pressable
						accessibilityLabel="Filters"
						accessibilityRole="button"
						hitSlop={12}
						onPress={() => setFiltersOpen(true)}
						style={styles.navBtn}
					>
						<Text style={[styles.dots, { color: t.colors.rust }]}>⋯</Text>
					</Pressable>
				) : null}
			</View>

			{/* S4: surface the active search term; tapping it edits the search. */}
			{session.task ? (
				<Pressable
					accessibilityLabel={`Searching for ${session.task.keyword}. Change search`}
					accessibilityRole="button"
					onPress={() => setFiltersOpen(true)}
					style={[
						styles.termPill,
						{
							backgroundColor: t.colors.surface,
							borderColor: t.colors.rustDark,
							borderRadius: t.radii.pill,
						},
					]}
				>
					<Icon color={t.colors.rust} name="search" size={14} />
					<Text style={[t.typography.captionSemi, { color: t.colors.text }]}>
						{session.task.keyword}
					</Text>
				</Pressable>
			) : null}

			{banner ? (
				<View style={[styles.banner, { backgroundColor: t.colors.yellow200 }]}>
					<Text style={[t.typography.captionSemi, { color: t.colors.text }]}>
						{banner}
					</Text>
				</View>
			) : null}

			{intakeOpen ? (
				// Dimmed placeholder under the intake overlay.
				<View style={[styles.flex, styles.dimmed]} />
			) : (
				<>
					{/* The deck stays MOUNTED under the confirmation (display:none) —
              unmounting would reset the engine's position; "Keep swiping"
              commits the matched card through deckRef. */}
					<View style={confirmation ? styles.hidden : styles.flex}>
						<SwipeDeck
							cards={deck.cards}
							current={deck.current}
							deckKey={deckKey}
							deckRef={deckRef}
							empty={deck.empty}
							error={deck.error}
							exhausted={deck.exhausted}
							loading={deck.loading}
							onBrowseDirectory={browseDirectory}
							onCardPress={(card) => setQuickViewUid(card.sourceUid)}
							onIndexChange={deck.setIndex}
							onLike={onLike}
							onNewSearch={newSearch}
							onPass={onPass}
						/>
					</View>
					{confirmation ? (
						// ST2 (and ST1 celebratory variant): match confirmation card.
						<View style={[styles.flex, styles.center, styles.confirmWrap]}>
							<Text style={[t.typography.displayXS, styles.centerText]}>
								{confirmation.first ? "Your first match!" : "It’s a match!"}
							</Text>
							<Text
								style={[
									t.typography.body,
									styles.centerText,
									{ color: t.colors.textSoft },
								]}
							>
								Your request is in — {confirmation.name}, your Shmooze preferred
								partner, will reach out to you.
							</Text>
							<Button
								label="Keep swiping"
								onPress={keepSwiping}
								variant="solid"
							/>
						</View>
					) : null}
				</>
			)}

			{/* ST3: lightweight transient pass feedback — non-blocking. Styled as
          the link-pill family: surface pill, rustDark border, hard 4px
          offset shadow (same treatment as SearchBar/profile link pills). */}
			{passed ? (
				<View pointerEvents="none" style={styles.passToast}>
					<View
						style={[styles.passShadow, { backgroundColor: t.colors.rustDark }]}
					/>
					<View
						style={[
							styles.passPill,
							{
								backgroundColor: t.colors.surface,
								borderColor: t.colors.rustDark,
							},
						]}
					>
						<Text style={[t.typography.captionSemi, { color: t.colors.text }]}>
							Passed
						</Text>
					</View>
				</View>
			) : null}

			{/* S1/S2: one intake surface, two triggers — first entry + filters button. */}
			<FiltersModal
				current={session.task}
				onApply={applyFilters}
				onClose={() => {
					if (intakeOpen) {
						router.back();
					} else {
						setFiltersOpen(false);
					}
				}}
				visible={intakeOpen || filtersOpen}
			/>

			<ProfileQuickView
				onClose={() => setQuickViewUid(null)}
				sourceUid={quickViewUid}
				visible={quickViewUid !== null}
			/>
		</View>
	);
}

const styles = StyleSheet.create({
	banner: {
		borderRadius: 12,
		marginBottom: 8,
		marginHorizontal: 16,
		padding: 12,
	},
	center: { alignItems: "center", justifyContent: "center" },
	centerText: { textAlign: "center" },
	confirmWrap: { gap: 12, paddingHorizontal: 24 },
	dimmed: { opacity: 0.4 },
	dots: { fontSize: 24, fontWeight: "800", lineHeight: 24 },
	flex: { flex: 1 },
	header: {
		alignItems: "center",
		flexDirection: "row",
		justifyContent: "space-between",
		paddingHorizontal: 16,
		paddingVertical: 12,
	},
	hidden: { display: "none" },
	navBtn: { paddingVertical: 6 },
	passPill: {
		borderRadius: 999,
		borderWidth: 2,
		paddingHorizontal: 16,
		paddingVertical: 8,
	},
	passShadow: {
		borderRadius: 999,
		bottom: -4,
		left: 4,
		position: "absolute",
		right: -4,
		top: 4,
	},
	passToast: {
		alignSelf: "center",
		position: "absolute",
		top: 120,
	},
	termPill: {
		alignItems: "center",
		alignSelf: "flex-start",
		borderWidth: 1,
		flexDirection: "row",
		gap: 6,
		height: 32,
		marginBottom: 8,
		marginHorizontal: 16,
		paddingHorizontal: 12,
	},
});
