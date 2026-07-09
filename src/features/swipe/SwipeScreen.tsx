import { useEffect, useState } from "react";
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
import { Icon } from "@/components/ui/Icon";
import { Button } from "@/components/ui/Button";
import { useSwipeSession } from "./SwipeSessionProvider";
import { useSwipeDeck } from "./useSwipeDeck";
import { swipeRepository } from "./swipeRepository";
import { SwipeDeck } from "./SwipeDeck";
import { LeadCaptureModal } from "./LeadCaptureModal";
import { FiltersModal } from "./FiltersModal";
import { ProfileQuickView } from "./ProfileQuickView";
import type { DeckCard, SeekerContact, SwipeTask } from "./swipeTypes";

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

  const [formOpen, setFormOpen] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [pending, setPending] = useState<DeckCard | null>(null);
  /** Error feedback only — success feedback lives in the ST2/ST4 states. */
  const [banner, setBanner] = useState<string | null>(null);
  /** ST2/ST4 match confirmation card ({first} drives the ST1 celebratory copy). */
  const [confirmation, setConfirmation] = useState<{
    name: string;
    first: boolean;
  } | null>(null);
  /** ST3 transient pass flash. */
  const [passed, setPassed] = useState(false);
  const [quickViewUid, setQuickViewUid] = useState<string | null>(null);

  useEffect(() => {
    if (!passed) return;
    const id = setTimeout(() => setPassed(false), PASS_FLASH_MS);
    return () => clearTimeout(id);
  }, [passed]);

  // Change the active search from the deck → re-runs useSwipeDeck with new matches.
  const applyFilters = (next: SwipeTask) => {
    setFiltersOpen(false);
    setBanner(null);
    setConfirmation(null);
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
    if (res.ok) {
      setConfirmation({ name: card.name, first: !session.hasMatched });
      session.markMatched();
    } else {
      setBanner(res.error);
    }
  };

  const onLike = () => {
    const card = deck.current;
    if (!card) return;
    // Confirm every Match: open the (prefilled) form so nothing sends silently.
    setBanner(null);
    setPending(card);
    setFormOpen(true);
  };

  const onPass = () => {
    setBanner(null);
    setPassed(true);
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
    setConfirmation(null);
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
          accessibilityRole="button"
          accessibilityLabel="Back"
          onPress={() => router.back()}
          hitSlop={12}
          style={styles.navBtn}
        >
          <Icon name="chevronLeft" size={28} color={t.colors.rust} />
        </Pressable>
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
      </View>

      {/* S4: surface the active search term; tapping it edits the search. */}
      {session.task ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Searching for ${session.task.keyword}. Change search`}
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
          <Icon name="search" size={14} color={t.colors.rust} />
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
      ) : confirmation ? (
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
            We’ve sent your details to {confirmation.name} — they’ll reach out
            to you.
          </Text>
          <Button
            label="Keep swiping"
            variant="solid"
            onPress={() => setConfirmation(null)}
          />
        </View>
      ) : (
        <SwipeDeck
          current={deck.current}
          loading={deck.loading}
          error={deck.error}
          empty={deck.empty}
          exhausted={deck.exhausted}
          onPass={onPass}
          onLike={onLike}
          onNewSearch={newSearch}
          onBrowseDirectory={browseDirectory}
          onCardPress={(card) => setQuickViewUid(card.sourceUid)}
        />
      )}

      {/* ST3: lightweight transient pass feedback — non-blocking. */}
      {passed ? (
        <View
          pointerEvents="none"
          style={[
            styles.passToast,
            {
              backgroundColor: t.colors.surface,
              borderColor: t.colors.neutral800,
            },
          ]}
        >
          <Text
            style={[t.typography.captionSemi, { color: t.colors.neutral800 }]}
          >
            Passed
          </Text>
        </View>
      ) : null}

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

      {/* S1/S2: one intake surface, two triggers — first entry + filters button. */}
      <FiltersModal
        visible={intakeOpen || filtersOpen}
        current={session.task}
        onClose={() => {
          if (intakeOpen) router.back();
          else setFiltersOpen(false);
        }}
        onApply={applyFilters}
      />

      <ProfileQuickView
        visible={quickViewUid !== null}
        sourceUid={quickViewUid}
        onClose={() => setQuickViewUid(null)}
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
  dots: { fontSize: 24, lineHeight: 24, fontWeight: "800" },
  termPill: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    gap: 6,
    height: 32,
    paddingHorizontal: 12,
    borderWidth: 1,
    marginHorizontal: 16,
    marginBottom: 8,
  },
  banner: {
    marginHorizontal: 16,
    marginBottom: 8,
    padding: 12,
    borderRadius: 12,
  },
  dimmed: { opacity: 0.4 },
  confirmWrap: { gap: 12, paddingHorizontal: 24 },
  centerText: { textAlign: "center" },
  passToast: {
    position: "absolute",
    top: 120,
    alignSelf: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 2,
  },
});
