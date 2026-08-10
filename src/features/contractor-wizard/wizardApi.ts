import { getSupabase } from "@/lib/supabase";
import { ok, err, type Result } from "@/lib/result";
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
  outcome: "verified" | "unverified" | "not-yet";
  rating: number | null;
  reviewCount: number | null;
  recommendedLevel: string;
  place: { placeId: string; name: string } | null;
  offline: boolean;
}

type InvokeBody = Record<string, unknown>;

async function invokeWizard(body: InvokeBody): Promise<unknown> {
  const supabase = getSupabase();
  const { data, error } = await supabase.functions.invoke(FN, { body });
  if (error) throw new Error(error.message ?? "Edge function error");
  return data;
}

/** Google Places autocomplete via the worker. Best-effort: the picker is a
 * convenience, never a gate — callers treat an error as "no suggestions". */
export async function suggestPlaces(
  input: string,
  session: string,
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
    outcome: "unverified",
    rating: null,
    reviewCount: null,
    recommendedLevel: wantsLeads ? "Established Business" : "Local Business",
    place: null,
    offline: true,
  };
}

/**
 * Live qualification against Google (worker owns the verdict rules).
 * NEVER rejects on failure — timeout, network error, or a malformed
 * response all fall back to the offline pass-through verdict.
 */
export async function verifyFit(values: WizardValues): Promise<FitVerdict> {
  const payload = {
    placeId: values.placeId || "",
    session: values.placeSession || "",
    claimsAtlanta: true,
    answers: {
      trade: values.trade || "",
      serviceArea: values.serviceArea || "",
      leadSource: values.leadSource || "",
      biggestChallenge: values.biggestChallenge || "",
      wantHelp: values.wantHelp || "",
      yearsInBusiness: values.yearsInBusiness || "",
    },
  };
  try {
    const timeout = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error("verify timeout")), VERIFY_TIMEOUT_MS);
    });
    const data = (await Promise.race([
      invokeWizard({ action: "verify", payload }),
      timeout,
    ])) as Partial<FitVerdict> | null;
    if (!data || typeof data.outcome !== "string") {
      throw new Error("verify returned no outcome");
    }
    return {
      outcome: data.outcome as FitVerdict["outcome"],
      rating: typeof data.rating === "number" ? data.rating : null,
      reviewCount:
        typeof data.reviewCount === "number" ? data.reviewCount : null,
      recommendedLevel:
        typeof data.recommendedLevel === "string" && data.recommendedLevel
          ? data.recommendedLevel
          : "Local Business",
      place: data.place ?? null,
      offline: Boolean(data.offline),
    };
  } catch {
    return fallbackVerdict(values);
  }
}

/** Substring heuristics shared with the site — not a gate, just a flag so
 * the team notices a non-home-service signup. */
const KNOWN_TRADES = [
  "landscap","lawn","garden","irrigation","tree","arborist","general contract","contractor",
  "construction","remodel","renovation","plumb","paint","roof","gutter","handy","electric",
  "hvac","heating","cooling","air condition","pressure wash","power wash","pest","exterminat",
  "clean","maid","realty","real estate","floor","tile","carpet","fence","fenc","deck","concrete",
  "masonry","brick","paver","paving","drywall","window","door","garage","pool","spa","junk",
  "moving","mover","haul","kitchen","bath","solar","insulat","siding","stucco","chimney",
  "appliance","locksmith","cabinet","countertop","granite","weld","waterproof","foundation",
  "septic","water heater","sewer","epoxy","glass","awning","patio","hardscape","sod","turf",
  "demolition","excavat","grading","dumpster","home service","home improvement","exterior","interior",
];

export function tradeRecognized(trade: string): boolean {
  const t = (trade || "").trim().toLowerCase();
  if (!t) return false;
  return KNOWN_TRADES.some((k) => t.includes(k));
}

/**
 * The `application` object POSTed to the worker — same shape the site's
 * wizard sends (field names are the shared contract; see wizardSchema).
 */
export function buildApplicationPayload(
  values: WizardValues,
  verdict: FitVerdict,
): Record<string, unknown> {
  const painPointLabels = values.painPoints
    .map((id) => PAIN_POINTS.find((p) => p.id === id)?.label)
    .filter(Boolean);
  const painServices = [
    ...new Set(
      values.painPoints
        .map((id) => PAIN_POINTS.find((p) => p.id === id)?.svc)
        .filter(Boolean),
    ),
  ];
  return {
    contact: values.contact,
    email: values.email,
    phone: values.phone,
    business: values.business,
    placeId: values.placeId,
    placeAddress: values.placeAddress,
    placeSession: values.placeSession,
    trade: values.trade,
    yearsInBusiness: values.yearsInBusiness,
    licensedInsured: values.licensedInsured,
    serviceArea: values.serviceArea,
    webLink: values.webLink,
    // Site parity: checkbox serialises as "yes" or empty string.
    noWebsite: values.noWebsite ? "yes" : "",
    leadSource: values.leadSource,
    biggestChallenge: values.biggestChallenge,
    reviewsRange: values.reviewsRange,
    painPoints: values.painPoints,
    painPointLabels,
    painServices,
    wantHelp: values.wantHelp,
    instantDecision: verdict.outcome,
    recommendedLevel: verdict.recommendedLevel,
    googleRating: verdict.rating,
    googleReviewCount: verdict.reviewCount,
    verifiedPlaceId: verdict.place?.placeId || values.placeId || "",
    verifiedName: verdict.place?.name || "",
    tradeRecognized: tradeRecognized(values.trade),
    verifyOffline: verdict.offline,
  };
}

/**
 * Fire-and-forget, site parity: the instant decision is already on screen;
 * a failed submit is logged upstream but never surfaces to the applicant.
 */
export async function submitApplication(
  values: WizardValues,
  verdict: FitVerdict,
): Promise<void> {
  try {
    await invokeWizard({
      action: "submit",
      application: buildApplicationPayload(values, verdict),
    });
  } catch {
    // Instant response already shown — swallow by design.
  }
}

/** Personalised welcome-page link (only public fields in the URL — no
 * email, phone, or name; site parity). */
export function buildJoinUrl(
  values: WizardValues,
  verdict: FitVerdict,
): string {
  const q = new URLSearchParams({
    business: verdict.place?.name || values.business || "",
    trade: values.trade || "",
    rating: verdict.rating != null ? String(verdict.rating) : "",
    reviews: verdict.reviewCount != null ? String(verdict.reviewCount) : "",
    outcome: verdict.outcome,
    level: verdict.recommendedLevel,
  });
  return `${SITE_BASE}/join?${q.toString()}`;
}

export const HELP_URL = `${SITE_BASE}/how-we-can-help`;
