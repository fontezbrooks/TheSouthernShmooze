import { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
} from "react-native";
import { useRouter } from "expo-router";
import { useTheme } from "@/theme/ThemeProvider";
import { AppHeader } from "@/components/ui/AppHeader";
import { CategoryChip } from "@/features/providers/CategoryChips";
import { swipeRepository } from "./swipeRepository";
import { useSwipeSession } from "./SwipeSessionProvider";
import { LeadCaptureForm } from "./LeadCaptureForm";
import type { BudgetBand, SeekerContact, Timing } from "./swipeTypes";

const BUDGET_LABELS: Record<BudgetBand, string> = {
  lt_1000: "< $1,000",
  "1000_5000": "$1k–$5k",
  gt_5000: "> $5,000",
};

const TIMING_LABELS: Record<Timing, string> = {
  asap: "ASAP",
  this_week: "This week",
  flexible: "Flexible",
};

/**
 * Match contact page (CP1–CP3): the routed replacement for the old
 * LeadCaptureModal. Shows the task tags, the "It's a match!" copy, and the
 * prefilled contact form; a successful send reports back to the deck via the
 * session (matchResult) — backing out cancels without sending.
 */
export function MatchContactScreen() {
  const t = useTheme();
  const router = useRouter();
  const session = useSwipeSession();
  const pending = session.pending;
  const [sendError, setSendError] = useState<string | null>(null);

  // Arrived without a pending match (deep link / stale stack) → back to the deck.
  useEffect(() => {
    if (!pending) router.replace("/swipe");
  }, [pending, router]);

  if (!pending) return null;

  // Back = cancel: no send, the card stays current on the deck (CP1).
  const cancel = () =>
    router.canGoBack() ? router.back() : router.replace("/swipe");

  const onSubmitted = async (contact: SeekerContact) => {
    session.setContact(contact);
    setSendError(null);
    const res = await swipeRepository.submitLead(
      session.sessionToken,
      pending.taskId,
      pending.card.sourceUid,
      pending.card.confidence,
    );
    if (res.ok) {
      session.setMatchResult({
        name: pending.card.name,
        first: !session.hasMatched,
      });
      session.markMatched();
      session.clearPending();
      cancel();
    } else {
      setSendError(res.error);
    }
  };

  const task = session.task;

  return (
    <View style={[styles.flex, { backgroundColor: t.colors.bg }]}>
      <AppHeader showBack onBack={cancel} />
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* CP3: the task behind this match (keyword always; extras when set). */}
          {task ? (
            <View style={styles.chips}>
              <CategoryChip label={task.keyword} selected />
              {task.budget ? (
                <CategoryChip
                  label={BUDGET_LABELS[task.budget]}
                  selected={false}
                />
              ) : null}
              {task.timing ? (
                <CategoryChip
                  label={TIMING_LABELS[task.timing]}
                  selected={false}
                />
              ) : null}
            </View>
          ) : null}

          {/* CP2 — concierge-request framing (design.md §E4, Q6): a right-swipe
              IS a concierge request with this business pinned as the partner.
              Copy: draft, owner approves at PR. */}
          <Text style={t.typography.displayS}>It’s a match!</Text>
          <Text style={[t.typography.body, { color: t.colors.textSoft }]}>
            Share your details and your Shmooze preferred partner will reach
            out to you.
          </Text>

          {sendError ? (
            <Text style={[t.typography.caption, { color: t.colors.error }]}>
              {sendError}
            </Text>
          ) : null}

          <LeadCaptureForm
            sessionToken={session.sessionToken}
            task={task}
            taskId={pending.taskId}
            contact={session.contact}
            onSubmitted={onSubmitted}
            onCancel={cancel}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 44,
    gap: 12,
  },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
});
