import type { DirectoryBusinessDetailRow } from "@/lib/database";
import { formatPhone } from "@/features/providers/providerTypes";

export interface DetailPhone {
  /** Digits-only tel: target. */
  raw: string;
  /** Formatted for display, e.g. 678-790-4781. */
  display: string;
}

/** Social link surfaced on the detail screen. */
export interface DetailSocial {
  key: string;
  url: string;
}

/** View-model for the business-detail screen. */
export interface BusinessDetail {
  sourceUid: string;
  name: string;
  logoUrl: string | null;
  tagline: string;
  isCertified: boolean;
  aboutText: string | null;
  website: string | null;
  contactName: string | null;
  /** One-line formatted postal address, or null. */
  address: string | null;
  socials: DetailSocial[];
  gallery: string[];
  phones: DetailPhone[];
}

/**
 * Prepend `https://` when a URL has no scheme. MW stores `web` scheme-less (e.g.
 * "www.example.com"), and `Linking.openURL`/the in-app browser need a scheme to open it —
 * without this the "Visit website" button silently no-ops.
 */
function normalizeUrl(value: string | null): string | null {
  if (!value) return null;
  const v = value.trim();
  if (v.length === 0) return null;
  return /^https?:\/\//i.test(v) ? v : `https://${v}`;
}

/** Join the MW address object (`ad1, cit, sta, zip`) into a single readable line. */
function formatAddress(address: Record<string, unknown> | null): string | null {
  if (!address) return null;
  const parts = ["ad1", "cit", "sta", "zip"]
    .map((k) => address[k])
    .filter((v): v is string => typeof v === "string" && v.trim().length > 0);
  return parts.length > 0 ? parts.join(", ") : null;
}

/**
 * Human labels for the known MW social keys. Temporary — surfaces real names so the
 * designer knows which icon replaces each word (unmapped keys fall back to the key).
 */
const SOCIAL_LABELS: Record<string, string> = {
  bbb: "Better Business Bureau",
  fbk: "facebook",
  goo: "google business profile",
  igm: "instagram",
  ylp: "yelp",
};

/** Flatten the socials object (`{ fbk: url, igm: url, links: [...] }`) into a flat list. */
function flattenSocials(
  socials: Record<string, unknown> | null,
): DetailSocial[] {
  if (!socials) return [];
  const out: DetailSocial[] = [];
  for (const [key, value] of Object.entries(socials)) {
    if (typeof value === "string") {
      out.push({ key: SOCIAL_LABELS[key] ?? key, url: value });
    } else if (key === "links" && Array.isArray(value)) {
      for (const link of value) {
        const url = (link as { url?: unknown })?.url;
        const label = (link as { label?: unknown })?.label;
        if (typeof url === "string") {
          out.push({ key: typeof label === "string" ? label : "link", url });
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
    .map((n) => ({ raw: n, display: formatPhone(n) }));

  const gallery = (row.gallery ?? [])
    .map((g) => g.large ?? g.small)
    .filter((u): u is string => typeof u === "string" && u.length > 0);

  return {
    sourceUid: row.source_uid,
    name: row.name,
    logoUrl: row.logo_url,
    tagline: row.description ?? "",
    isCertified: row.is_certified,
    aboutText: row.about_text,
    website: normalizeUrl(row.website),
    contactName: row.contact_name,
    address: formatAddress(row.address),
    socials: flattenSocials(row.socials),
    gallery,
    phones,
  };
}
