import type { DirectoryBusinessRow } from "@/lib/database";

/** Certified-provider view-model rendered by BusinessCard. */
export interface DirectoryBusiness {
	/** Has a coupon → discount (tag) chip. */
	hasCoupon: boolean;
	id: string;
	/** Source `xgm` flag → MembershipWorks certified-star badge. */
	isCertified: boolean;
	/** Geo coordinates (from the source feed) — used by The Shmoozer for distance. Null when unknown. */
	latitude: number | null;
	logoUrl: string | null;
	longitude: number | null;
	name: string;
	/** Raw normalized phone (tel: target), e.g. "6787904781". */
	phone: string | null;
	/** Display phone, e.g. "678-790-4781". */
	phoneDisplay: string | null;
	/** Source `ir5` "Recommended" flag (recommended_score present) → reviews (thumbsUp) chip. */
	recommended: boolean;
	/** Directory deep-link key — opens shmoozeatl.com/directory#!biz/id/{sourceUid}. */
	sourceUid: string;
	/** From `description`. */
	tagline: string;
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
		hasCoupon: row.has_coupon,
		id: row.id,
		isCertified: row.is_certified,
		latitude: row.latitude,
		logoUrl: row.logo_url,
		longitude: row.longitude,
		name: row.name,
		phone: first,
		phoneDisplay: first ? formatPhone(first) : null,
		recommended: row.recommended_score != null,
		sourceUid: row.source_uid,
		tagline: row.description ?? "",
	};
}
