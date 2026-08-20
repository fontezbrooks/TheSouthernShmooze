/**
 * Canonical MembershipWorks directory transform.
 *
 * SINGLE SOURCE OF TRUTH for both runtimes:
 *  - the Bun importer (`scripts/directory-import/`) re-exports this file, and
 *  - the Deno Edge Function (`supabase/functions/sync-directory/`) imports it directly.
 *
 * It must therefore stay runtime-agnostic: NO npm-only imports, NO Deno-only imports,
 * NO Node built-ins. The HTML-entity decoding that previously used the `he` npm package
 * is reimplemented inline (see `decodeEntities`) so the module has zero dependencies.
 */

/** A raw business record from `json.usr` (compact source field names). */
export interface DirectoryRecord {
	cnm?: string;
	cpn?: unknown;
	ir5?: unknown;
	lgo?: { s?: string } | null;
	loc?: unknown;
	nam?: string;
	phn?: unknown;
	uid?: string;
	xgm?: unknown;
	[key: string]: unknown;
}

/** A clean row ready to upsert into `directory_businesses`. */
export interface BusinessRow {
	description: string | null;
	has_coupon: boolean;
	/** Source `xgm` flag — the MembershipWorks CERTIFIED STAR badge (`xgm:1` → true, absent → false). */
	is_certified: boolean;
	latitude: number | null;
	logo_url: string | null;
	longitude: number | null;
	name: string;
	raw_source_payload: DirectoryRecord;
	recommended_score: number | null;
	/** Stable hash of the persisted projection — drives change detection in `directory_sync_apply`. */
	source_content_hash: string;
	source_uid: string;
}

/** A normalized phone row for `directory_business_phone_numbers`. */
export interface PhoneRow {
	normalized_phone_number: string;
	phone_number: string;
	position: number;
}

/** Named HTML entities present in the MembershipWorks corpus. Case-sensitive (as authored). */
const NAMED_ENTITIES: Record<string, string> = {
	amp: "&",
	apos: "'",
	copy: "©",
	deg: "°",
	gt: ">",
	hellip: "…",
	ldquo: "“",
	lsquo: "‘",
	lt: "<",
	// Typographic entities common in the rich profile "About" HTML.
	mdash: "—",
	nbsp: " ",
	ndash: "–",
	quot: '"',
	rdquo: "”",
	reg: "®",
	rsquo: "’",
	trade: "™",
};

/**
 * Decode the subset of HTML entities that appear in MembershipWorks text: named refs
 * (`&amp; &quot; &apos; &lt; &gt; &nbsp;`), decimal numeric refs (`&#8217;`, `&#128170;`),
 * and hex numeric refs (`&#x2019;`). Unknown entities are left untouched. No external deps.
 */
