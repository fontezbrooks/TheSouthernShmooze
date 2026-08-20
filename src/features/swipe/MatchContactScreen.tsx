import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
	KeyboardAvoidingView,
	Platform,
	ScrollView,
	StyleSheet,
	Text,
	View,
} from "react-native";
import { AppHeader } from "@/components/ui/AppHeader";
import { CategoryChip } from "@/features/providers/CategoryChips";
import { useTheme } from "@/theme/ThemeProvider";
import { LeadCaptureForm } from "./LeadCaptureForm";
import { useSwipeSession } from "./SwipeSessionProvider";
import { swipeRepository } from "./swipeRepository";
import type { BudgetBand, SeekerContact, Timing } from "./swipeTypes";

const BUDGET_LABELS: Record<BudgetBand, string> = {
	"1000_5000": "$1k–$5k",
	gt_5000: "> $5,000",
	lt_1000: "< $1,000",
};

const TIMING_LABELS: Record<Timing, string> = {
	asap: "ASAP",
	flexible: "Flexible",
	this_week: "This week",
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
		if (!pending) {
			router.replace("/swipe");
		}
	}, [pending, router]);

	if (!pending) {
		return null;
	}

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
			pending.card.confidence
		);
		if (res.ok) {
			session.setMatchResult({
				first: !session.hasMatched,
				name: pending.card.name,
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
			<AppHeader onBack={cancel} showBack />
			<KeyboardAvoidingView
				behavior={Platform.OS === "ios" ? "padding" : undefined}
				style={styles.flex}
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
						Share your details and your Shmooze preferred partner will reach out
						to you.
					</Text>

					{sendError ? (
						<Text style={[t.typography.caption, { color: t.colors.error }]}>
							{sendError}
						</Text>
					) : null}

					<LeadCaptureForm
						contact={session.contact}
						onCancel={cancel}
						onSubmitted={onSubmitted}
						sessionToken={session.sessionToken}
						task={task}
						taskId={pending.taskId}
					/>
				</ScrollView>
			</KeyboardAvoidingView>
		</View>
	);
}

const styles = StyleSheet.create({
	chips: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
	content: {
		gap: 12,
		paddingBottom: 44,
		paddingHorizontal: 16,
		paddingTop: 8,
	},
	flex: { flex: 1 },
});
