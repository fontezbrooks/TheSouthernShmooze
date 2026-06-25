import he from 'he';

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
  has_google_marker: boolean;
  raw_source_payload: DirectoryRecord;
}

/** A normalized phone row for `directory_business_phone_numbers`. */
export interface PhoneRow {
  phone_number: string;
  normalized_phone_number: string;
  position: number;
}

/** Decode HTML entities and trim; returns null for non-strings or empty results. */
export function decodeText(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const decoded = he.decode(value).trim();
  return decoded.length > 0 ? decoded : null;
}

/** Source uses `1` for true and omits the field for false. */
export function toBooleanFlag(value: unknown): boolean {
  return value === 1 || value === true;
}

/** Digits-only version of a phone number (original formatting kept separately). */
export function normalizePhone(phone: string): string {
  return phone.replace(/\D/g, '');
}

/** Split `loc` ([lng, lat]) into validated coordinates; invalid → both null. */
export function splitLoc(loc: unknown): { longitude: number | null; latitude: number | null } {
  if (!Array.isArray(loc) || loc.length < 2) {
    return { longitude: null, latitude: null };
  }
  const lng = loc[0];
  const lat = loc[1];
  const valid =
    typeof lng === 'number' &&
    typeof lat === 'number' &&
    lng >= -180 &&
    lng <= 180 &&
    lat >= -90 &&
    lat <= 90;
  return valid ? { longitude: lng, latitude: lat } : { longitude: null, latitude: null };
}

/** Map the `phn` array into normalized phone rows (skips non-string/empty entries). */
export function extractPhones(phn: unknown): PhoneRow[] {
  if (!Array.isArray(phn)) return [];
  const rows: PhoneRow[] = [];
  for (const entry of phn) {
    if (typeof entry === 'string' && entry.trim().length > 0) {
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
  const logoUrl = record.lgo && typeof record.lgo.s === 'string' ? record.lgo.s : null;

  return {
    source_uid: record.uid,
    name,
    description: decodeText(record.cnm),
    logo_url: logoUrl,
    longitude,
    latitude,
    recommended_score: typeof record.ir5 === 'number' ? record.ir5 : null,
    has_coupon: toBooleanFlag(record.cpn),
    has_google_marker: toBooleanFlag(record.xgm),
    raw_source_payload: record,
  };
}

/** Top-level keys we never want persisted (e.g. an embedded Google Maps API key). */
const SECRET_KEY_NAMES = new Set(['_mk']);

/** Recursively drop secret-named keys, returning a new value (no mutation). */
function stripSecrets(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map(stripSecrets);
  }
  if (value && typeof value === 'object') {
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
    source_type: typeof json.typ === 'string' ? json.typ : null,
    source_record_count: recordCount,
    raw_top_level_payload: sanitized,
  };
}
