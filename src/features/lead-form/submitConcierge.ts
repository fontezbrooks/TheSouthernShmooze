import { randomUUID } from "expo-crypto";
import { getSupabase } from "@/lib/supabase";
import { ok, err, type Result } from "@/lib/result";
import type { LeadInsert } from "@/lib/database";
import type {
  ConciergeStepOneValues,
  ConciergeStepTwoValues,
} from "./conciergeSchema";

/** Postgres unique-violation (duplicate primary key). */
const PG_UNIQUE_VIOLATION = "23505";

/** Generate a stable submission id — create ONCE per logical submission and
 * reuse across retries so a committed-but-lost insert is not duplicated. */
export const newSubmissionId = (): string => randomUUID();

/**
 * Persist step 1 as a PARTIAL lead (FR-4.2). Fire-and-record: the id comes
 * back so the completing submit can reference it. Partial rows never trigger
 * the owner notification email (0019 gates the trigger to stage='complete').
 * Pass the same `id` on retries — a duplicate-key response means an earlier
 * attempt already committed and is treated as success.
 */
export async function submitPartialLead(
  values: ConciergeStepOneValues,
  id: string,
): Promise<Result<{ id: string }>> {
  try {
    const supabase = getSupabase();
    const row: LeadInsert = {
      id,
      stage: "partial",
      trade: values.trade,
      zip: values.zip,
      project_details: values.notes?.length ? values.notes : null,
    };
    const { error } = await supabase.from("leads").insert(row);
    if (error && error.code !== PG_UNIQUE_VIOLATION) {
      return err("Could not save your request. Please try again.");
    }
    return ok({ id });
  } catch {
    return err("Network error. Please check your connection and try again.");
  }
}

/**
 * Complete the concierge request: a NEW complete row (contact + job data)
 * referencing the step-1 partial via `partial_id`. A fresh insert — not an
 * update — keeps the leads table INSERT-only under RLS.
 * `id` must be generated once per logical submission (newSubmissionId) and
 * reused across retries: if an insert committed but the response was lost,
 * the retry hits a duplicate key and is treated as success — no second lead
 * row, no second owner email.
 */
export async function submitConciergeLead(
  stepOne: ConciergeStepOneValues,
  stepTwo: ConciergeStepTwoValues,
  partialId: string | null,
  id: string,
): Promise<Result<{ id: string }>> {
  try {
    const supabase = getSupabase();
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
    if (error && error.code !== PG_UNIQUE_VIOLATION) {
      return err(
        "Something went wrong submitting your request. Please try again.",
      );
    }
    return ok({ id });
  } catch {
    return err("Network error. Please check your connection and try again.");
  }
}
