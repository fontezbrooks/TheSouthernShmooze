// Edge Function: notify-lead
//
// Emails a Concierge lead to the team when a row is inserted into `leads`. Fired by
// an AFTER INSERT trigger (migration 0015) via pg_net, which POSTs `{ record }` with
// the shared `X-Sync-Secret` header. The insert is already committed before this runs,
// so a slow or failed email NEVER blocks or rolls back the user's submission.
//
// Mirrors the Squarespace form-submission email; reply-to = the lead's email. When the
// lead uploaded a file, includes a time-limited signed "Download file" link.
//
// Auth: `X-Sync-Secret` must equal `SYNC_TRIGGER_SECRET` (verify_jwt = false). Reuses
// the existing shared trigger secret so no new secret is required for auth.
//
// Secrets: RESEND_API_KEY, LEAD_NOTIFY_TO (comma-separated), LEAD_NOTIFY_FROM (must
// be on a Resend-verified domain) — all required. Optional: LEAD_NOTIFY_BCC
// (comma-separated).
// Auto-provided by the runtime: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import {
	buildLeadEmailHtml,
	buildSubject,
	type LeadRecord,
} from "../_shared/lead-email.ts";
import {
	type NotifyRecipients,
	RESEND_ENDPOINT,
	resolveNotifyRecipients,
} from "../_shared/notify-config.ts";

const BUCKET = "lead-uploads";
const SIGNED_URL_TTL_SECONDS = 60 * 60 * 24 * 7; // 7 days

function json(status: number, body: unknown): Response {
	return new Response(JSON.stringify(body), {
		headers: { "Content-Type": "application/json" },
		status,
	});
}

/** Sign the uploaded file for download; returns null on missing path or any error. */
async function signFileUrl(filePath: string | null): Promise<string | null> {
	if (!filePath) {
		return null;
	}
	const url = Deno.env.get("SUPABASE_URL");
	const key = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
	if (!(url && key)) {
		return null;
	}
	const supabase = createClient(url, key, {
		auth: { autoRefreshToken: false, persistSession: false },
	});
	const { data, error } = await supabase.storage
		.from(BUCKET)
		.createSignedUrl(filePath, SIGNED_URL_TTL_SECONDS);
	if (error || !data) {
		console.error("createSignedUrl failed:", error?.message);
		return null;
	}
	return data.signedUrl;
}

Deno.serve(async (req: Request) => {
	// 1) Auth — shared trigger secret (same one pg_cron uses for the sync functions).
	const expected = Deno.env.get("SYNC_TRIGGER_SECRET");
	if (!expected || req.headers.get("X-Sync-Secret") !== expected) {
		return json(401, { status: "unauthorized" });
	}

	const resendKey = Deno.env.get("RESEND_API_KEY");
	if (!resendKey) {
		console.error("RESEND_API_KEY is not set");
		return json(500, { reason: "email not configured", status: "error" });
	}
	let recipients: NotifyRecipients;
	try {
		recipients = resolveNotifyRecipients((name) => Deno.env.get(name));
	} catch (e) {
		console.error(e instanceof Error ? e.message : e);
		return json(500, { reason: "email not configured", status: "error" });
	}

	// 2) Parse the trigger payload.
	let payload: { record?: LeadRecord };
	try {
		payload = await req.json();
	} catch {
		return json(400, { reason: "invalid json", status: "error" });
	}
	const lead = payload.record;
	if (!(lead?.id && lead.email)) {
		return json(400, { reason: "missing lead record", status: "error" });
	}

	// 3) Sign the uploaded file (if any), then build + send the email.
	const fileUrl = await signFileUrl(lead.file_path);
	const res = await fetch(RESEND_ENDPOINT, {
		body: JSON.stringify({
			from: recipients.from,
			html: buildLeadEmailHtml(lead, fileUrl),
			reply_to: lead.email,
			subject: buildSubject(lead),
			to: recipients.to,
			...(recipients.bcc ? { bcc: recipients.bcc } : {}),
		}),
		headers: {
			Authorization: `Bearer ${resendKey}`,
			"Content-Type": "application/json",
			// One email per lead even if the trigger fires twice.
			"Idempotency-Key": `lead-${lead.id}`,
		},
		method: "POST",
	});

	if (!res.ok) {
		const reason = await res.text().catch(() => res.statusText);
		console.error("Resend send failed:", res.status, reason);
		return json(502, { reason, status: "error" });
	}

	const sent = await res.json().catch(() => ({}));
	return json(200, { id: sent.id ?? null, status: "sent" });
});
