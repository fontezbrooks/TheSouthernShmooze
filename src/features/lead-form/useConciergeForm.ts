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

  // The submit callbacks are BUILT inside the event handlers (not during
  // render) so the react-hooks compiler analysis doesn't flag the ref reads.
  const advance = () =>
    stepOneForm.handleSubmit(async (values) => {
      setStep("contact");
      // Best-effort capture (FR-4.2): never blocks the user; a failure just
      // means the completion won't reference a partial row.
      partialId.current ??= newSubmissionId();
      const result = await submitPartialLead(values, partialId.current);
      if (result.ok) savedPartialId.current = result.data.id;
    })();

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
