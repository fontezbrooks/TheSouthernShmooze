/**
 * Canonical MembershipWorks profile transform (Epic B).
 *
 * Turns a raw `GET /v2/account/{uid}/profile` response into a clean row for
 * `directory_business_profiles`: the About HTML becomes the plain-text search corpus
 * (`about_text`) plus sanitized `about_html`, and the structured fields (address,
 * website, socials, deal, gallery, contact) feed the business-detail screen.
 *
 * Runtime-agnostic (Deno + Bun), zero deps — reuses the inline HTML helpers from
 * `directory-transform.ts`. The `sync-profiles` Edge Function and any importer share it.
 */
import { decodeText, htmlToText, stripSecrets } from "./directory-transform.ts";

/** Raw profile response (compact MW field names; only the parts we read are typed). */
export interface RawProfile {
	_st?: {
		dir?: Array<{ lbl?: string; box?: Array<Record<string, unknown>> }>;
	} | null;
	adr?: Record<string, unknown> | null;
	cnm?: string;
	cpn?: Record<string, unknown> | null;
	ctc?: string;
	nam?: string;
	pfk?: Array<{ lbl?: string; url?: string }> | null;
	pfu?: Record<string, unknown> | null;
	pfz?: Array<{ s?: string; l?: string }> | null;
	uid?: string;
	web?: string;
	[key: string]: unknown;
}

/** A clean row ready to upsert into `directory_business_profiles`. */
export interface ProfileRow {
	about_html: string | null;
	about_text: string | null;
	address: Record<string, unknown> | null;
	contact_name: string | null;
	deal: Record<string, unknown> | null;
	gallery: Array<{ small: string | null; large: string | null }> | null;
	raw_profile: RawProfile;
	socials: Record<string, unknown> | null;
	source_uid: string;
	website: string | null;
}

/** Ensure an external URL has a scheme (MW stores some socials without `https://`). */
export function ensureHttps(value: unknown): string | null {
	if (typeof value !== "string") {
		return null;
	}
	const v = value.trim();
	if (v.length === 0) {
		return null;
	}
	if (/^https?:\/\//i.test(v)) {
		return v;
	}
	return `https://${v}`;
}

/** Remove script/style/dangerous attributes from About HTML before we store/render it. */
export function sanitizeHtml(value: unknown): string | null {
	if (typeof value !== "string") {
		return null;
	}
	const cleaned = value
		.replace(/<(script|style|iframe|object|embed)[\s\S]*?<\/\1>/gi, "")
		// Strip event handlers in ALL attribute forms: double-quoted, single-quoted,
		// and unquoted (e.g. `<img src=x onerror=alert(1)>`).
		.replace(/\son\w+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi, "")
		.replace(/javascript:/gi, "");
	return cleaned.trim().length > 0 ? cleaned : null;
}

/** Pull the "About" section's HTML blocks (the keyword corpus) and join them. */
export function extractAboutHtml(raw: RawProfile): string | null {
	const sections = raw._st?.dir;
	if (!Array.isArray(sections)) {
		return null;
	}
	const about = sections.find((s) => s?.lbl === "About");
	if (!(about && Array.isArray(about.box))) {
		return null;
	}
	const blocks = about.box
		.map((b) => (typeof b?.htm === "string" ? b.htm : null))
		.filter((h): h is string => h !== null);
	if (blocks.length === 0) {
		return null;
	}
	return blocks.join("\n");
}

/** Normalize the social/profile links: known `pfu` handles + labelled `pfk` links. */
export function extractSocials(
	raw: RawProfile
): Record<string, unknown> | null {
	const out: Record<string, unknown> = {};
	const pfu = raw.pfu;
	if (pfu && typeof pfu === "object") {
		for (const key of ["bbb", "fbk", "igm", "ylp", "goo"]) {
			const url = ensureHttps((pfu as Record<string, unknown>)[key]);
			if (url) {
				out[key] = url;
			}
		}
	}
	if (Array.isArray(raw.pfk)) {
		const links = raw.pfk
			.map((l) => ({ label: decodeText(l?.lbl), url: ensureHttps(l?.url) }))
			.filter((l) => l.url !== null);
		if (links.length > 0) {
			out.links = links;
		}
	}
	return Object.keys(out).length > 0 ? out : null;
}

/** Map the MW deal (`cpn`) to a clean object, or null when there's no real deal. */
export function extractDeal(raw: RawProfile): Record<string, unknown> | null {
	const cpn = raw.cpn;
	if (!cpn || typeof cpn !== "object") {
		return null;
	}
	const c = cpn as Record<string, unknown>;
	const title = decodeText(c.cpt);
	const text = decodeText(c.cpd);
	const image = typeof c.cpa === "string" ? c.cpa : null;
	if (!(title || text || image)) {
		return null;
	}
	return { image, text, title };
}

/** Map the photo gallery (`pfz`) into small/large URL pairs. */
export function extractGallery(
	raw: RawProfile
): Array<{ small: string | null; large: string | null }> | null {
	if (!Array.isArray(raw.pfz)) {
		return null;
	}
	const items = raw.pfz
		.map((p) => ({
			large: typeof p?.l === "string" ? p.l : null,
			small: typeof p?.s === "string" ? p.s : null,
		}))
		.filter((p) => p.small !== null || p.large !== null);
	return items.length > 0 ? items : null;
}

/** Normalize the postal address (`adr`); drops the redundant `loc` (already on the business). */
export function extractAddress(
	raw: RawProfile
): Record<string, unknown> | null {
	const adr = raw.adr;
	if (!adr || typeof adr !== "object") {
		return null;
	}
	const a = adr as Record<string, unknown>;
	const out: Record<string, unknown> = {
		city: decodeText(a.cit),
		country: decodeText(a.con),
		county: decodeText(a.cot),
		line1: decodeText(a.ad1),
		state: decodeText(a.sta),
		zip: decodeText(a.zip),
	};
	const hasAny = Object.values(out).some((v) => v !== null);
	return hasAny ? out : null;
}

/**
 * Transform a raw profile into a clean row. Requires a `uid` (caller passes the business's
 * source_uid as the source of truth). Returns null when `uid` is missing so the caller skips it.
 */
export function transformProfile(
	sourceUid: string,
	raw: RawProfile
): ProfileRow | null {
	if (!sourceUid) {
		return null;
	}
	const aboutHtmlRaw = extractAboutHtml(raw);
	return {
		about_html: sanitizeHtml(aboutHtmlRaw),
		about_text: htmlToText(aboutHtmlRaw),
		address: extractAddress(raw),
		contact_name: decodeText(raw.ctc),
		deal: extractDeal(raw),
		gallery: extractGallery(raw),
		raw_profile: stripSecrets(raw) as RawProfile,
		socials: extractSocials(raw),
		source_uid: sourceUid,
		website: ensureHttps(decodeText(raw.web)),
	};
}
