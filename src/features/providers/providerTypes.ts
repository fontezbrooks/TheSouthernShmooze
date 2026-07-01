import type { DirectoryBusinessRow } from "@/lib/database";

/** Certified-provider view-model rendered by BusinessCard. */
export interface DirectoryBusiness {
  id: string;
  /** Directory deep-link key — opens shmoozeatl.com/directory#!biz/id/{sourceUid}. */
  sourceUid: string;
  name: string;
  /** From `description`. */
  tagline: string;
  logoUrl: string | null;
  /** Raw normalized phone (tel: target), e.g. "6787904781". */
  phone: string | null;
  /** Display phone, e.g. "678-790-4781". */
  phoneDisplay: string | null;
  /** Has a coupon → discount (tag) chip. */
  hasCoupon: boolean;
  /** Source `xgm` flag → MembershipWorks certified-star badge. */
  isCertified: boolean;
  /** Source `ir5` "Recommended" flag (recommended_score present) → reviews (thumbsUp) chip. */
  recommended: boolean;
  /** Geo coordinates (from the source feed) — used by The Shmoozer for distance. Null when unknown. */
  latitude: number | null;
  longitude: number | null;
}

/** Format a 10-digit US number as XXX-XXX-XXXX; otherwise return as-is. */
export function formatPhone(raw: string): string {
  const digits = raw.replace(/\D/g, "");
  if (digits.length === 10) {
    return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`;
  }
  return raw;
}

/** Map a directory view row to the BusinessCard view-model. */
export function toBusiness(row: DirectoryBusinessRow): DirectoryBusiness {
  const first = row.phone_numbers?.[0]?.normalized_phone_number ?? null;
  return {
    id: row.id,
    sourceUid: row.source_uid,
    name: row.name,
    tagline: row.description ?? "",
    logoUrl: row.logo_url,
    phone: first,
    phoneDisplay: first ? formatPhone(first) : null,
    hasCoupon: row.has_coupon,
    isCertified: row.is_certified,
    recommended: row.recommended_score != null,
    latitude: row.latitude,
    longitude: row.longitude,
  };
}
