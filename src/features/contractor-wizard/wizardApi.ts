import { err, ok, type Result } from "@/lib/result";
import { getSupabase } from "@/lib/supabase";
import { PAIN_POINTS, type WizardValues } from "./wizardSchema";

/**
 * Check My Fit worker calls, all through the `contractor-wizard` edge
 * function (design.md §E5/Q3: the app never hits the temporary
 * *.workers.dev origin — endpoint moves are a server-side env change).
 */

/** Site origin for the join/help link-outs (Q5: membership is link-out
 * only). Moves to the real Southern Shmooze domain at launch (L-epics). */
export const SITE_BASE = "https://bestelectronicsway.com";

const FN = "contractor-wizard";
const VERIFY_TIMEOUT_MS = 9000;

export interface PlacePrediction {
	placeId: string;
	primary: string;
	secondary: string;
}

/** Worker verdict. `outcome` semantics (site parity): `verified` and
 * `unverified` are both a PASS; `not-yet` is the only rejection. */
export interface FitVerdict {
	offline: boolean;
	outcome: "verified" | "unverified" | "not-yet";
	place: { placeId: string; name: string } | null;
	rating: number | null;
	recommendedLevel: string;
	reviewCount: number | null;
}

type InvokeBody = Record<string, unknown>;

async function invokeWizard(body: InvokeBody): Promise<unknown> {
	const supabase = getSupabase();
	const { data, error } = await supabase.functions.invoke(FN, { body });
	if (error) {
		throw new Error(error.message ?? "Edge function error");
	}
	return data;
}

/** Google Places autocomplete via the worker. Best-effort: the picker is a
 * convenience, never a gate — callers treat an error as "no suggestions". */
export async function suggestPlaces(
	input: string,
	session: string
): Promise<Result<PlacePrediction[]>> {
	try {
		const data = (await invokeWizard({
			action: "suggest",
			input,
			session,
		})) as { predictions?: PlacePrediction[] } | null;
		return ok(data?.predictions ?? []);
	} catch {
		return err("Search is unavailable right now.");
	}
}

/**
 * The fallback when the worker never answers. Site parity: deliberately
 * incapable of rejecting anyone — with no rating in hand there is nothing
 * to judge, so everyone passes through as unverified.
 */
export function fallbackVerdict(values: WizardValues): FitVerdict {
	const wantsLeads =
		values.biggestChallenge === "Not enough leads" ||
		values.leadSource === "It's inconsistent / not sure" ||
		values.leadSource === "Paid ads";
	return {
		offline: true,
		outcome: "unverified",
		place: null,
		rating: null,
		recommendedLevel: wantsLeads ? "Established Business" : "Local Business",
		reviewCount: null,
	};
}

/**
 * Live qualification against Google (worker owns the verdict rules).
 * NEVER rejects on failure — timeout, network error, or a malformed
 * response all fall back to the offline pass-through verdict.
 */
export async function verifyFit(values: WizardValues): Promise<FitVerdict> {
	const payload = {
		answers: {
			biggestChallenge: values.biggestChallenge || "",
			leadSource: values.leadSource || "",
			serviceArea: values.serviceArea || "",
			trade: values.trade || "",
			wantHelp: values.wantHelp || "",
			yearsInBusiness: values.yearsInBusiness || "",
		},
		// Site parity, deliberately hardcoded (matching the web wizard): the
		// step-4 field is labelled "Primary Metro Atlanta service area", so the
		// applicant asserted the claim by answering it. Per the worker contract
		// the flag only softens a geocode that lands just outside the metro —
		// it cannot pass an out-of-area business on its own, and with no
		// listing picked there is no geocode and the outcome is the deliberate
		// "unverified" pass regardless of this flag.
		claimsAtlanta: true,
		placeId: values.placeId || "",
		session: values.placeSession || "",
	};
	// Timer handle kept so the race loser doesn't leak a 9s timeout.
	let timer: ReturnType<typeof setTimeout> | undefined;
	try {
		const timeout = new Promise<never>((_, reject) => {
			timer = setTimeout(
				() => reject(new Error("verify timeout")),
				VERIFY_TIMEOUT_MS
			);
		});
		const data = (await Promise.race([
			invokeWizard({ action: "verify", payload }),
			timeout,
		])) as Partial<FitVerdict> | null;
		// Strict membership check: an unknown outcome string would otherwise
		// render contradictory result copy (rejection text + join CTA) and be
		// submitted upstream (review: PR #34).
		const KNOWN_OUTCOMES: readonly FitVerdict["outcome"][] = [
			"verified",
			"unverified",
			"not-yet",
		];
		if (
			!(data && KNOWN_OUTCOMES.includes(data.outcome as FitVerdict["outcome"]))
		) {
			throw new Error("verify returned no known outcome");
		}
		// A verified verdict quotes its numbers in the result copy — accepting
		// one without them would render "undefined stars across null reviews"
		// and submit it as verified (review: PR #34).
		if (
			data.outcome === "verified" &&
			(typeof data.rating !== "number" || typeof data.reviewCount !== "number")
		) {
			throw new Error("verified verdict missing rating data");
		}
		return {
			offline: Boolean(data.offline),
			outcome: data.outcome as FitVerdict["outcome"],
			place: data.place ?? null,
			rating: typeof data.rating === "number" ? data.rating : null,
			recommendedLevel:
				typeof data.recommendedLevel === "string" && data.recommendedLevel
					? data.recommendedLevel
					: "Local Business",
			reviewCount:
				typeof data.reviewCount === "number" ? data.reviewCount : null,
		};
	} catch {
		return fallbackVerdict(values);
	} finally {
		clearTimeout(timer);
	}
}

