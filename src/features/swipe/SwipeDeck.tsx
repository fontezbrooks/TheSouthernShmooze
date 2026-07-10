import { View, Text, ActivityIndicator, StyleSheet } from "react-native";
import { SwipeDeck as SwipeDaddyDeck } from "@fontezbrooks/swipedaddy";
import { useTheme } from "@/theme/ThemeProvider";
import { Button } from "@/components/ui/Button";
import { DeckCardView } from "./DeckCardView";
import { SwipeStamps } from "./SwipeStamps";
import type { SwipeDeckConfig, SwipeDeckRef } from "@fontezbrooks/swipedaddy";
import type { RefObject } from "react";
import type { DeckCard } from "./swipeTypes";

/**
 * Deck engine tuning — parity with the retired hand-rolled SwipeCard:
 * same commit threshold (0.28 × width), same spring, single visible card
 * (no stack), pan engages after a clear horizontal move so taps stay taps.
 * Rotation: the old card tilted 10° at a FULL screen-width drag, i.e. 2.8°
 * at the threshold — the engine clamps at the threshold, so 2.8° is the
 * parity value (same tilt slope while dragging).
 */
const DECK_CONFIG: Partial<SwipeDeckConfig> = {
  visibleCards: 1,
  stackOffsetY: 0,
  stackScaleStep: 0,
  maxRotationRad: (10 * Math.PI) / 180 / (1 / 0.28),
  swipeThresholdRatio: 0.28,
  exitDistanceRatio: 1.5,
  spring: { damping: 20, stiffness: 220, mass: 0.7 },
  activationOffsetX: 12,
};

interface SwipeDeckProps {
  /** Full deck — the engine owns the position; don't slice it. */
  cards: DeckCard[];
  current: DeckCard | null;
  loading: boolean;
  error: string | null;
  /** Deck loaded with zero cards (ST5). */
  empty: boolean;
  /** Deck ran out after swiping (ST6 — hand off to the directory). */
  exhausted: boolean;
  /** Remounts the engine when the search is replaced wholesale (new task). */
  deckKey: string;
  /** Engine controls — the screen commits a confirmed match through it. */
  deckRef: RefObject<SwipeDeckRef | null>;
  /** Mirror of the engine's active index (→ useSwipeDeck.setIndex). */
  onIndexChange: (index: number) => void;
  /** A left swipe committed (gesture or Pass button) — pass flash (ST3). */
  onPass: () => void;
  /** Right-swipe INTENT (gesture or Match button) — the card stays put;
   * the contact page decides the commit. */
  onLike: (card: DeckCard) => void;
  onNewSearch: () => void;
  /** ST6 CTA — browse the full directory seeded with the search term. */
  onBrowseDirectory: () => void;
  /** Non-swipe tap on the card (profile quick view, S8). */
  onCardPress: (card: DeckCard) => void;
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
        style={styles.center}
        color={t.colors.rust}
        accessibilityLabel="Finding matches"
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
          variant="solid"
          onPress={onNewSearch}
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
          Here’s the regular directory — more local pros are waiting there.
        </Text>
        <Button
          label="Browse the directory"
          variant="solid"
          onPress={onBrowseDirectory}
        />
      </View>
    );
  }

  // ST5 — the search matched nothing at all.
  if (empty || cards.length === 0) {
    return (
      <View style={styles.center}>
        <Text style={[t.typography.displayXS, styles.msg]}>
          No matches yet
        </Text>
        <Text
          style={[t.typography.body, styles.msg, { color: t.colors.muted }]}
        >
          Try a different keyword to find local pros.
        </Text>
        <Button label="New search" variant="solid" onPress={onNewSearch} />
      </View>
    );
  }

  return (
    <View style={styles.wrap}>
      <View style={styles.deck}>
        <SwipeDaddyDeck
          key={deckKey}
          ref={deckRef}
          data={cards}
          keyExtractor={(card) => card.id}
          renderCard={(card, _index, progress) => (
            <>
              <DeckCardView card={card} />
              <SwipeStamps progress={progress} />
            </>
          )}
          onSwipeRightIntent={(card) => onLike(card)}
          onSwipeLeft={() => onPass()}
          onCardPress={(card) => onCardPress(card)}
          onActiveIndexChange={onIndexChange}
          config={DECK_CONFIG}
          cardStyle={styles.cardSlot}
        />
      </View>
      <View style={styles.actions}>
        <Button
          label="Pass"
          variant="outline"
          onPress={() => deckRef.current?.swipeLeft()}
          style={styles.action}
        />
        <Button
          label="Match"
          variant="solid"
          onPress={() => current && onLike(current)}
          style={styles.action}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  // The engine positions cards absolutely, so the deck slot must be sized:
  // it takes the space between the header/term pill and the action row (the
  // old intrinsic-height card sat at the top of this same area).
  wrap: { flex: 1, paddingHorizontal: 16, paddingTop: 12 },
  deck: { flex: 1 },
  // Fill the slot; the card face (DeckCardView) sizes itself at the top.
  cardSlot: { width: "100%", height: "100%" },
  actions: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 16,
    marginTop: 24,
  },
  action: { flex: 1 },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    paddingHorizontal: 24,
  },
  msg: { textAlign: "center" },
});
