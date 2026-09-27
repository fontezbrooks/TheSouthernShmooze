// Edge Function: notify-swipe-lead
//
// Emails a "Shmoozer" swipe lead to the owner inbox when a row is inserted into
// `swipe_leads`. Fired by an AFTER INSERT trigger (migration 0016) via pg_net, which
// POSTs `{ record }` (a rich payload joining task + contact + business) with the shared
// `X-Sync-Secret` header. The insert is already committed before this runs, so a slow or
// failed email NEVER blocks the swipe. reply_to = the Seeker's email.
//
// Auth: `X-Sync-Secret` must equal `SYNC_TRIGGER_SECRET` (verify_jwt = false).
// Secrets: RESEND_API_KEY, LEAD_NOTIFY_TO (comma-separated), LEAD_NOTIFY_FROM (must
// be on a Resend-verified domain) — all required. Optional: LEAD_NOTIFY_BCC
// (comma-separated).

import {
	type NotifyRecipients,
	RESEND_ENDPOINT,
	resolveNotifyRecipients,
} from "../_shared/notify-config.ts";
import {
	buildSwipeLeadHtml,
	buildSwipeLeadSubject,
	type SwipeLeadRecord,
} from "../_shared/swipe-email.ts";

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
	let recipients: NotifyRecipients;
	try {
		recipients = resolveNotifyRecipients((name) => Deno.env.get(name));
	} catch (e) {
		console.error(e instanceof Error ? e.message : e);
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

	const res = await fetch(RESEND_ENDPOINT, {
		body: JSON.stringify({
			from: recipients.from,
			to: recipients.to,
			...(recipients.bcc ? { bcc: recipients.bcc } : {}),
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
