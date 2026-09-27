// Pure formatting helpers for the Concierge lead notification email. No Deno /
// network / Supabase imports so this module is unit-testable under jest while the
// `notify-lead` Edge Function imports it at runtime. Mirrors the layout of the
// Squarespace form-submission email the team is used to.

/**
 * The shape of a `leads` row as delivered by the AFTER INSERT trigger payload.
 * Since 0019 (two-step concierge) contact/detail columns are nullable and the
 * row may carry trade/zip/newsletter_opt_in; the trigger only fires for
 * stage='complete' rows, so contact fields are present in practice.
 */
export interface LeadRecord {
	address: string | null;
	/** DB array column; single-select form stores one value (or empty). */
	budget: string[] | null;
	email: string | null;
	file_path: string | null;
	first_name: string | null;
	id: string;
	last_name: string | null;
	newsletter_opt_in?: boolean;
	phone: string | null;
	project_details: string | null;
	/** `YYYY-MM-DD` or null. */
	project_start_date: string | null;
	/** Concierge two-step fields (0019); absent on legacy payloads. */
	trade?: string | null;
	zip?: string | null;
}

export const EMAIL_WRAPPER_OPEN = `<div style="font-family:Arial,Helvetica,sans-serif;font-size:15px;color:#1b1b1c;line-height:1.5">`;

/** One labelled paragraph; empty value → "" so the row disappears. */
export function htmlRow(label: string, value: string): string {
	return value
		? `<p style="margin:0 0 12px"><strong>${label}:</strong> ${value}</p>`
		: "";
}

/** Budget enum value → human label (mirrors the app's BUDGET_OPTIONS / Figma). */
const BUDGET_LABELS: Record<string, string> = {
	"1000_5000": "$1,000 – $5,000",
	gt_5000: "> $5,000",
	lt_1000: "< $1,000",
};

const MONTHS = [
	"January",
	"February",
	"March",
	"April",
	"May",
	"June",
	"July",
	"August",
	"September",
	"October",
	"November",
	"December",
];
const ISO_DATE = /^(\d{4})-(\d{2})-(\d{2})/;

function newsletterLabel(optedIn: boolean | undefined): string {
	if (optedIn === undefined) {
		return "";
	}
	return optedIn ? "Yes" : "No";
}

/** First budget value → label (empty string when unset). */
export function budgetLabel(budget: string[] | null | undefined): string {
	const value = budget?.[0];
	if (!value) {
		return "";
	}
	return BUDGET_LABELS[value] ?? value;
}

/** `2026-07-01` → `July 01, 2026`; empty/invalid → "". Avoids locale/timezone drift. */
export function formatStartDate(iso: string | null | undefined): string {
	if (!iso) {
		return "";
	}
	const match = ISO_DATE.exec(iso);
	if (!match) {
		return iso;
	}
	const [, year, month, day] = match;
	const name = MONTHS[Number(month) - 1];
	if (!name) {
		return iso;
	}
	return `${name} ${day}, ${year}`;
}

/** Escape the five HTML-significant characters so user input can't break the email markup. */
export function escapeHtml(value: string): string {
	return value
		.replace(/&/g, "&amp;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;")
		.replace(/"/g, "&quot;")
		.replace(/'/g, "&#39;");
}

/** Email subject line. */
export function buildSubject(lead: LeadRecord): string {
	const name = `${lead.first_name ?? ""} ${lead.last_name ?? ""}`.trim();
	return name
		? `New Concierge submission — ${name}`
		: "New Concierge submission";
}

/**
 * Build the HTML body. `fileUrl` is a signed download link (or null); when present
 * the "File Upload" row links to it ("Download file"), replacing the Squarespace
 * "Manage Submissions" button which has no equivalent for our Supabase data.
 */
export function buildLeadEmailHtml(
	lead: LeadRecord,
	fileUrl: string | null
): string {
	const alwaysRenderRow = (label: string, value: string) =>
		`<p style="margin:0 0 12px"><strong>${label}:</strong> ${value}</p>`;

	const name = escapeHtml(
		`${lead.first_name ?? ""} ${lead.last_name ?? ""}`.trim()
	);
	const details = escapeHtml(lead.project_details ?? "").replace(/\n/g, "<br>");
	const file = fileUrl ? `<a href="${fileUrl}">Download file</a>` : "";

	return [
		EMAIL_WRAPPER_OPEN,
		`<p style="margin:0 0 16px">Sent via form submission from The Southern Shmooze</p>`,
		alwaysRenderRow("Name", name),
		alwaysRenderRow("Email", escapeHtml(lead.email ?? "")),
		alwaysRenderRow("Phone", escapeHtml(lead.phone ?? "")),
		alwaysRenderRow("Trade", escapeHtml(lead.trade ?? "")),
		alwaysRenderRow("Zip", escapeHtml(lead.zip ?? "")),
		alwaysRenderRow("Address", escapeHtml(lead.address ?? "")),
		alwaysRenderRow("Newsletter", newsletterLabel(lead.newsletter_opt_in)),
		alwaysRenderRow("Budget", escapeHtml(budgetLabel(lead.budget))),
		alwaysRenderRow(
			"Project start date",
			escapeHtml(formatStartDate(lead.project_start_date))
		),
		alwaysRenderRow("Project Details", details),
		alwaysRenderRow("File Upload", file),
		"</div>",
	].join("");
}
