import { randomUUID } from "expo-crypto";
import type { LeadInsert } from "@/lib/database";
import { err, ok, type Result } from "@/lib/result";
import { getSupabase } from "@/lib/supabase";
import type {
	ConciergeStepOneValues,
	ConciergeStepTwoValues,
} from "./conciergeSchema";

/** Postgres unique-violation (duplicate primary key). */
const PG_UNIQUE_VIOLATION = "23505";

/**
 * Generate a stable row id. Each insert target gets its OWN id: one for the
 * partial row (created when step 1 first advances) and a DIFFERENT one for
 * the completion row (created when the user first submits step 2). Reuse the
 * same id only when retrying that same insert — never share one id across
 * both rows, or the completion insert would collide with the partial's
 * primary key and be misread as an already-committed completion.
 */
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
	id: string
): Promise<Result<{ id: string }>> {
	try {
		const supabase = getSupabase();
		const row: LeadInsert = {
			id,
			project_details: values.notes?.length ? values.notes : null,
			stage: "partial",
			trade: values.trade,
			zip: values.zip,
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
	id: string
): Promise<Result<{ id: string }>> {
	// Guard the id contract: reusing the partial row's id here would collide
	// with its primary key and misread the 23505 as a committed completion
	// (no complete row, no owner email, false success). Fail fast instead.
	if (partialId !== null && id === partialId) {
		return err(
			"Something went wrong submitting your request. Please try again."
		);
	}
	try {
		const supabase = getSupabase();
		const row: LeadInsert = {
			email: stepTwo.email,
			first_name: stepTwo.firstName,
			id,
			last_name: stepTwo.lastName,
			newsletter_opt_in: stepTwo.newsletterOptIn,
			partial_id: partialId,
			phone: stepTwo.phone,
			project_details: stepOne.notes?.length ? stepOne.notes : null,
			stage: "complete",
			trade: stepOne.trade,
			zip: stepOne.zip,
		};
		const { error } = await supabase.from("leads").insert(row);
		if (error && error.code !== PG_UNIQUE_VIOLATION) {
			return err(
				"Something went wrong submitting your request. Please try again."
			);
		}
		return ok({ id });
	} catch {
		return err("Network error. Please check your connection and try again.");
	}
}
