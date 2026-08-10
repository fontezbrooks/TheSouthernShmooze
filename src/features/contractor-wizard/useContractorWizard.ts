import { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { randomUUID } from "expo-crypto";
import {
  wizardSchema,
  emptyWizard,
  webLinkMissing,
  STEP_FIELDS,
  STEP_COUNT,
  type WizardValues,
} from "./wizardSchema";
import {
  verifyFit,
  submitApplication,
  type FitVerdict,
  type PlacePrediction,
} from "./wizardApi";

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
export function useContractorWizard() {
  const form = useForm<WizardValues>({
    resolver: zodResolver(wizardSchema),
    defaultValues: emptyWizard,
    mode: "onTouched",
  });

  const [step, setStep] = useState(1);
  const [phase, setPhase] = useState<WizardPhase>("form");
  const [verdict, setVerdict] = useState<FitVerdict | null>(null);
  // Google Places billing session: one token folds the autocomplete
  // keystrokes into the Details call. Minted lazily, cleared on reset.
  const placeSession = useRef<string | null>(null);

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
      // Fire-and-forget, site parity — the decision is already made.
      void submitApplication(values, res);
      setVerdict(res);
      setPhase("result");
    })();

  const advance = async () => {
    const fields = [...STEP_FIELDS[step - 1]];
    const valid = await form.trigger(fields, { shouldFocus: true });
    if (!valid) return;
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
    if (phase !== "form") return;
    setStep((s) => Math.max(1, s - 1));
  };

  /** Fresh application (post-result re-entry). */
  const reset = () => {
    form.reset(emptyWizard);
    placeSession.current = null;
    setVerdict(null);
    setPhase("form");
    setStep(1);
  };

  return {
    form,
    step,
    stepCount: STEP_COUNT,
    phase,
    verdict,
    advance,
    back,
    reset,
    pickPlace,
    clearPlace,
    getPlaceSession,
  };
}
