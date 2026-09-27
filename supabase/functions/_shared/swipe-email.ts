// Pure formatting helpers for "The Shmoozer" swipe-lead email. No Deno / network / Supabase
// imports so this module is unit-testable under jest while the `notify-swipe-lead` Edge
// Function imports it at runtime. Reuses the escape/budget helpers from the Concierge email.

import {
	budgetLabel,
	EMAIL_WRAPPER_OPEN,
	escapeHtml,
	htmlRow,
} from "./lead-email.ts";

/** The assembled swipe-lead payload delivered by the AFTER INSERT trigger (migrations 0016/0017). */
export interface SwipeLeadRecord {
	budget: string | null;
	business_name: string | null;
	business_uid: string;
	confidence: number | null;
	contact_email: string | null;
	contact_name: string | null;
	contact_phone: string | null;
	created_at: string | null;
	details: string | null;
	keyword: string | null;
	lead_id: string;
	radius_km: number | null;
	timing: string | null;
}

/** Timing enum value → human label. */
const TIMING_LABELS: Record<string, string> = {
	asap: "As soon as possible",
	flexible: "Flexible",
	this_week: "This week",
};

export function timingLabel(timing: string | null | undefined): string {
	if (!timing) {
		return "";
	}
	return TIMING_LABELS[timing] ?? timing;
}

/** Email subject for a swipe lead. */
export function buildSwipeLeadSubject(lead: SwipeLeadRecord): string {
	const biz = (lead.business_name ?? "").trim();
	const kw = (lead.keyword ?? "").trim();
	if (biz && kw) {
		return `New Shmoozer lead — ${biz} (${kw})`;
	}
	if (biz) {
		return `New Shmoozer lead — ${biz}`;
	}
	return "New Shmoozer lead";
}

/**
 * Build the HTML body for an owner-routed swipe lead (R-1: no business emails yet, so the
 * Shmooze team receives and brokers the lead). reply_to is set to the Seeker's email by
 * the Edge Function so a reply reaches them directly.
 */
export function buildSwipeLeadHtml(lead: SwipeLeadRecord): string {
	const confidence =
		typeof lead.confidence === "number"
			? `${Math.round(lead.confidence)}% match`
			: "";

	return [
		EMAIL_WRAPPER_OPEN,
		`<p style="margin:0 0 16px">New lead from The Shmoozer (swipe match)</p>`,
		htmlRow("Provider", escapeHtml(lead.business_name ?? lead.business_uid)),
		htmlRow("Looking for", escapeHtml(lead.keyword ?? "")),
		htmlRow("Match confidence", escapeHtml(confidence)),
		htmlRow(
			"Budget",
			escapeHtml(budgetLabel(lead.budget ? [lead.budget] : null))
		),
		htmlRow("Timing", escapeHtml(timingLabel(lead.timing))),
		htmlRow("Details", escapeHtml(lead.details ?? "").replace(/\n/g, "<br>")),
		htmlRow("Contact", escapeHtml(lead.contact_name ?? "")),
		htmlRow("Email", escapeHtml(lead.contact_email ?? "")),
		htmlRow("Phone", escapeHtml(lead.contact_phone ?? "")),
		"</div>",
	]
		.filter(Boolean)
		.join("");
}
