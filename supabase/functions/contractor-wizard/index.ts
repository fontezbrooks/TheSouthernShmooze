// Edge Function: contractor-wizard
//
// Thin proxy between the app's Check My Fit wizard and the site's Cloudflare
// Worker (design.md §E5, Q3/Q7 decisions): the app never talks to the
// temporary *.workers.dev origin directly — when the worker URL moves, only
// the WORKER_API_BASE secret changes, no app release needed.
//
// Actions (POST JSON `{ action, ... }`):
//   suggest — { input, session }            → GET  /api/places/suggest
//   verify  — { payload }                   → POST /api/places/verify
//   submit  — { application }               → POST /api/submit-application
//
// Auth: standard anon-key JWT (supabase.functions.invoke default). No
// secrets flow through; the worker endpoints are public CORS * anyway —
// this proxy exists for URL indirection, not privilege.
//
// Secrets (optional): CONTRACTOR_NOTIFY=1 enables a Resend copy of each submitted
// application to LEAD_NOTIFY_TO/BCC from LEAD_NOTIFY_FROM (see notify-config.ts).
// Off by default because the site's worker may already email the owner.

import {
	applicantEmail,
	buildContractorHtml,
	buildContractorSubject,
	type ContractorApplication,
} from "../_shared/contractor-email.ts";
import { resolveNotifyRecipients } from "../_shared/notify-config.ts";
import { sendResendEmail } from "../_shared/resend.ts";

const DEFAULT_WORKER_BASE = "https://shmooze-worker.jonah-eda.workers.dev";
const NOTIFY_TIMEOUT_MS = 5000;
const UPSTREAM_TIMEOUT_MS = 10_000;
const TRAILING_SLASH = /\/$/;

// Browser targets (Expo web) preflight functions.invoke — without these
// headers every response is blocked client-side (review: PR #34).
const CORS_HEADERS = {
	"Access-Control-Allow-Headers":
		"authorization, x-client-info, apikey, content-type",
	"Access-Control-Allow-Methods": "POST, OPTIONS",
	"Access-Control-Allow-Origin": "*",
};

function json(status: number, body: unknown): Response {
	return new Response(JSON.stringify(body), {
		headers: { "Content-Type": "application/json", ...CORS_HEADERS },
		status,
	});
}

function workerBase(): string {
	return (Deno.env.get("WORKER_API_BASE") ?? DEFAULT_WORKER_BASE).replace(
		TRAILING_SLASH,
		""
	);
}

async function proxyFetch(url: string, init?: RequestInit): Promise<Response> {
	const ctrl = new AbortController();
	const timer = setTimeout(() => ctrl.abort(), UPSTREAM_TIMEOUT_MS);
	try {
		const res = await fetch(url, { ...init, signal: ctrl.signal });
		const body = await res.text();
		return new Response(body, {
			headers: { "Content-Type": "application/json", ...CORS_HEADERS },
			status: res.status,
		});
	} finally {
		clearTimeout(timer);
	}
}

async function notifyContractor(
	application: ContractorApplication
): Promise<void> {
	const resendKey = Deno.env.get("RESEND_API_KEY");
	if (!resendKey) {
		throw new Error("RESEND_API_KEY is not set");
	}
	const recipients = resolveNotifyRecipients((name) => Deno.env.get(name));
	const replyTo = applicantEmail(application);
	const result = await sendResendEmail(
		resendKey,
		{
			from: recipients.from,
			to: recipients.to,
			...(recipients.bcc ? { bcc: recipients.bcc } : {}),
			...(replyTo ? { reply_to: replyTo } : {}),
			html: buildContractorHtml(application),
			subject: buildContractorSubject(application),
		},
		{ signal: AbortSignal.timeout(NOTIFY_TIMEOUT_MS) }
	);
	if (!result.ok) {
		throw new Error(`Resend send failed: ${result.status} ${result.reason}`);
	}
}

async function submitApplication(
	base: string,
	application: ContractorApplication
): Promise<Response> {
	const upstream = await proxyFetch(`${base}/api/submit-application`, {
		body: JSON.stringify({ application }),
		headers: { "Content-Type": "application/json" },
		method: "POST",
	});
	if (upstream.ok && Deno.env.get("CONTRACTOR_NOTIFY") === "1") {
		try {
			await notifyContractor(application);
		} catch (e) {
			console.error(
				"contractor notify failed:",
				e instanceof Error ? e.message : e
			);
		}
	}
	return upstream;
}

Deno.serve(async (req) => {
	if (req.method === "OPTIONS") {
		return new Response("ok", { headers: CORS_HEADERS });
	}
	if (req.method !== "POST") {
		return json(405, { error: "POST only" });
	}

	let body: Record<string, unknown>;
	try {
		body = await req.json();
	} catch {
		return json(400, { error: "Invalid JSON body" });
	}

	const base = workerBase();
	try {
		switch (body.action) {
			case "suggest": {
				const input = typeof body.input === "string" ? body.input : "";
				const session = typeof body.session === "string" ? body.session : "";
				if (!input) {
					return json(400, { error: "input required" });
				}
				const qs = new URLSearchParams({ input, session });
				return await proxyFetch(`${base}/api/places/suggest?${qs}`);
			}
			case "verify": {
				if (typeof body.payload !== "object" || body.payload === null) {
					return json(400, { error: "payload required" });
				}
				return await proxyFetch(`${base}/api/places/verify`, {
					body: JSON.stringify(body.payload),
					headers: { "Content-Type": "application/json" },
					method: "POST",
				});
			}
			case "submit": {
				if (typeof body.application !== "object" || body.application === null) {
					return json(400, { error: "application required" });
				}
				return await submitApplication(
					base,
					body.application as ContractorApplication
				);
			}
			default:
				return json(400, { error: "Unknown action" });
		}
	} catch (e) {
		// Timeout / network failure upstream. 502 lets the app apply its
		// client-side fallback verdict ("failure is always a pass").
		console.error("contractor-wizard upstream failure:", e);
		return json(502, { error: "Upstream unavailable" });
	}
});
