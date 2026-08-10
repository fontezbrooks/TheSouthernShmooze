import { randomUUID } from "expo-crypto";
import { getSupabase } from "@/lib/supabase";
import { ok, err, type Result } from "@/lib/result";
import type { LeadInsert } from "@/lib/database";
import type {
  ConciergeStepOneValues,
  ConciergeStepTwoValues,
} from "./conciergeSchema";

/**
 * Persist step 1 as a PARTIAL lead (FR-4.2). Fire-and-record: the id comes
 * back so the completing submit can reference it. Partial rows never trigger
 * the owner notification email (0019 gates the trigger to stage='complete').
 */
export async function submitPartialLead(
  values: ConciergeStepOneValues,
): Promise<Result<{ id: string }>> {
  try {
    const supabase = getSupabase();
    const id = randomUUID();
    const row: LeadInsert = {
      id,
      stage: "partial",
      trade: values.trade,
      zip: values.zip,
      project_details: values.notes?.length ? values.notes : null,
    };
    const { error } = await supabase.from("leads").insert(row);
    if (error) return err("Could not save your request. Please try again.");
    return ok({ id });
  } catch {
    return err("Network error. Please check your connection and try again.");
  }
}

/**
 * Complete the concierge request: a NEW complete row (contact + job data)
 * referencing the step-1 partial via `partial_id`. A fresh insert — not an
 * update — keeps the leads table INSERT-only under RLS.
 */
export async function submitConciergeLead(
  stepOne: ConciergeStepOneValues,
  stepTwo: ConciergeStepTwoValues,
  partialId: string | null,
): Promise<Result<{ id: string }>> {
  try {
    const supabase = getSupabase();
    const id = randomUUID();
    const row: LeadInsert = {
      id,
      stage: "complete",
      trade: stepOne.trade,
      zip: stepOne.zip,
      project_details: stepOne.notes?.length ? stepOne.notes : null,
      first_name: stepTwo.firstName,
      last_name: stepTwo.lastName,
      email: stepTwo.email,
      phone: stepTwo.phone,
      newsletter_opt_in: stepTwo.newsletterOptIn,
      partial_id: partialId,
    };
    const { error } = await supabase.from("leads").insert(row);
    if (error) {
      return err(
        "Something went wrong submitting your request. Please try again.",
      );
    }
    return ok({ id });
  } catch {
    return err("Network error. Please check your connection and try again.");
  }
}
