import { zodResolver } from "@hookform/resolvers/zod";
import { randomUUID } from "expo-crypto";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { useAnalytics } from "@/lib/analytics/useAnalytics";
import {
	type FitVerdict,
	type PlacePrediction,
	submitApplication,
	verifyFit,
} from "./wizardApi";
import {
	emptyWizard,
	STEP_COUNT,
	STEP_FIELDS,
	type WizardValues,
	webLinkMissing,
	wizardSchema,
} from "./wizardSchema";

export type WizardPhase = "form" | "analyzing" | "result";

/** Floor under the verify wait — an answer landing in 150ms flashes the
 * analyzing screen and reads as "nothing happened" (site parity). */
const ANALYZE_FLOOR_MS = 700;

/**
 * Check My Fit state machine (design.md §E5). One RHF form across all
 * steps; advancing validates only that step's fields. The final advance
 * runs the live Google verification (which can never reject on failure —
 * see wizardApi.fallbackVerdict) and fires the application submit.
 */
/**
 * Worker outcome → taxonomy status (US-5): verified passes cleanly (approved),
 * unverified passes but gets a concierge look (review), not-yet is the only
 * rejection (flagged).
 */
const OUTCOME_TO_STATUS = {
	"not-yet": "flagged",
	unverified: "review",
	verified: "approved",
} as const;

export function useContractorWizard() {
	const form = useForm<WizardValues>({
		defaultValues: emptyWizard,
		mode: "onTouched",
		resolver: zodResolver(wizardSchema),
	});

	const { identify, resetIdentity, track } = useAnalytics();
	const [step, setStep] = useState(1);
	const [phase, setPhase] = useState<WizardPhase>("form");
	const [verdict, setVerdict] = useState<FitVerdict | null>(null);
	// Google Places billing session: one token folds the autocomplete
	// keystrokes into the Details call. Minted lazily, cleared on reset.
	const placeSession = useRef<string | null>(null);
	// True while an advance (including the final verify+submit) is running.
	const advancing = useRef(false);
	// Leaving the screen (header back / route pop) mid-verification means the
	// user backed out — the pending flow must NOT record the application or
	// set state after unmount (review: PR #34).
	const mounted = useRef(true);
	useEffect(
		() => () => {
			mounted.current = false;
		},
		[]
	);

	const getPlaceSession = () => {
		if (!placeSession.current) {
			placeSession.current = randomUUID();
			form.setValue("placeSession", placeSession.current);
		}
		return placeSession.current;
	};

	const pickPlace = (p: PlacePrediction) => {
		form.setValue("business", p.primary, { shouldValidate: true });
		form.setValue("placeId", p.placeId);
		form.setValue("placeAddress", p.secondary);
	};

	const clearPlace = () => {
		form.setValue("placeId", "");
		form.setValue("placeAddress", "");
	};

	const runVerification = () =>
		// Built inside the handler (react-hooks v6: no ref reads in render).
		// handleSubmit hands us the resolver-TRANSFORMED values — trims applied.
		form.handleSubmit(async (values) => {
			setPhase("analyzing");
			const started = Date.now();
			const res = await verifyFit(values);
			const elapsed = Date.now() - started;
			if (elapsed < ANALYZE_FLOOR_MS) {
				await new Promise((r) => setTimeout(r, ANALYZE_FLOOR_MS - elapsed));
			}
			// User left the screen while verifying — abandon: no application
			// recorded, no setState after unmount.
			if (!mounted.current) {
				return;
			}
			// Fire-and-forget, site parity — the decision is already made. The
			// event chains on the ACTUAL persistence result (review: PR #43) so
			// a swallowed network failure never reports a submission; the UI
			// still advances immediately.
			void submitApplication(values, res).then((persisted) => {
				if (persisted) {
					// First-party identify (B-D11): the applicant typed this
					// email into our own form — person merge, no ATT prompt.
					identify(values.email, {
						applicant_trade: values.trade,
						user_type: "contractor",
					});
					track("contractor_qualification_submitted", {
						applicant_trade: values.trade,
						instant_qualification_response: OUTCOME_TO_STATUS[res.outcome],
					});
				}
			});
			setVerdict(res);
			setPhase("result");
		})();

	const advance = async () => {
		// Synchronous in-flight guard: a rapid double tap would otherwise run
		// two concurrent advances past the awaits below — on the final step
		// that means duplicate verify + application submits (review: PR #34).
		if (advancing.current) {
			return;
		}
		advancing.current = true;
		try {
			await doAdvance();
		} finally {
			advancing.current = false;
		}
	};

	const doAdvance = async () => {
		const fields = [...STEP_FIELDS[step - 1]];
		const valid = await form.trigger(fields, { shouldFocus: true });
		if (!valid) {
			return;
		}
		// Cross-field rule zod can't see per-field: website required unless
		// "no website yet" is checked.
		if (step === 4 && webLinkMissing(form.getValues())) {
			form.setError("webLink", {
				message: "Add a link, or check the box below.",
			});
			return;
		}
		if (step < STEP_COUNT) {
			setStep(step + 1);
			return;
		}
		await runVerification();
	};

	const back = () => {
		// Also blocked while an advance is in flight: phase is still "form"
		// during the await of trigger/handleSubmit, and a Back landing in that
		// window would race the pending setStep — or, on the final step, let
		// verification submit after the user backed away (review: PR #34).
		if (phase !== "form" || advancing.current) {
			return;
		}
		setStep((s) => Math.max(1, s - 1));
	};

	/** Fresh application (post-result re-entry). */
	const reset = () => {
		form.reset(emptyWizard);
		placeSession.current = null;
		setVerdict(null);
		setPhase("form");
		setStep(1);
		// A fresh application may belong to a DIFFERENT person on this
		// device — start it anonymous (review: PR #44).
		resetIdentity();
	};

	return {
		advance,
		back,
		clearPlace,
		form,
		getPlaceSession,
		phase,
		pickPlace,
		reset,
		step,
		stepCount: STEP_COUNT,
		verdict,
	};
}
