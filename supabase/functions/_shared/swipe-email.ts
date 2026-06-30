// Pure formatting helpers for "The Shmoozer" swipe-lead + verification emails. No Deno /
// network / Supabase imports so this module is unit-testable under jest while the
// `notify-swipe-lead` / `notify-swipe-verify` Edge Functions import it at runtime.
// Reuses the escape/budget helpers from the Concierge lead email module.

import { budgetLabel, escapeHtml } from "./lead-email.ts";

/** The assembled swipe-lead payload delivered by the AFTER INSERT trigger (migration 0016). */
export interface SwipeLeadRecord {
  lead_id: string;
  created_at: string | null;
  confidence: number | null;
  business_uid: string;
  business_name: string | null;
  keyword: string | null;
  budget: string | null;
  timing: string | null;
  radius_km: number | null;
  contact_name: string | null;
  contact_email: string | null;
  contact_phone: string | null;
}

/** Timing enum value → human label. */
const TIMING_LABELS: Record<string, string> = {
  asap: "As soon as possible",
  this_week: "This week",
  flexible: "Flexible",
};

export function timingLabel(timing: string | null | undefined): string {
  if (!timing) return "";
  return TIMING_LABELS[timing] ?? timing;
}

/** Email subject for a swipe lead. */
export function buildSwipeLeadSubject(lead: SwipeLeadRecord): string {
  const biz = (lead.business_name ?? "").trim();
  const kw = (lead.keyword ?? "").trim();
  if (biz && kw) return `New Shmoozer lead — ${biz} (${kw})`;
  if (biz) return `New Shmoozer lead — ${biz}`;
  return "New Shmoozer lead";
}

/**
 * Build the HTML body for an owner-routed swipe lead (R-1: no business emails yet, so the
 * Shmooze team receives and brokers the lead). reply_to is set to the Seeker's email by
 * the Edge Function so a reply reaches them directly.
 */
export function buildSwipeLeadHtml(lead: SwipeLeadRecord): string {
  const row = (label: string, value: string) =>
    value
      ? `<p style="margin:0 0 12px"><strong>${label}:</strong> ${value}</p>`
      : "";

  const confidence =
    lead.confidence == null ? "" : `${Math.round(lead.confidence)}% match`;

  return [
    `<div style="font-family:Arial,Helvetica,sans-serif;font-size:15px;color:#1b1b1c;line-height:1.5">`,
    `<p style="margin:0 0 16px">New lead from The Shmoozer (swipe match)</p>`,
    row("Provider", escapeHtml(lead.business_name ?? lead.business_uid)),
    row("Looking for", escapeHtml(lead.keyword ?? "")),
    row("Match confidence", escapeHtml(confidence)),
    row("Budget", escapeHtml(budgetLabel(lead.budget ? [lead.budget] : null))),
    row("Timing", escapeHtml(timingLabel(lead.timing))),
    row("Contact", escapeHtml(lead.contact_name ?? "")),
    row("Email", escapeHtml(lead.contact_email ?? "")),
    row("Phone", escapeHtml(lead.contact_phone ?? "")),
    `</div>`,
  ]
    .filter(Boolean)
    .join("");
}

/** Email subject for the verification code. */
export function buildVerifySubject(): string {
  return "Your Shmoozer verification code";
}

/** Build the verification-code email body. */
export function buildVerifyHtml(code: string): string {
  return [
    `<div style="font-family:Arial,Helvetica,sans-serif;font-size:15px;color:#1b1b1c;line-height:1.5">`,
    `<p style="margin:0 0 16px">Enter this code in The Shmoozer to confirm your contact info:</p>`,
    `<p style="margin:0 0 16px;font-size:28px;font-weight:bold;letter-spacing:4px">${escapeHtml(code)}</p>`,
    `<p style="margin:0;color:#6b6b6b">This code expires in 15 minutes.</p>`,
    `</div>`,
  ].join("");
}
