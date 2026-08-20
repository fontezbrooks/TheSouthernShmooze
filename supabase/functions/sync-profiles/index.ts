// Edge Function: sync-profiles
//
// Incrementally ingests MembershipWorks business profiles into
// directory_business_profiles (Epic B). Each invocation processes a BOUNDED batch of
// the businesses whose profile is missing or stale (never all 184 at once), fetches each
// `GET /v2/account/{uid}/profile` with small concurrency, transforms (strips _mk, About
// HTML -> text), and upserts by source_uid. Per-item failures are isolated — they're
// counted and skipped, leaving the existing profile intact (no destructive deletes;
// removals cascade via the FK). Triggered every ~5 min by pg_cron (migration 0011).
//
// Auth: caller must present `X-Sync-Secret: <SYNC_TRIGGER_SECRET>` (verify_jwt = false).

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { captureServerEvent } from "../_shared/posthog-capture.ts";
import {
	type RawProfile,
	transformProfile,
} from "../_shared/profile-transform.ts";

const DEFAULT_ORG = "33993";
const DEFAULT_BATCH = 25;
const DEFAULT_STALE_DAYS = 7;
const DEFAULT_CONCURRENCY = 5;
const DEFAULT_TIMEOUT_MS = 10_000;

function json(status: number, body: unknown): Response {
	return new Response(JSON.stringify(body), {
		headers: { "Content-Type": "application/json" },
		status,
	});
}

/** Fetch one business's profile with a timeout. Throws on non-200 / bad JSON. */
async function fetchProfile(
	uid: string,
	org: string,
	timeoutMs: number
): Promise<RawProfile> {
	const controller = new AbortController();
	const timer = setTimeout(() => controller.abort(), timeoutMs);
	try {
		const res = await fetch(
			`https://api.membershipworks.com/v2/account/${uid}/profile`,
			{
				headers: {
					accept: "application/json",
					origin: "https://www.shmoozeatl.com",
					referer: "https://www.shmoozeatl.com/",
					"x-org": org,
				},
				method: "GET",
				signal: controller.signal,
			}
		);
		if (!res.ok) {
			throw new Error(`MW ${res.status}`);
		}
		return (await res.json()) as RawProfile;
	} finally {
		clearTimeout(timer);
	}
}

/** Run `worker` over `items` with at most `size` in flight; never rejects (errors captured). */
async function pool<T>(
	items: T[],
	size: number,
	worker: (item: T) => Promise<void>
): Promise<{ updated: number; failed: number }> {
	let updated = 0;
	let failed = 0;
	let cursor = 0;
	async function run(): Promise<void> {
		while (cursor < items.length) {
			const item = items[cursor++];
			try {
				await worker(item);
				updated++;
			} catch {
				failed++;
			}
		}
	}
	await Promise.all(Array.from({ length: Math.min(size, items.length) }, run));
	return { failed, updated };
}

Deno.serve(async (req: Request) => {
	const startedAt = Date.now();

	// Server-side analytics (P4) — same contract as sync-directory.
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
					sync_source: "sync-profiles",
					sync_status: syncStatus,
				},
			}
		);

	const expected = Deno.env.get("SYNC_TRIGGER_SECRET");
	if (!expected || req.headers.get("X-Sync-Secret") !== expected) {
		return json(401, { status: "unauthorized" });
	}

	const supabase = createClient(
		Deno.env.get("SUPABASE_URL")!,
		Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
		{ auth: { autoRefreshToken: false, persistSession: false } }
	);

	const org = Deno.env.get("MW_ORG") ?? DEFAULT_ORG;
	const batch = Number(Deno.env.get("PROFILE_BATCH") ?? DEFAULT_BATCH);
	const staleDays = Number(
		Deno.env.get("PROFILE_STALE_DAYS") ?? DEFAULT_STALE_DAYS
	);
	const concurrency = Number(
		Deno.env.get("PROFILE_CONCURRENCY") ?? DEFAULT_CONCURRENCY
	);
	const timeoutMs = Number(
		Deno.env.get("FETCH_TIMEOUT_MS") ?? DEFAULT_TIMEOUT_MS
	);

	// 1) Which businesses need a profile fetch (missing first, then stale).
	const { data: due, error: dueErr } = await supabase.rpc(
		"directory_profiles_due",
		{
			p_limit: batch,
			p_stale_days: staleDays,
		}
	);
	if (dueErr) {
		await supabase.rpc("directory_log_profile_run", {
			p_duration_ms: Date.now() - startedAt,
			p_reason: `due query: ${dueErr.message}`,
			p_status: "failed",
		});
		await captureSync("failed", 0);
		return json(200, { reason: dueErr.message, status: "failed" });
	}

	const uids: string[] = (due ?? []).map(
		(r: { source_uid: string }) => r.source_uid
	);
	if (uids.length === 0) {
		await supabase.rpc("directory_log_profile_run", {
			p_duration_ms: Date.now() - startedAt,
			p_failed: 0,
			p_processed: 0,
			p_status: "ok",
			p_updated: 0,
		});
		await captureSync("success", 0);
		return json(200, { failed: 0, processed: 0, status: "ok", updated: 0 });
	}

	// 2) Fetch + transform + upsert each, with bounded concurrency. Failures are isolated.
	const { updated, failed } = await pool(uids, concurrency, async (uid) => {
		try {
			const raw = await fetchProfile(uid, org, timeoutMs);
			const row = transformProfile(uid, raw);
			if (!row) {
				throw new Error("transform returned null");
			}
			const { error } = await supabase
				.from("directory_business_profiles")
				.upsert(
					{
						...row,
						attempts: 0,
						fetch_error: null,
						fetched_at: new Date().toISOString(),
					},
					{ onConflict: "source_uid" }
				);
			if (error) {
				throw new Error(error.message);
			}
		} catch (e) {
			// Record the attempt so this business leaves the "missing" set and doesn't
			// starve later ones; it's retried on a short backoff (see directory_profiles_due).
			const message = e instanceof Error ? e.message : String(e);
			await supabase.rpc("directory_record_profile_failure", {
				p_error: message.slice(0, 300),
				p_source_uid: uid,
			});
			throw e; // re-throw so the pool counts it as failed
		}
	});

	await supabase.rpc("directory_log_profile_run", {
		p_duration_ms: Date.now() - startedAt,
		p_failed: failed,
		p_processed: uids.length,
		p_status: "ok",
		p_updated: updated,
	});

	// Taxonomy declares sync_status as success | failed (CSV row 44) — a run
	// with any item failures maps to failed; records_ingested still reports
	// what DID land (review: PR #45).
	await captureSync(failed > 0 ? "failed" : "success", updated);
	return json(200, {
		duration_ms: Date.now() - startedAt,
		failed,
		processed: uids.length,
		status: "ok",
		updated,
	});
});
