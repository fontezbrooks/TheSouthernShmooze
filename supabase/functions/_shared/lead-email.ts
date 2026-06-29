// Pure formatting helpers for the Concierge lead notification email. No Deno /
// network / Supabase imports so this module is unit-testable under jest while the
// `notify-lead` Edge Function imports it at runtime. Mirrors the layout of the
// Squarespace form-submission email the team is used to.

/** The shape of a `leads` row as delivered by the AFTER INSERT trigger payload. */
export interface LeadRecord {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  address: string;
  /** DB array column; single-select form stores one value (or empty). */
  budget: string[] | null;
  /** `YYYY-MM-DD` or null. */
  project_start_date: string | null;
  project_details: string;
  file_path: string | null;
}

/** Budget enum value → human label (mirrors the app's BUDGET_OPTIONS / Figma). */
const BUDGET_LABELS: Record<string, string> = {
  lt_1000: "< $1,000",
  "1000_5000": "$1,000 – $5,000",
  gt_5000: "> $5,000",
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

/** First budget value → label (empty string when unset). */
export function budgetLabel(budget: string[] | null | undefined): string {
  const value = budget?.[0];
  if (!value) return "";
  return BUDGET_LABELS[value] ?? value;
}

/** `2026-07-01` → `July 01, 2026`; empty/invalid → "". Avoids locale/timezone drift. */
export function formatStartDate(iso: string | null | undefined): string {
  if (!iso) return "";
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso);
  if (!match) return iso;
  const [, year, month, day] = match;
  const name = MONTHS[Number(month) - 1];
  if (!name) return iso;
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
  const name = `${lead.first_name} ${lead.last_name}`.trim();
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
  fileUrl: string | null,
): string {
  const row = (label: string, value: string) =>
    `<p style="margin:0 0 12px"><strong>${label}:</strong> ${value}</p>`;

  const name = escapeHtml(`${lead.first_name} ${lead.last_name}`.trim());
  const details = escapeHtml(lead.project_details ?? "").replace(/\n/g, "<br>");
  const file = fileUrl
    ? `<a href="${fileUrl}">Download file</a>`
    : "";

  return [
    `<div style="font-family:Arial,Helvetica,sans-serif;font-size:15px;color:#1b1b1c;line-height:1.5">`,
    `<p style="margin:0 0 16px">Sent via form submission from The Southern Shmooze</p>`,
    row("Name", name),
    row("Email", escapeHtml(lead.email ?? "")),
    row("Phone", escapeHtml(lead.phone ?? "")),
    row("Address", escapeHtml(lead.address ?? "")),
    row("Budget", escapeHtml(budgetLabel(lead.budget))),
    row("Project start date", escapeHtml(formatStartDate(lead.project_start_date))),
    row("Project Details", details),
    row("File Upload", file),
    `</div>`,
  ].join("");
}
