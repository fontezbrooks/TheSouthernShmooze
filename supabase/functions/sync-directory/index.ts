// Edge Function: sync-directory
//
// Fetches the complete MembershipWorks directory feed (the same feed the Squarespace
// site renders), transforms it with the shared canonical transform, and hands the whole
// change set to the atomic `directory_sync_apply` RPC. Triggered every ~10 min by pg_cron
// (see migration 0008). Thin orchestrator: all destructive logic + safety guard live in
// the database so they are atomic and cannot be bypassed.
//
// Auth: caller must present `X-Sync-Secret: <SYNC_TRIGGER_SECRET>` (verify_jwt = false).
// On ANY fetch/parse failure it logs a run and returns 200 WITHOUT touching the directory.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import {
	type DirectoryRecord,
	prepareRecords,
} from "../_shared/directory-transform.ts";
import { captureServerEvent } from "../_shared/posthog-capture.ts";

const DEFAULT_MW_URL =
	"https://api.membershipworks.com/v2/directory?_rf=Members&_st=";
const DEFAULT_ORG = "33993";
const DEFAULT_TIMEOUT_MS = 15_000;

function json(status: number, body: unknown): Response {
	return new Response(JSON.stringify(body), {
		headers: { "Content-Type": "application/json" },
		status,
	});
}

interface FetchResult {
	fetchedCount: number;
	records: { business: unknown; phones: unknown }[];
	skipped: number;
}

/** GET the MW feed with a timeout; validate the envelope; transform. Throws on any problem. */
async function fetchDirectory(
	url: string,
	org: string,
	timeoutMs: number
): Promise<FetchResult> {
	const controller = new AbortController();
	const timer = setTimeout(() => controller.abort(), timeoutMs);
	let res: Response;
	try {
		res = await fetch(url, {
			headers: {
				accept: "application/json",
				origin: "https://www.shmoozeatl.com",
				referer: "https://www.shmoozeatl.com/",
				"x-org": org,
			},
			method: "GET",
			signal: controller.signal,
		});
	} finally {
		clearTimeout(timer);
	}

	if (!res.ok) {
		throw new Error(`MW responded ${res.status}`);
	}

	const body = await res.json().catch(() => {
		throw new Error("MW response was not valid JSON");
	});

	if (!(body && Array.isArray(body.usr))) {
		throw new Error("MW response missing `usr` array");
	}

	const { prepared, skipped } = prepareRecords(body.usr as DirectoryRecord[]);
	return { fetchedCount: body.usr.length, records: prepared, skipped };
}

Deno.serve(async (req: Request) => {
	const startedAt = Date.now();

	// Server-side analytics (P4): registry_sync_completed on every run exit.
	// Never throws; unconfigured env = silent no-op. Awaited (2s cap) because
	// the runtime may cancel pending work once the response is returned.
	const captureSync = (syncStatus: string, recordsIngested: number) =>
		captureServerEvent(
			{
				apiKey: Deno.env.get("POSTHOG_PROJECT_KEY"),
				host: Deno.env.get("POSTHOG_HOST"),
			},
			{
				event: "registry_sync_completed",
				properties: {
					duration_ms: Date.now() - startedAt,
					records_ingested: recordsIngested,
					sync_source: "sync-directory",
					sync_status: syncStatus,
				},
			}
		);

	// 1) Auth.
	const expected = Deno.env.get("SYNC_TRIGGER_SECRET");
	if (!expected || req.headers.get("X-Sync-Secret") !== expected) {
		return json(401, { status: "unauthorized" });
	}

	const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
	const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
	const supabase = createClient(supabaseUrl, serviceKey, {
		auth: { autoRefreshToken: false, persistSession: false },
	});

	const mwUrl = Deno.env.get("MW_DIRECTORY_URL") ?? DEFAULT_MW_URL;
	const org = Deno.env.get("MW_ORG") ?? DEFAULT_ORG;
	const timeoutMs = Number(
		Deno.env.get("FETCH_TIMEOUT_MS") ?? DEFAULT_TIMEOUT_MS
	);

	// 2) Fetch + transform. Any failure => log + return 200, NO directory writes.
	let fetched: FetchResult;
	try {
		fetched = await fetchDirectory(mwUrl, org, timeoutMs);
	} catch (err) {
		const reason = err instanceof Error ? err.message : String(err);
		await supabase.rpc("directory_log_run", {
			p_duration_ms: Date.now() - startedAt,
			p_reason: reason,
			p_status: "failed",
		});
		await captureSync("failed", 0);
		return json(200, { reason, status: "failed" });
	}

	// 3) Apply the change set atomically (guard + upsert + mirror-delete + phones live in the RPC).
	const { data, error } = await supabase.rpc("directory_sync_apply", {
		p_duration_ms: Date.now() - startedAt,
		p_fetched_count: fetched.fetchedCount,
		p_records: fetched.records,
	});

	if (error) {
		await captureSync("failed", 0);
		return json(200, { reason: error.message, status: "failed" });
	}

	await captureSync("ok", fetched.records.length);
	return json(200, {
		...data,
		duration_ms: Date.now() - startedAt,
		skipped: fetched.skipped,
	});
});
