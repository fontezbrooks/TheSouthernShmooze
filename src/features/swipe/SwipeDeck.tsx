import { View, Text, ActivityIndicator, StyleSheet } from "react-native";
import { useTheme } from "@/theme/ThemeProvider";
import { Button } from "@/components/ui/Button";
import { SwipeCard } from "./SwipeCard";
import type { DeckCard } from "./swipeTypes";

interface SwipeDeckProps {
  current: DeckCard | null;
  loading: boolean;
  error: string | null;
  /** Deck loaded with zero cards (ST5). */
  empty: boolean;
  /** Deck ran out after swiping (ST6 — hand off to the directory). */
  exhausted: boolean;
  onPass: () => void;
  onLike: () => void;
  onNewSearch: () => void;
  /** ST6 CTA — browse the full directory seeded with the search term. */
  onBrowseDirectory: () => void;
  /** Non-swipe tap on the card (profile quick view, S8). */
  onCardPress: (card: DeckCard) => void;
}

/** Presentational deck: the draggable top card + Pass/Match controls, plus the
 * loading / error / no-matches (ST5) / end-of-deck (ST6) states. */
export function SwipeDeck({
  current,
  loading,
  error,
  empty,
  exhausted,
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
  if (empty || !current) {
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
        <SwipeCard
          key={current.id}
          card={current}
          onSwipeLeft={onPass}
          onSwipeRight={onLike}
          onPress={() => onCardPress(current)}
        />
      </View>
      <View style={styles.actions}>
        <Button
          label="Pass"
          variant="outline"
          onPress={onPass}
          style={styles.action}
        />
        <Button
          label="Match"
          variant="solid"
          onPress={onLike}
          style={styles.action}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  // Top-align the card (a little breathing room under the header) with the actions
  // stacked just below it — no big empty gap above, and a clear gap before the buttons
  // so the card never crowds them.
  wrap: { flex: 1, paddingHorizontal: 16, paddingTop: 12 },
  deck: {},
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
