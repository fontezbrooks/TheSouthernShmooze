import { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  conciergeStepOneSchema,
  conciergeStepTwoSchema,
  emptyStepOne,
  emptyStepTwo,
  type ConciergeStepOneValues,
  type ConciergeStepTwoValues,
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
    resolver: zodResolver(conciergeStepOneSchema),
    defaultValues: emptyStepOne,
    mode: "onTouched",
  });
  const stepTwoForm = useForm<ConciergeStepTwoValues>({
    resolver: zodResolver(conciergeStepTwoSchema),
    defaultValues: emptyStepTwo,
    mode: "onTouched",
  });

  const [step, setStep] = useState<ConciergeStep>("job");
  const [status, setStatus] = useState<SubmitStatus>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

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
      const inFlight = submitPartialLead(values, id).then((result) => {
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
    })();
  };

  const back = () => setStep("job");

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
      if (partialInFlight.current) await partialInFlight.current;

      completionId.current ??= newSubmissionId();
      const result = await submitConciergeLead(
        stepOneForm.getValues(),
        values,
        savedPartialId.current,
        completionId.current,
      );
      if (result.ok) {
        setStatus("idle");
        setStep("success");
      } else {
        setStatus("error");
        setErrorMessage(result.error);
      }
    })();
  };

  return {
    step,
    status,
    errorMessage,
    stepOneForm,
    stepTwoForm,
    advance,
    back,
    submit,
  };
}
