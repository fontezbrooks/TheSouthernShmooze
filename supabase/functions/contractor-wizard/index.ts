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

const DEFAULT_WORKER_BASE = "https://shmooze-worker.jonah-eda.workers.dev";
const UPSTREAM_TIMEOUT_MS = 10000;

// Browser targets (Expo web) preflight functions.invoke — without these
// headers every response is blocked client-side (review: PR #34).
const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function json(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", ...CORS_HEADERS },
  });
}

function workerBase(): string {
  return (Deno.env.get("WORKER_API_BASE") ?? DEFAULT_WORKER_BASE).replace(
    /\/$/,
    "",
  );
}

async function proxyFetch(url: string, init?: RequestInit): Promise<Response> {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), UPSTREAM_TIMEOUT_MS);
  try {
    const res = await fetch(url, { ...init, signal: ctrl.signal });
    const body = await res.text();
    return new Response(body, {
      status: res.status,
      headers: { "Content-Type": "application/json", ...CORS_HEADERS },
    });
  } finally {
    clearTimeout(timer);
  }
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
        if (!input) return json(400, { error: "input required" });
        const qs = new URLSearchParams({ input, session });
        return await proxyFetch(`${base}/api/places/suggest?${qs}`);
      }
      case "verify": {
        if (typeof body.payload !== "object" || body.payload === null) {
          return json(400, { error: "payload required" });
        }
        return await proxyFetch(`${base}/api/places/verify`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body.payload),
        });
      }
      case "submit": {
        if (typeof body.application !== "object" || body.application === null) {
          return json(400, { error: "application required" });
        }
        return await proxyFetch(`${base}/api/submit-application`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ application: body.application }),
        });
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
