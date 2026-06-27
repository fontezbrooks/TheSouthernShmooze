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
import { prepareRecords, type DirectoryRecord } from "../_shared/directory-transform.ts";

const DEFAULT_MW_URL = "https://api.membershipworks.com/v2/directory?_rf=Members&_st=";
const DEFAULT_ORG = "33993";
const DEFAULT_TIMEOUT_MS = 15000;

function json(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

interface FetchResult {
  records: { business: unknown; phones: unknown }[];
  fetchedCount: number;
  skipped: number;
}

/** GET the MW feed with a timeout; validate the envelope; transform. Throws on any problem. */
async function fetchDirectory(url: string, org: string, timeoutMs: number): Promise<FetchResult> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  let res: Response;
  try {
    res = await fetch(url, {
      method: "GET",
      headers: {
        accept: "application/json",
        "x-org": org,
        origin: "https://www.shmoozeatl.com",
        referer: "https://www.shmoozeatl.com/",
      },
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

  if (!body || !Array.isArray(body.usr)) {
    throw new Error("MW response missing `usr` array");
  }

  const { prepared, skipped } = prepareRecords(body.usr as DirectoryRecord[]);
  return { records: prepared, fetchedCount: body.usr.length, skipped };
}

Deno.serve(async (req: Request) => {
  const startedAt = Date.now();

  // 1) Auth.
  const expected = Deno.env.get("SYNC_TRIGGER_SECRET");
  if (!expected || req.headers.get("X-Sync-Secret") !== expected) {
    return json(401, { status: "unauthorized" });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabase = createClient(supabaseUrl, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const mwUrl = Deno.env.get("MW_DIRECTORY_URL") ?? DEFAULT_MW_URL;
  const org = Deno.env.get("MW_ORG") ?? DEFAULT_ORG;
  const timeoutMs = Number(Deno.env.get("FETCH_TIMEOUT_MS") ?? DEFAULT_TIMEOUT_MS);

  // 2) Fetch + transform. Any failure => log + return 200, NO directory writes.
  let fetched: FetchResult;
  try {
    fetched = await fetchDirectory(mwUrl, org, timeoutMs);
  } catch (err) {
    const reason = err instanceof Error ? err.message : String(err);
    await supabase.rpc("directory_log_run", {
      p_status: "failed",
      p_reason: reason,
      p_duration_ms: Date.now() - startedAt,
    });
    return json(200, { status: "failed", reason });
  }

  // 3) Apply the change set atomically (guard + upsert + mirror-delete + phones live in the RPC).
  const { data, error } = await supabase.rpc("directory_sync_apply", {
    p_records: fetched.records,
    p_fetched_count: fetched.fetchedCount,
    p_duration_ms: Date.now() - startedAt,
  });

  if (error) {
    return json(200, { status: "failed", reason: error.message });
  }

  return json(200, { ...data, skipped: fetched.skipped, duration_ms: Date.now() - startedAt });
});
