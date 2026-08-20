const UTM_KEYS = [
	"utm_source",
	"utm_medium",
	"utm_campaign",
	"utm_term",
	"utm_content",
] as const;

/**
 * `$initial_utm_*` person props from a cold-start deep-link URL (B-D14), or
 * null when the URL carries no UTM params. Parsed with URLSearchParams (Expo
 * winter runtime polyfills it) — no expo-linking dependency, so the pure
 * function stays unit-testable.
 */
export function initialUtmProps(url: string): Record<string, string> | null {
	const queryStart = url.indexOf("?");
	if (queryStart === -1) {
		return null;
	}
	const hashStart = url.indexOf("#", queryStart);
	const query = url.slice(
		queryStart + 1,
		hashStart === -1 ? url.length : hashStart
	);
	const params = new URLSearchParams(query);
	const props: Record<string, string> = {};
	for (const key of UTM_KEYS) {
		const value = params.get(key);
		if (value) {
			props[`$initial_${key}`] = value;
		}
	}
	return Object.keys(props).length > 0 ? props : null;
}
