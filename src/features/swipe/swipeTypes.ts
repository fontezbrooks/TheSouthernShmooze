/**
 * "The Shmoozer" view-models + mappers. V1 matches a Seeker keyword against listing text
 * with a PURE confidence score (see migration 0016 / docs/the-shmoozer). The deck row is a
 * superset of the directory app-view row, so a card reuses the shared `toBusiness` mapper.
 */
import {
  toBusiness,
  type DirectoryBusiness,
} from "@/features/providers/providerTypes";
import type { DirectoryBusinessRow } from "@/lib/database";

export type BudgetBand = "lt_1000" | "1000_5000" | "gt_5000";
export type Timing = "asap" | "this_week" | "flexible";
export type LeadStatus = "sent" | "confirmed" | "closed";

/** The need a Seeker states once per session; attached to every lead it produces. */
export interface SwipeTask {
  keyword: string;
  originLat: number | null;
  originLng: number | null;
  radiusKm: number;
  budget: BudgetBand | null;
  timing: Timing | null;
}

/** Contact captured once on the first right-swipe (no account). */
export interface SeekerContact {
  name: string;
  email: string;
  phone: string | null;
  verified: boolean;
}

/** A swipe-deck card: a directory business + match metadata. */
export interface DeckCard extends DirectoryBusiness {
  /** Pure match confidence 0–100 ("87% match"). */
  confidence: number;
  /** Haversine km from the task origin; null when coordinates are missing. */
  distanceKm: number | null;
  /** Paid placement → labeled "Featured" slot (still shows true confidence). */
  isFeatured: boolean;
  /** Keyword terms that drove the match (for a lightweight "why"). */
  matchedTerms: string[];
}

/** Row shape returned by the `directory_swipe_deck` RPC (app-view columns + extras). */
export interface SwipeDeckRow extends DirectoryBusinessRow {
  confidence: number;
  distance_km: number | null;
  is_featured: boolean;
  matched_terms: string[] | null;
}

export function toDeckCard(row: SwipeDeckRow): DeckCard {
  return {
    ...toBusiness(row),
    confidence: row.confidence,
    distanceKm: row.distance_km,
    isFeatured: row.is_featured,
    matchedTerms: row.matched_terms ?? [],
  };
}

/** A lead the Seeker has sent (Matches screen). */
export interface SwipeMatch {
  businessUid: string;
  name: string;
  logoUrl: string | null;
  confidence: number;
  status: LeadStatus;
  createdAt: string;
}

/** Row shape returned by the `get_my_swipe_leads` RPC. */
export interface MyLeadRow {
  business_uid: string;
  name: string | null;
  logo_url: string | null;
  confidence: number;
  status: LeadStatus;
  created_at: string;
}

export function toMatch(row: MyLeadRow): SwipeMatch {
  return {
    businessUid: row.business_uid,
    name: row.name ?? "This business",
    logoUrl: row.logo_url,
    confidence: row.confidence,
    status: row.status,
    createdAt: row.created_at,
  };
}
