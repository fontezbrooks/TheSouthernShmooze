import { useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
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
import { useAnalytics } from "@/lib/analytics/useAnalytics";
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
	const { track } = useAnalytics();
	const pending = session.pending;
	const [sendError, setSendError] = useState<string | null>(null);
	// Set the moment a send succeeds. The popped screen stays mounted through
	// the back transition, so the guard below would otherwise re-run with
	// pending === null and REPLACE the deck with a fresh /swipe — remounting
	// the engine at card 0 (owner report: "Keep swiping" restarted the deck).
	const submitted = useRef(false);

	// Arrived without a pending match (deep link / stale stack) → back to the deck.
	useEffect(() => {
		if (!(pending || submitted.current)) {
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
			// Real lead row id from 0021 (dedupes/correlates against swipe_leads);
			// task id only as a fallback under pre-0021 deploy skew.
			track("shmoozer_match_triggered", {
				concierge_request_id: res.data.leadId ?? pending.taskId,
				pro_business_id: pending.card.sourceUid,
			});
			session.setMatchResult({
				first: !session.hasMatched,
				name: pending.card.name,
			});
			session.markMatched();
			submitted.current = true;
			session.clearPending();
			cancel();
		} else {
			setSendError(res.error);
		}
	};

	const task = session.task;

	return (
		<View style={[styles.flex, { backgroundColor: t.brand.colors.bg }]}>
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
					<Text style={t.brand.typography.displayL}>It’s a match!</Text>
					<Text
						style={[
							t.brand.typography.body,
							{ color: t.brand.colors.textSoft },
						]}
					>
						Share your details and your Shmooze preferred partner will reach out
						to you.
					</Text>

					{sendError ? (
						<Text
							style={[
								t.brand.typography.caption,
								{ color: t.brand.colors.error },
							]}
						>
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
