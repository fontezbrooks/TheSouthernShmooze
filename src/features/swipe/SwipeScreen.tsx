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
import { ContactVerifyModal } from "./ContactVerifyModal";
import type { DeckCard, SeekerContact } from "./swipeTypes";

/**
 * "The Shmoozer" flow: state a task → swipe a confidence-ranked deck → a right-swipe
 * sends an intent-rich lead (gated by one-time contact verification). A null task shows
 * the intake; otherwise the deck.
 */
export function SwipeScreen() {
  const t = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const session = useSwipeSession();
  const deck = useSwipeDeck(session.task, session.sessionToken);

  const [verifyOpen, setVerifyOpen] = useState(false);
  const [pending, setPending] = useState<DeckCard | null>(null);
  const [banner, setBanner] = useState<string | null>(null);

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
      setVerifyOpen(true);
      return;
    }
    deck.advance();
    await sendLead(card);
  };

  const onPass = () => {
    setBanner(null);
    deck.advance();
  };

  const onVerified = async (contact: SeekerContact) => {
    session.setContact(contact);
    setVerifyOpen(false);
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
      <View style={[styles.flex, styles.center, { backgroundColor: t.colors.bg }]}>
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
        >
          <Text style={[t.typography.bodySemibold, { color: t.colors.rust }]}>
            ‹ Back
          </Text>
        </Pressable>
        <Text style={t.typography.displayXS}>The Shmoozer</Text>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="View matches"
          onPress={() => router.push("/matches")}
        >
          <Text style={[t.typography.bodySemibold, { color: t.colors.rust }]}>
            Matches
          </Text>
        </Pressable>
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

      <ContactVerifyModal
        visible={verifyOpen}
        sessionToken={session.sessionToken}
        onClose={() => {
          setVerifyOpen(false);
          setPending(null);
        }}
        onVerified={onVerified}
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
  banner: {
    marginHorizontal: 16,
    marginBottom: 8,
    padding: 12,
    borderRadius: 12,
  },
});
