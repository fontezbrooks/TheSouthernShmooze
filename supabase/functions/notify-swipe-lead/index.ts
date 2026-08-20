// Edge Function: notify-swipe-lead
//
// Emails a "Shmoozer" swipe lead to the owner inbox when a row is inserted into
// `swipe_leads`. Fired by an AFTER INSERT trigger (migration 0016) via pg_net, which
// POSTs `{ record }` (a rich payload joining task + contact + business) with the shared
// `X-Sync-Secret` header. The insert is already committed before this runs, so a slow or
// failed email NEVER blocks the swipe. reply_to = the Seeker's email.
//
// Auth: `X-Sync-Secret` must equal `SYNC_TRIGGER_SECRET` (verify_jwt = false).
// Secrets: RESEND_API_KEY (required). Optional: LEAD_NOTIFY_TO, LEAD_NOTIFY_FROM.

import {
	buildSwipeLeadHtml,
	buildSwipeLeadSubject,
	type SwipeLeadRecord,
} from "../_shared/swipe-email.ts";

const RESEND_ENDPOINT = "https://api.resend.com/emails";
const DEFAULT_TO = "hi@appdaddystudios.com";
const DEFAULT_FROM = "The Southern Shmooze <onboarding@resend.dev>";

function json(status: number, body: unknown): Response {
	return new Response(JSON.stringify(body), {
		headers: { "Content-Type": "application/json" },
		status,
	});
}

Deno.serve(async (req: Request) => {
	const expected = Deno.env.get("SYNC_TRIGGER_SECRET");
	if (!expected || req.headers.get("X-Sync-Secret") !== expected) {
		return json(401, { status: "unauthorized" });
	}

	const resendKey = Deno.env.get("RESEND_API_KEY");
	if (!resendKey) {
		console.error("RESEND_API_KEY is not set");
		return json(500, { reason: "email not configured", status: "error" });
	}

	let payload: { record?: SwipeLeadRecord };
	try {
		payload = await req.json();
	} catch {
		return json(400, { reason: "invalid json", status: "error" });
	}
	const lead = payload.record;
	if (!(lead?.lead_id && lead.business_uid)) {
		return json(400, { reason: "missing lead record", status: "error" });
	}

	const to = Deno.env.get("LEAD_NOTIFY_TO") ?? DEFAULT_TO;
	const from = Deno.env.get("LEAD_NOTIFY_FROM") ?? DEFAULT_FROM;

	const res = await fetch(RESEND_ENDPOINT, {
		body: JSON.stringify({
			from,
			to: [to],
			...(lead.contact_email ? { reply_to: lead.contact_email } : {}),
			html: buildSwipeLeadHtml(lead),
			subject: buildSwipeLeadSubject(lead),
		}),
		headers: {
			Authorization: `Bearer ${resendKey}`,
			"Content-Type": "application/json",
			// One email per lead even if the trigger fires twice.
			"Idempotency-Key": `swipe-lead-${lead.lead_id}`,
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
