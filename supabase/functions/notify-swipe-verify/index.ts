// Edge Function: notify-swipe-verify
//
// Emails a 6-digit verification code to a Seeker so they can confirm their contact info
// before the first swipe lead is sent. Fired by `request_contact_verification` (migration
// 0016) via pg_net with `{ email, code }` and the shared `X-Sync-Secret` header.
//
// Auth: `X-Sync-Secret` must equal `SYNC_TRIGGER_SECRET` (verify_jwt = false).
// Secrets: RESEND_API_KEY (required). Optional: LEAD_NOTIFY_FROM.

import {
  buildVerifyHtml,
  buildVerifySubject,
} from "../_shared/swipe-email.ts";

const RESEND_ENDPOINT = "https://api.resend.com/emails";
const DEFAULT_FROM = "The Southern Shmooze <onboarding@resend.dev>";

function json(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
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
    return json(500, { status: "error", reason: "email not configured" });
  }

  let payload: { email?: string; code?: string };
  try {
    payload = await req.json();
  } catch {
    return json(400, { status: "error", reason: "invalid json" });
  }
  if (!payload.email || !payload.code) {
    return json(400, { status: "error", reason: "missing email or code" });
  }

  const from = Deno.env.get("LEAD_NOTIFY_FROM") ?? DEFAULT_FROM;

  const res = await fetch(RESEND_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${resendKey}`,
      "Idempotency-Key": `swipe-verify-${payload.email}-${payload.code}`,
    },
    body: JSON.stringify({
      from,
      to: [payload.email],
      subject: buildVerifySubject(),
      html: buildVerifyHtml(payload.code),
    }),
  });

  if (!res.ok) {
    const reason = await res.text().catch(() => res.statusText);
    console.error("Resend send failed:", res.status, reason);
    return json(502, { status: "error", reason });
  }

  const sent = await res.json().catch(() => ({}));
  return json(200, { status: "sent", id: sent.id ?? null });
});