function decodeEntities(input: string): string {
	return input.replace(
		/&(#x[0-9a-fA-F]+|#[0-9]+|[a-zA-Z]+);/g,
		(match, body: string) => {
			if (body.charCodeAt(0) === 35 /* '#' */) {
				const isHex = body.charCodeAt(1) === 120 || body.charCodeAt(1) === 88; // 'x' / 'X'
				const code = Number.parseInt(
					body.slice(isHex ? 2 : 1),
					isHex ? 16 : 10
				);
				if (!Number.isFinite(code) || code < 0 || code > 0x10_ff_ff) {
					return match;
				}
				try {
					return String.fromCodePoint(code);
				} catch {
					return match;
				}
			}
			const named = NAMED_ENTITIES[body];
			return named === undefined ? match : named;
		}
	);
}

/** Decode HTML entities and trim; returns null for non-strings or empty results. */
export function decodeText(value: unknown): string | null {
	if (typeof value !== "string") {
		return null;
	}
	const decoded = decodeEntities(value).trim();
	return decoded.length > 0 ? decoded : null;
}

/**
 * Convert an HTML fragment to plain text: drop script/style blocks, strip tags, decode
 * entities, and collapse whitespace. Returns null for non-strings or empty results.
 * Used to derive `about_text` (the search corpus) from a business's About HTML.
 */
export function htmlToText(value: unknown): string | null {
	if (typeof value !== "string") {
		return null;
	}
	const stripped = value
		.replace(/<(script|style)[\s\S]*?<\/\1>/gi, " ")
		.replace(/<[^>]+>/g, " ");
	const decoded = decodeEntities(stripped).replace(/\s+/g, " ").trim();
	return decoded.length > 0 ? decoded : null;
}

/** Source uses `1` for true and omits the field for false. */
export function toBooleanFlag(value: unknown): boolean {
	return value === 1 || value === true;
}

/** Digits-only version of a phone number (original formatting kept separately). */
export function normalizePhone(phone: string): string {
	return phone.replace(/\D/g, "");
}

/** Split `loc` ([lng, lat]) into validated coordinates; invalid → both null. */
export function splitLoc(loc: unknown): {
	longitude: number | null;
	latitude: number | null;
} {
	if (!Array.isArray(loc) || loc.length < 2) {
		return { latitude: null, longitude: null };
	}
	const lng = loc[0];
	const lat = loc[1];
	const valid =
		typeof lng === "number" &&
		typeof lat === "number" &&
		lng >= -180 &&
		lng <= 180 &&
		lat >= -90 &&
		lat <= 90;
	return valid
		? { latitude: lat, longitude: lng }
		: { latitude: null, longitude: null };
}

/** Map the `phn` array into normalized phone rows (skips non-string/empty entries). */
export function extractPhones(phn: unknown): PhoneRow[] {
	if (!Array.isArray(phn)) {
		return [];
	}
	const rows: PhoneRow[] = [];
	for (const entry of phn) {
		if (typeof entry === "string" && entry.trim().length > 0) {
			rows.push({
				normalized_phone_number: normalizePhone(entry),
				phone_number: entry,
				position: rows.length,
			});
		}
	}
	return rows;
}

/** The persisted, content-bearing fields of a business (everything that drives change). */
type BusinessContent = Omit<
	BusinessRow,
	"source_content_hash" | "raw_source_payload"
>;

/**
 * Stable hash of a member's persisted projection (clean business fields + ordered phones).
 * Drives change detection in `directory_sync_apply`: identical content → identical hash, so
 * unchanged members are skipped on sync. Deliberately excludes `source_uid` (the key, not
 * content) and `raw_source_payload` (noisy). Includes `logo_url` (its cache-buster bumps on
 * real logo swaps). Zero-dep, synchronous FNV-1a×2 → 16 hex chars; runtime-agnostic.
 */
export function contentHash(b: BusinessContent, phones: PhoneRow[]): string {
	const canonical = JSON.stringify([
		b.name,
		b.description,
		b.logo_url,
		b.longitude,
		b.latitude,
		b.recommended_score,
		b.has_coupon,
		b.is_certified,
		phones.map((p) => p.normalized_phone_number),
	]);
	let h1 = 0x81_1c_9d_c5;
	let h2 = 0x01_00_01_93;
	for (let i = 0; i < canonical.length; i++) {
		const c = canonical.charCodeAt(i);
		h1 = Math.imul(h1 ^ c, 0x01_00_01_93);
		h2 = Math.imul(h2 ^ c, 0x85_eb_ca_6b);
	}
	return (
		(h1 >>> 0).toString(16).padStart(8, "0") +
		(h2 >>> 0).toString(16).padStart(8, "0")
	);
}

/**
 * Transform a raw record into a clean business row. Returns null when the record is
 * invalid (missing `uid`, or `nam` that decodes to empty) so the caller can skip it.
 */
export function transformRecord(record: DirectoryRecord): BusinessRow | null {
	if (!record.uid) {
		return null;
	}
	const name = decodeText(record.nam);
	if (name === null) {
		return null;
	}

	const { longitude, latitude } = splitLoc(record.loc);
	const logoUrl =
		record.lgo && typeof record.lgo.s === "string" ? record.lgo.s : null;

	const content: BusinessContent = {
		description: decodeText(record.cnm),
		has_coupon: toBooleanFlag(record.cpn),
		is_certified: toBooleanFlag(record.xgm),
		latitude,
		logo_url: logoUrl,
		longitude,
		name,
		recommended_score: typeof record.ir5 === "number" ? record.ir5 : null,
		source_uid: record.uid,
	};

	return {
		...content,
		raw_source_payload: record,
		source_content_hash: contentHash(content, extractPhones(record.phn)),
	};
}

/** Top-level keys we never want persisted (e.g. an embedded Google Maps API key). */
const SECRET_KEY_NAMES = new Set(["_mk"]);

/** Recursively drop secret-named keys, returning a new value (no mutation). */
export function stripSecrets(value: unknown): unknown {
	if (Array.isArray(value)) {
		return value.map(stripSecrets);
	}
	if (value && typeof value === "object") {
		const out: Record<string, unknown> = {};
		for (const [k, v] of Object.entries(value)) {
			if (SECRET_KEY_NAMES.has(k)) {
				continue;
			}
			out[k] = stripSecrets(v);
		}
		return out;
	}
	return value;
}

export interface TopLevelResponse {
	_re?: unknown;
	typ?: unknown;
	usr?: unknown;
	[key: string]: unknown;
}

export interface BatchPayload {
	raw_top_level_payload: Record<string, unknown>;
	source_record_count: number | null;
	source_type: string | null;
}

/**
 * Build the import-batch row: top-level response minus `usr`, with secrets stripped.
 * `source_record_count` reflects the records actually processed from this file
 * (`usr.length`); the source's claimed total (`_re`) is preserved in the raw payload.
 */
export function buildBatchPayload(json: TopLevelResponse): BatchPayload {
	const { usr, ...rest } = json;
	const sanitized = stripSecrets(rest) as Record<string, unknown>;
	const recordCount = Array.isArray(usr) ? usr.length : null;
	return {
		raw_top_level_payload: sanitized,
		source_record_count: recordCount,
		source_type: typeof json.typ === "string" ? json.typ : null,
	};
}

/** A record prepared for the sync RPC: clean business + its phone rows. */
export interface PreparedRecord {
	business: BusinessRow;
	phones: PhoneRow[];
}

/**
 * Transform a raw `usr` array into prepared records for `directory_sync_apply`, skipping
 * invalid records. Shared by the importer and the Edge Function so both produce an
 * identical change set. Returns the prepared rows plus a count of skipped records.
 */
export function prepareRecords(records: DirectoryRecord[]): {
	prepared: PreparedRecord[];
	skipped: number;
} {
	const prepared: PreparedRecord[] = [];
	let skipped = 0;
	for (const record of records) {
		const business = transformRecord(record);
		if (!business) {
			skipped += 1;
			continue;
		}
		prepared.push({ business, phones: extractPhones(record.phn) });
	}
	return { prepared, skipped };
}