/** Substring heuristics shared with the site — not a gate, just a flag so
 * the team notices a non-home-service signup. */
const KNOWN_TRADES = [
	"landscap",
	"lawn",
	"garden",
	"irrigation",
	"tree",
	"arborist",
	"general contract",
	"contractor",
	"construction",
	"remodel",
	"renovation",
	"plumb",
	"paint",
	"roof",
	"gutter",
	"handy",
	"electric",
	"hvac",
	"heating",
	"cooling",
	"air condition",
	"pressure wash",
	"power wash",
	"pest",
	"exterminat",
	"clean",
	"maid",
	"realty",
	"real estate",
	"floor",
	"tile",
	"carpet",
	"fence",
	"fenc",
	"deck",
	"concrete",
	"masonry",
	"brick",
	"paver",
	"paving",
	"drywall",
	"window",
	"door",
	"garage",
	"pool",
	"spa",
	"junk",
	"moving",
	"mover",
	"haul",
	"kitchen",
	"bath",
	"solar",
	"insulat",
	"siding",
	"stucco",
	"chimney",
	"appliance",
	"locksmith",
	"cabinet",
	"countertop",
	"granite",
	"weld",
	"waterproof",
	"foundation",
	"septic",
	"water heater",
	"sewer",
	"epoxy",
	"glass",
	"awning",
	"patio",
	"hardscape",
	"sod",
	"turf",
	"demolition",
	"excavat",
	"grading",
	"dumpster",
	"home service",
	"home improvement",
	"exterior",
	"interior",
];

export function tradeRecognized(trade: string): boolean {
	const t = (trade || "").trim().toLowerCase();
	if (!t) {
		return false;
	}
	return KNOWN_TRADES.some((k) => t.includes(k));
}

/**
 * The `application` object POSTed to the worker — same shape the site's
 * wizard sends (field names are the shared contract; see wizardSchema).
 */
export function buildApplicationPayload(
	values: WizardValues,
	verdict: FitVerdict
): Record<string, unknown> {
	const painPointLabels = values.painPoints
		.map((id) => PAIN_POINTS.find((p) => p.id === id)?.label)
		.filter(Boolean);
	const painServices = [
		...new Set(
			values.painPoints
				.map((id) => PAIN_POINTS.find((p) => p.id === id)?.svc)
				.filter(Boolean)
		),
	];
	return {
		biggestChallenge: values.biggestChallenge,
		business: values.business,
		contact: values.contact,
		email: values.email,
		googleRating: verdict.rating,
		googleReviewCount: verdict.reviewCount,
		instantDecision: verdict.outcome,
		leadSource: values.leadSource,
		licensedInsured: values.licensedInsured,
		// Site parity: checkbox serialises as "yes" or empty string.
		noWebsite: values.noWebsite ? "yes" : "",
		painPointLabels,
		painPoints: values.painPoints,
		painServices,
		phone: values.phone,
		placeAddress: values.placeAddress,
		placeId: values.placeId,
		placeSession: values.placeSession,
		recommendedLevel: verdict.recommendedLevel,
		reviewsRange: values.reviewsRange,
		serviceArea: values.serviceArea,
		trade: values.trade,
		tradeRecognized: tradeRecognized(values.trade),
		verifiedName: verdict.place?.name || "",
		verifiedPlaceId: verdict.place?.placeId || values.placeId || "",
		verifyOffline: verdict.offline,
		wantHelp: values.wantHelp,
		webLink: values.webLink,
		yearsInBusiness: values.yearsInBusiness,
	};
}

/**
 * Fire-and-forget, site parity: the instant decision is already on screen;
 * a failed submit is logged upstream but never surfaces to the applicant.
 */
export async function submitApplication(
	values: WizardValues,
	verdict: FitVerdict
): Promise<boolean> {
	try {
		await invokeWizard({
			action: "submit",
			application: buildApplicationPayload(values, verdict),
		});
		return true;
	} catch {
		// Instant response already shown — swallow by design. The boolean lets
		// callers know whether the application actually persisted (analytics
		// must not report submissions that never reached the backend).
		return false;
	}
}

/** Personalised welcome-page link (only public fields in the URL — no
 * email, phone, or name; site parity). */
export function buildJoinUrl(
	values: WizardValues,
	verdict: FitVerdict
): string {
	const q = new URLSearchParams({
		business: verdict.place?.name || values.business || "",
		level: verdict.recommendedLevel,
		outcome: verdict.outcome,
		rating: verdict.rating == null ? "" : String(verdict.rating),
		reviews: verdict.reviewCount == null ? "" : String(verdict.reviewCount),
		trade: values.trade || "",
	});
	return `${SITE_BASE}/join?${q.toString()}`;
}

export const HELP_URL = `${SITE_BASE}/how-we-can-help`;
