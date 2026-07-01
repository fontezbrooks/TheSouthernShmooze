import { useState } from "react";
import {
  View,
  Text,
  Pressable,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useTheme } from "@/theme/ThemeProvider";
import { useSwipeSession } from "./SwipeSessionProvider";
import { useSwipeDeck } from "./useSwipeDeck";
import { swipeRepository } from "./swipeRepository";
import { TaskIntake } from "./TaskIntake";
import { SwipeDeck } from "./SwipeDeck";
import { LeadCaptureModal } from "./LeadCaptureModal";
import { FiltersModal } from "./FiltersModal";
import type { DeckCard, SeekerContact, SwipeTask } from "./swipeTypes";

/**
 * "The Shmoozer" flow: state a task → swipe a confidence-ranked deck → a right-swipe
 * sends an intent-rich lead (gated on the first Match by a one-time contact form). A null
 * task shows the intake; otherwise the deck.
 */
export function SwipeScreen() {
  const t = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const session = useSwipeSession();
  const deck = useSwipeDeck(session.task, session.sessionToken);

  const [formOpen, setFormOpen] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [pending, setPending] = useState<DeckCard | null>(null);
  const [banner, setBanner] = useState<string | null>(null);

  // Change the active search from the deck → re-runs useSwipeDeck with new matches.
  const applyFilters = (next: SwipeTask) => {
    setFiltersOpen(false);
    setBanner(null);
    session.setTask(next);
  };

  const sendLead = async (card: DeckCard) => {
    if (!deck.taskId) return;
    const res = await swipeRepository.submitLead(
      session.sessionToken,
      deck.taskId,
      card.sourceUid,
      card.confidence,
    );
    setBanner(res.ok ? "It’s a match! We’ve sent your details." : res.error);
  };

  const onLike = async () => {
    const card = deck.current;
    if (!card) return;
    if (!session.contact?.verified) {
      setPending(card);
      setFormOpen(true);
      return;
    }
    deck.advance();
    await sendLead(card);
  };

  const onPass = () => {
    setBanner(null);
    deck.advance();
  };

  const onSubmitted = async (contact: SeekerContact) => {
    session.setContact(contact);
    setFormOpen(false);
    const card = pending;
    setPending(null);
    if (card) {
      deck.advance();
      await sendLead(card);
    }
  };

  const newSearch = () => {
    setBanner(null);
    session.clearTask();
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

  return (
    <View
      style={[
        styles.flex,
        { backgroundColor: t.colors.bg, paddingTop: insets.top },
      ]}
    >
      <View style={styles.header}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Back"
          onPress={() => router.back()}
          hitSlop={12}
          style={styles.navBtn}
        >
          <Text style={[t.typography.bodySemibold, { color: t.colors.rust }]}>
            ‹ Back
          </Text>
        </Pressable>
        <Text style={t.typography.displayXS}>The Shmoozer</Text>
        <View style={styles.headerRight}>
          {session.task ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Filters"
              onPress={() => setFiltersOpen(true)}
              hitSlop={12}
              style={styles.navBtn}
            >
              <Text style={[styles.dots, { color: t.colors.rust }]}>⋯</Text>
            </Pressable>
          ) : null}
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="View matches"
            onPress={() => router.push("/matches")}
            hitSlop={12}
            style={styles.navBtn}
          >
            <Text style={[t.typography.bodySemibold, { color: t.colors.rust }]}>
              Matches
            </Text>
          </Pressable>
        </View>
      </View>

      {banner ? (
        <View style={[styles.banner, { backgroundColor: t.colors.yellow200 }]}>
          <Text style={[t.typography.captionSemi, { color: t.colors.text }]}>
            {banner}
          </Text>
        </View>
      ) : null}

      {!session.task ? (
        <TaskIntake onSubmit={session.setTask} />
      ) : (
        <SwipeDeck
          current={deck.current}
          loading={deck.loading}
          error={deck.error}
          empty={deck.empty}
          onPass={onPass}
          onLike={onLike}
          onNewSearch={newSearch}
        />
      )}

      <LeadCaptureModal
        visible={formOpen}
        sessionToken={session.sessionToken}
        task={session.task}
        taskId={deck.taskId}
        contact={session.contact}
        onClose={() => {
          setFormOpen(false);
          setPending(null);
        }}
        onSubmitted={onSubmitted}
      />

      <FiltersModal
        visible={filtersOpen}
        current={session.task}
        onClose={() => setFiltersOpen(false)}
        onApply={applyFilters}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  center: { alignItems: "center", justifyContent: "center" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  navBtn: { paddingVertical: 6 },
  headerRight: { flexDirection: "row", alignItems: "center", gap: 16 },
  dots: { fontSize: 24, lineHeight: 24, fontWeight: "800" },
  banner: {
    marginHorizontal: 16,
    marginBottom: 8,
    padding: 12,
    borderRadius: 12,
  },
});
