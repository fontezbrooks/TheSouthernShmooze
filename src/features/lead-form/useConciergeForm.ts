import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zipPrefix } from "@/lib/analytics/events";
import { useAnalytics } from "@/lib/analytics/useAnalytics";
import {
	type ConciergeStepOneValues,
	type ConciergeStepTwoValues,
	conciergeStepOneSchema,
	conciergeStepTwoSchema,
	emptyStepOne,
	emptyStepTwo,
} from "./conciergeSchema";
import {
	newSubmissionId,
	submitConciergeLead,
	submitPartialLead,
} from "./submitConcierge";

export type ConciergeStep = "job" | "contact" | "success";
export type SubmitStatus = "idle" | "submitting" | "error";

/**
 * Two-step "Find My Pro" state (design.md §E3b, FR-4.1/FR-4.2).
 * Advancing past step 1 fires a best-effort PARTIAL lead; submitting step 2
 * inserts the complete lead. Id contract from PR #31: each insert target has
 * its OWN stable id — partial and completion ids are distinct, and each is
 * reused only when retrying that same insert. The completion references the
 * partial only when the partial insert actually succeeded (its id is a FK).
 */
export function useConciergeForm() {
	const stepOneForm = useForm<ConciergeStepOneValues>({
		defaultValues: emptyStepOne,
		mode: "onTouched",
		resolver: zodResolver(conciergeStepOneSchema),
	});
	const stepTwoForm = useForm<ConciergeStepTwoValues>({
		defaultValues: emptyStepTwo,
		mode: "onTouched",
		resolver: zodResolver(conciergeStepTwoSchema),
	});

	const { track } = useAnalytics();
	const [step, setStep] = useState<ConciergeStep>("job");
	const [status, setStatus] = useState<SubmitStatus>("idle");
	const [errorMessage, setErrorMessage] = useState<string | null>(null);

	// Funnel step 0 (US-2). Lives HERE, not on the screen: the tab-preserved
	// Concierge screen never remounts, so "Submit Another Request" (reset)
	// must emit its own initiation — one per request, not one per mount
	// (review: PR #43).
	useEffect(() => {
		track("find_my_pro_initiated", {});
	}, [track]);

	// Stable ids across retries (see submitConcierge id contract).
	const partialId = useRef<string | null>(null);
	const completionId = useRef<string | null>(null);
	// Set only when the partial insert succeeded — safe to reference as a FK.
	const savedPartialId = useRef<string | null>(null);
	// In-flight partial insert — awaited before completing so a fast submit on
	// a slow connection still links the partial (review: PR #32).
	const partialInFlight = useRef<Promise<void> | null>(null);
	// Snapshot of the last-submitted step-1 payload: materially edited values
	// get a FRESH partial id (a reused id would duplicate-key against the old
	// row and silently keep stale job data — review: PR #32).
	const lastPartialPayload = useRef<string | null>(null);
	// Same principle for the completion: a retry after edits must not reuse
	// the committed id, or the duplicate-key "success" would confirm the NEW
	// values while the stored lead keeps the OLD ones (review: PR #32).
	const lastCompletionPayload = useRef<string | null>(null);
	// The RESOLVER-TRANSFORMED step-1 values from the last advance. The raw
	// form state (getValues) skips zod's trim — a pasted " 30303 " would pass
	// step 1 yet violate the DB zip check at completion (review: PR #32).
	const validatedJob = useRef<ConciergeStepOneValues | null>(null);

	// The submit callbacks are BUILT inside the event handlers (not during
	// render) so the react-hooks compiler analysis doesn't flag the ref reads.
	const advance = () => {
		// Honeypot fires on step 1 too — the hidden field is mounted in both
		// steps, so a bot that fills it never persists even a partial row
		// (review: PR #32). Pretend success, same as the completion path.
		const honey = stepTwoForm.getValues("company");
		if (honey && honey.length > 0) {
			setStep("success");
			return Promise.resolve();
		}
		return stepOneForm.handleSubmit(async (values) => {
			validatedJob.current = values;
			setStep("contact");
			// Best-effort capture (FR-4.2): never blocks the user; a failure just
			// means the completion won't reference a partial row.
			const payload = JSON.stringify(values);
			let id = partialId.current;
			if (id === null || payload !== lastPartialPayload.current) {
				id = newSubmissionId();
				partialId.current = id;
				savedPartialId.current = null;
				lastPartialPayload.current = payload;
			}
			// THIS request's own outcome — the event flag must not read shared
			// mutable state, which a concurrent re-advance can repoint to a
			// different request (review: PR #43).
			let partialRecorded = false;
			const inFlight = submitPartialLead(values, id).then((result) => {
				partialRecorded = result.ok;
				// Record only if this insert is still the CURRENT partial — an
				// edited re-advance may have superseded it while it was in flight,
				// and a late stale resolution must not overwrite the fresh id
				// (review: PR #32).
				if (result.ok && partialId.current === id) {
					savedPartialId.current = result.data.id;
				}
			});
			partialInFlight.current = inFlight;
			await inFlight;
			// After the partial settles so partial_lead_recorded is truthful (US-2).
			track("find_my_pro_step_1_completed", {
				partial_lead_recorded: partialRecorded,
				requested_category: values.trade,
				zip_prefix: zipPrefix(values.zip),
			});
		})();
	};

	// No-op while a submission is in flight: editing the job mid-submit would
	// let the pending completion resume with NEW job values but the OLD
	// contact snapshot, and possibly race the replacement partial
	// (review: PR #32). The UI also disables the button.
	const back = () => {
		if (status === "submitting") {
			return;
		}
		setStep("job");
	};

	const submit = () => {
		// Honeypot BEFORE validation: the schema rejects any non-empty `company`,
		// so an in-callback check would never run for a bot. A filled field means
		// a bot — pretend success without submitting (legacy rule).
		const honey = stepTwoForm.getValues("company");
		if (honey && honey.length > 0) {
			setStep("success");
			return Promise.resolve();
		}
		return stepTwoForm.handleSubmit(async (values) => {
			setStatus("submitting");
			setErrorMessage(null);

			// Let an in-flight partial land first so its id can be referenced.
			if (partialInFlight.current) {
				await partialInFlight.current;
			}

			const jobValues = validatedJob.current;
			if (!jobValues) {
				// Unreachable via the UI (contact step requires a successful
				// advance) — fail visibly rather than submit unvalidated job data.
				setStatus("error");
				setErrorMessage(
					"Something went wrong submitting your request. Please try again."
				);
				return;
			}
			const payload = JSON.stringify([jobValues, values]);
			let cid = completionId.current;
			if (cid === null || payload !== lastCompletionPayload.current) {
				cid = newSubmissionId();
				completionId.current = cid;
				lastCompletionPayload.current = payload;
			}
			const result = await submitConciergeLead(
				jobValues,
				values,
				savedPartialId.current,
				cid
			);
			if (result.ok) {
				setStatus("idle");
				setStep("success");
				// matched_pro_id omitted: the partner reveal picks the pinned
				// provider independently (see PartnerReveal) — L4 rotation will
				// give the submit path a real matched id.
				track("find_my_pro_submitted", {});
			} else {
				setStatus("error");
				setErrorMessage(result.error);
			}
		})();
	};

	/** Start a fresh request (post-success "Submit Another", tab re-entry). */
	const reset = () => {
		stepOneForm.reset(emptyStepOne);
		stepTwoForm.reset(emptyStepTwo);
		partialId.current = null;
		completionId.current = null;
		savedPartialId.current = null;
		partialInFlight.current = null;
		lastPartialPayload.current = null;
		lastCompletionPayload.current = null;
		validatedJob.current = null;
		setStatus("idle");
		setErrorMessage(null);
		setStep("job");
		// A fresh request begins without a remount — see the mount effect above.
		track("find_my_pro_initiated", {});
	};

	return {
		advance,
		back,
		errorMessage,
		reset,
		status,
		step,
		stepOneForm,
		stepTwoForm,
		submit,
	};
}
