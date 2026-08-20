import type { SwipeDeckConfig, SwipeDeckRef } from "@fontezbrooks/swipedaddy";
import { SwipeDeck as SwipeDaddyDeck } from "@fontezbrooks/swipedaddy";
import type { RefObject } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { Button } from "@/components/ui/Button";
import { useTheme } from "@/theme/ThemeProvider";
import { DeckCardView } from "./DeckCardView";
import { SwipeStamps } from "./SwipeStamps";
import type { DeckCard } from "./swipeTypes";

/**
 * Deck engine tuning. Gesture feel is parity with the retired hand-rolled
 * SwipeCard: same commit threshold (0.28 × width), same spring, pan engages
 * after a clear horizontal move so taps stay taps. Rotation: the old card
 * tilted 10° at a FULL screen-width drag, i.e. 2.8° at the threshold — the
 * engine clamps at the threshold, so 2.8° is the parity value.
 * Presentation: a visible stack of up to 3 cards (owner request, device
 * round 2) — the engine simply shows fewer when fewer remain.
 */
const DECK_CONFIG: Partial<SwipeDeckConfig> = {
	activationOffsetX: 12,
	exitDistanceRatio: 1.5,
	maxRotationRad: (10 * Math.PI) / 180 / (1 / 0.28),
	spring: { damping: 20, mass: 0.7, stiffness: 220 },
	stackOffsetY: 14,
	stackScaleStep: 0.05,
	swipeThresholdRatio: 0.28,
	visibleCards: 3,
};

interface SwipeDeckProps {
	/** Full deck — the engine owns the position; don't slice it. */
	cards: DeckCard[];
	current: DeckCard | null;
	/** Remounts the engine when the search is replaced wholesale (new task). */
	deckKey: string;
	/** Engine controls — the screen commits a confirmed match through it. */
	deckRef: RefObject<SwipeDeckRef | null>;
	/** Deck loaded with zero cards (ST5). */
	empty: boolean;
	error: string | null;
	/** Deck ran out after swiping (ST6 — hand off to the directory). */
	exhausted: boolean;
	loading: boolean;
	/** ST6 CTA — browse the full directory seeded with the search term. */
	onBrowseDirectory: () => void;
	/** Non-swipe tap on the card (profile quick view, S8). */
	onCardPress: (card: DeckCard) => void;
	/** Mirror of the engine's active index (→ useSwipeDeck.setIndex). */
	onIndexChange: (index: number) => void;
	/** Right-swipe INTENT (gesture or Match button) — the card stays put;
	 * the contact page decides the commit. */
	onLike: (card: DeckCard) => void;
	onNewSearch: () => void;
	/** A left swipe committed (gesture or Pass button) — pass flash (ST3). */
	onPass: () => void;
}

/** Presentational deck: the swipeDaddy engine + Pass/Match controls, plus the
 * loading / error / no-matches (ST5) / end-of-deck (ST6) states. */
export function SwipeDeck({
	cards,
	current,
	loading,
	error,
	empty,
	exhausted,
	deckKey,
	deckRef,
	onIndexChange,
	onPass,
	onLike,
	onNewSearch,
	onBrowseDirectory,
	onCardPress,
}: SwipeDeckProps) {
	const t = useTheme();

	if (loading) {
		return (
			<ActivityIndicator
				accessibilityLabel="Finding matches"
				color={t.colors.rust}
				style={styles.center}
			/>
		);
	}

	if (error) {
		return (
			<View style={styles.center}>
				<Text
					style={[t.typography.body, styles.msg, { color: t.colors.error }]}
				>
					{error}
				</Text>
				<Button
					label="Try another search"
					onPress={onNewSearch}
					variant="solid"
				/>
			</View>
		);
	}

	// ST6 — swiped through everything: hand off into the regular directory.
	if (exhausted) {
		return (
			<View style={styles.center}>
				<Text style={[t.typography.displayXS, styles.msg]}>
					That’s it for matches
				</Text>
				<Text
					style={[t.typography.body, styles.msg, { color: t.colors.muted }]}
				>
					Here’s the registry — more local pros are waiting there.
				</Text>
				<Button
					label="Browse the registry"
					onPress={onBrowseDirectory}
					variant="solid"
				/>
			</View>
		);
	}

	// ST5 — the search matched nothing at all.
	if (empty || cards.length === 0) {
		return (
			<View style={styles.center}>
				<Text style={[t.typography.displayXS, styles.msg]}>No matches yet</Text>
				<Text
					style={[t.typography.body, styles.msg, { color: t.colors.muted }]}
				>
					Try a different keyword to find local pros.
				</Text>
				<Button label="New search" onPress={onNewSearch} variant="solid" />
			</View>
		);
	}

	return (
		<View style={styles.wrap}>
			<View style={styles.deck}>
				<SwipeDaddyDeck
					cardStyle={styles.cardSlot}
					config={DECK_CONFIG}
					data={cards}
					key={deckKey}
					keyExtractor={(card) => card.id}
					onActiveIndexChange={onIndexChange}
					onCardPress={(card) => onCardPress(card)}
					onSwipeLeft={() => onPass()}
					onSwipeRightIntent={(card) => onLike(card)}
					ref={deckRef}
					renderCard={(card, _index, progress) => (
						<>
							<DeckCardView card={card} />
							<SwipeStamps progress={progress} />
						</>
					)}
				/>
			</View>
			<View style={styles.actions}>
				<Button
					label="Pass"
					onPress={() => deckRef.current?.swipeLeft()}
					style={styles.action}
					variant="outline"
				/>
				<Button
					label="Match"
					onPress={() => current && onLike(current)}
					style={styles.action}
					variant="solid"
				/>
			</View>
		</View>
	);
}

const styles = StyleSheet.create({
	action: { flex: 1 },
	actions: {
		alignItems: "center",
		flexDirection: "row",
		gap: 16,
		justifyContent: "center",
		marginBottom: 12,
		marginTop: 24,
	},
	// Fill the slot; the card face (DeckCardView) sizes itself at the top.
	cardSlot: { height: "100%", width: "100%" },
	center: {
		alignItems: "center",
		flex: 1,
		gap: 12,
		justifyContent: "center",
		paddingHorizontal: 24,
	},
	deck: { flex: 1, maxHeight: 520 },
	msg: { textAlign: "center" },
	// The engine positions cards absolutely, so the deck slot must be sized.
	// The cap keeps the slot close to the card face's natural height so the
	// action row sits just under the card (device feedback: uncapped flex
	// pushed Pass/Match to the screen bottom, over the home indicator).
	wrap: { flex: 1, paddingHorizontal: 16, paddingTop: 12 },
});
