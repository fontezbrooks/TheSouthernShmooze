// Server-side PostHog capture (design.md P4). Raw fetch to the single
// capture endpoint — zero deps, runtime-agnostic (Deno + Bun/jest): the
// caller passes env-derived config, this module never reads Deno.env.
//
// Contract: NEVER throws and never rejects — a sync run must not fail
// because analytics hiccuped. Unconfigured (missing key/host) is a silent
// no-op so local/preview environments stay quiet.

const CAPTURE_TIMEOUT_MS = 2000;
const TRAILING_SLASH = /\/$/;

export interface PostHogCaptureConfig {
	/** Project API key (phc_…). NOT the private phx_ key. */
	apiKey?: string;
	/** e.g. https://us.i.posthog.com */
	host?: string;
}

export interface ServerEvent {
	/** PostHog distinct id; server events default to a shared service id. */
	distinctId?: string;
	event: string;
	properties: Record<string, unknown>;
}

/**
 * Fire one server-side event. `$process_person_profile: false` keeps these
 * off person profiles (pure event stream — B-D13). 2s timeout; all
 * failures are logged and swallowed.
 */
export async function captureServerEvent(
	config: PostHogCaptureConfig,
	{ event, properties, distinctId = "server:sync" }: ServerEvent
): Promise<void> {
	const { apiKey, host } = config;
	if (!(apiKey && host)) {
		return;
	}
	const controller = new AbortController();
	const timer = setTimeout(() => controller.abort(), CAPTURE_TIMEOUT_MS);
	try {
		const res = await fetch(`${host.replace(TRAILING_SLASH, "")}/i/v0/e/`, {
			body: JSON.stringify({
				api_key: apiKey,
				distinct_id: distinctId,
				event,
				properties: { ...properties, $process_person_profile: false },
			}),
			headers: { "Content-Type": "application/json" },
			method: "POST",
			signal: controller.signal,
		});
		if (!res.ok) {
			console.error(`[posthog-capture] ${event}: HTTP ${res.status}`);
		}
	} catch (err) {
		const reason = err instanceof Error ? err.message : String(err);
		console.error(`[posthog-capture] ${event}: ${reason}`);
	} finally {
		clearTimeout(timer);
	}
}
