import { formatPhone } from "@/features/providers/providerTypes";
import type { DirectoryBusinessDetailRow } from "@/lib/database";

export interface DetailPhone {
	/** Formatted for display, e.g. 678-790-4781. */
	display: string;
	/** Digits-only tel: target. */
	raw: string;
}

/** Social link surfaced on the detail screen. */
export interface DetailSocial {
	/** Raw MW social key (bbb/fbk/goo/igm/ylp), or "link" for free-form links — drives the icon (P6). */
	key: string;
	/** Short pill label ("BBB", "Yelp", …). */
	label: string;
	url: string;
}

/** View-model for the business-detail screen. */
export interface BusinessDetail {
	aboutText: string | null;
	/** One-line formatted postal address, or null. */
	address: string | null;
	contactName: string | null;
	gallery: string[];
	isCertified: boolean;
	logoUrl: string | null;
	name: string;
	phones: DetailPhone[];
	socials: DetailSocial[];
	sourceUid: string;
	tagline: string;
	website: string | null;
}

/**
 * Prepend `https://` when a URL has no scheme. MW stores `web` scheme-less (e.g.
 * "www.example.com"), and `Linking.openURL`/the in-app browser need a scheme to open it —
 * without this the "Visit website" button silently no-ops.
 */
function normalizeUrl(value: string | null): string | null {
	if (!value) {
		return null;
	}
	const v = value.trim();
	if (v.length === 0) {
		return null;
	}
	return /^https?:\/\//i.test(v) ? v : `https://${v}`;
}

/**
 * Join the normalized address object into a single readable line. Ingestion stores
 * normalized keys (`line1, city, state, zip` — see `extractAddress`), NOT the raw MW
 * keys, so read those.
 */
function formatAddress(address: Record<string, unknown> | null): string | null {
	if (!address) {
		return null;
	}
	const parts = ["line1", "city", "state", "zip"]
		.map((k) => address[k])
		.filter((v): v is string => typeof v === "string" && v.trim().length > 0);
	return parts.length > 0 ? parts.join(", ") : null;
}

/** Short pill labels for the known MW social keys (P6 — "Better Business Bureau" → "BBB"). */
const SOCIAL_LABELS: Record<string, string> = {
	bbb: "BBB",
	fbk: "Facebook",
	goo: "Google Business",
	igm: "Instagram",
	ylp: "Yelp",
};

/** Flatten the socials object (`{ fbk: url, igm: url, links: [...] }`) into a flat list. */
function flattenSocials(
	socials: Record<string, unknown> | null
): DetailSocial[] {
	if (!socials) {
		return [];
	}
	const out: DetailSocial[] = [];
	for (const [key, value] of Object.entries(socials)) {
		if (typeof value === "string") {
			out.push({ key, label: SOCIAL_LABELS[key] ?? key, url: value });
		} else if (key === "links" && Array.isArray(value)) {
			for (const link of value) {
				const url = (link as { url?: unknown })?.url;
				const label = (link as { label?: unknown })?.label;
				if (typeof url === "string") {
					out.push({
						key: "link",
						label: typeof label === "string" ? label : "Link",
						url,
					});
				}
			}
		}
	}
	return out;
}

export function toDetail(row: DirectoryBusinessDetailRow): BusinessDetail {
	const phones = (row.phone_numbers ?? [])
		.map((p) => p.normalized_phone_number)
		.filter((n): n is string => typeof n === "string" && n.length > 0)
		.map((n) => ({ display: formatPhone(n), raw: n }));

	const gallery = (row.gallery ?? [])
		.map((g) => g.large ?? g.small)
		.filter((u): u is string => typeof u === "string" && u.length > 0);

	return {
		aboutText: row.about_text,
		address: formatAddress(row.address),
		contactName: row.contact_name,
		gallery,
		isCertified: row.is_certified,
		logoUrl: row.logo_url,
		name: row.name,
		phones,
		socials: flattenSocials(row.socials),
		sourceUid: row.source_uid,
		tagline: row.description ?? "",
		website: normalizeUrl(row.website),
	};
}
