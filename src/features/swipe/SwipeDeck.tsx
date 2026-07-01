import { View, Text, ActivityIndicator, StyleSheet } from "react-native";
import { useTheme } from "@/theme/ThemeProvider";
import { Button } from "@/components/ui/Button";
import { SwipeCard } from "./SwipeCard";
import type { DeckCard } from "./swipeTypes";

interface SwipeDeckProps {
  current: DeckCard | null;
  loading: boolean;
  error: string | null;
  empty: boolean;
  onPass: () => void;
  onLike: () => void;
  onNewSearch: () => void;
}

/** Presentational deck: the draggable top card + Pass/Match controls, plus the
 * loading / error / empty states. */
export function SwipeDeck({
  current,
  loading,
  error,
  empty,
  onPass,
  onLike,
  onNewSearch,
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

  if (empty || !current) {
    return (
      <View style={styles.center}>
        <Text style={[t.typography.displayXS, styles.msg]}>
          That’s everyone for now
        </Text>
        <Text
          style={[t.typography.body, styles.msg, { color: t.colors.muted }]}
        >
          Widen your search or try a different keyword.
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
