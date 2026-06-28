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
  uid?: string;
  nam?: string;
  cnm?: string;
  lgo?: { s?: string } | null;
  loc?: unknown;
  phn?: unknown;
  ir5?: unknown;
  cpn?: unknown;
  xgm?: unknown;
  [key: string]: unknown;
}

/** A clean row ready to upsert into `directory_businesses`. */
export interface BusinessRow {
  source_uid: string;
  name: string;
  description: string | null;
  logo_url: string | null;
  longitude: number | null;
  latitude: number | null;
  recommended_score: number | null;
  has_coupon: boolean;
  /** Source `xgm` flag — the MembershipWorks CERTIFIED STAR badge (`xgm:1` → true, absent → false). */
  is_certified: boolean;
  raw_source_payload: DirectoryRecord;
}

/** A normalized phone row for `directory_business_phone_numbers`. */
export interface PhoneRow {
  phone_number: string;
  normalized_phone_number: string;
  position: number;
}

/** Named HTML entities present in the MembershipWorks corpus. Case-sensitive (as authored). */
const NAMED_ENTITIES: Record<string, string> = {
  amp: "&",
  lt: "<",
  gt: ">",
  quot: '"',
  apos: "'",
  // Typographic entities common in the rich profile "About" HTML.
  mdash: "—",
  ndash: "–",
  rsquo: "’",
  lsquo: "‘",
  rdquo: "”",
  ldquo: "“",
  hellip: "…",
  copy: "©",
  reg: "®",
  trade: "™",
  deg: "°",
  nbsp: " ",
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
        const code = parseInt(body.slice(isHex ? 2 : 1), isHex ? 16 : 10);
        if (!Number.isFinite(code) || code < 0 || code > 0x10ffff) return match;
        try {
          return String.fromCodePoint(code);
        } catch {
          return match;
        }
      }
      const named = NAMED_ENTITIES[body];
      return named !== undefined ? named : match;
    },
  );
}

/** Decode HTML entities and trim; returns null for non-strings or empty results. */
export function decodeText(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const decoded = decodeEntities(value).trim();
  return decoded.length > 0 ? decoded : null;
}

/**
 * Convert an HTML fragment to plain text: drop script/style blocks, strip tags, decode
 * entities, and collapse whitespace. Returns null for non-strings or empty results.
 * Used to derive `about_text` (the search corpus) from a business's About HTML.
 */
export function htmlToText(value: unknown): string | null {
  if (typeof value !== "string") return null;
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
    return { longitude: null, latitude: null };
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
    ? { longitude: lng, latitude: lat }
    : { longitude: null, latitude: null };
}

/** Map the `phn` array into normalized phone rows (skips non-string/empty entries). */
export function extractPhones(phn: unknown): PhoneRow[] {
  if (!Array.isArray(phn)) return [];
  const rows: PhoneRow[] = [];
  for (const entry of phn) {
    if (typeof entry === "string" && entry.trim().length > 0) {
      rows.push({
        phone_number: entry,
        normalized_phone_number: normalizePhone(entry),
        position: rows.length,
      });
    }
  }
  return rows;
}

/**
 * Transform a raw record into a clean business row. Returns null when the record is
 * invalid (missing `uid`, or `nam` that decodes to empty) so the caller can skip it.
 */
export function transformRecord(record: DirectoryRecord): BusinessRow | null {
  if (!record.uid) return null;
  const name = decodeText(record.nam);
  if (name === null) return null;

  const { longitude, latitude } = splitLoc(record.loc);
  const logoUrl =
    record.lgo && typeof record.lgo.s === "string" ? record.lgo.s : null;

  return {
    source_uid: record.uid,
    name,
    description: decodeText(record.cnm),
    logo_url: logoUrl,
    longitude,
    latitude,
    recommended_score: typeof record.ir5 === "number" ? record.ir5 : null,
    has_coupon: toBooleanFlag(record.cpn),
    is_certified: toBooleanFlag(record.xgm),
    raw_source_payload: record,
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
      if (SECRET_KEY_NAMES.has(k)) continue;
      out[k] = stripSecrets(v);
    }
    return out;
  }
  return value;
}

export interface TopLevelResponse {
  typ?: unknown;
  _re?: unknown;
  usr?: unknown;
  [key: string]: unknown;
}

export interface BatchPayload {
  source_type: string | null;
  source_record_count: number | null;
  raw_top_level_payload: Record<string, unknown>;
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
    source_type: typeof json.typ === "string" ? json.typ : null,
    source_record_count: recordCount,
    raw_top_level_payload: sanitized,
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
