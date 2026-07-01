/**
 * Data access for "The Shmoozer". Every method wraps a SECURITY DEFINER RPC (migration
 * 0016) and returns a `Result` — no exceptions escape. Mirrors `directoryRepository`.
 */
import { getSupabase } from "@/lib/supabase";
import { ok, err, type Result } from "@/lib/result";
import {
  toDeckCard,
  toMatch,
  type DeckCard,
  type MyLeadRow,
  type SeekerContact,
  type SwipeDeckRow,
  type SwipeMatch,
  type SwipeTask,
} from "./swipeTypes";

const DECK_LIMIT = 30;
const MIN_CONFIDENCE = 30;

export type SubmitOutcome = "ok" | "duplicate";

export interface SwipeRepository {
  createTask(task: SwipeTask, sessionToken: string): Promise<Result<string>>;
  fetchDeck(
    task: SwipeTask,
    sessionToken: string,
    excludeUids: string[],
  ): Promise<Result<DeckCard[]>>;
  requestVerification(
    sessionToken: string,
    contact: Pick<SeekerContact, "name" | "email" | "phone">,
  ): Promise<Result<void>>;
  confirmVerification(
    sessionToken: string,
    code: string,
  ): Promise<Result<void>>;
  submitLead(
    sessionToken: string,
    taskId: string,
    businessUid: string,
    confidence: number,
  ): Promise<Result<SubmitOutcome>>;
  fetchMatches(sessionToken: string): Promise<Result<SwipeMatch[]>>;
}

/** Read `{ status, reason }` from an RPC jsonb result. */
function readStatus(data: unknown): { status?: string; reason?: string } {
  return (data ?? {}) as { status?: string; reason?: string };
}

export const swipeRepository: SwipeRepository = {
  async createTask(task, sessionToken) {
    try {
      const { data, error } = await getSupabase().rpc("create_swipe_task", {
        p_session_token: sessionToken,
        p_keyword: task.keyword,
        p_lat: task.originLat,
        p_lng: task.originLng,
        p_radius_km: task.radiusKm,
        p_budget: task.budget,
        p_timing: task.timing,
      });
      if (error || !data) return err("We couldn’t start your search right now.");
      return ok(data as string);
    } catch {
      return err("Network error starting your search.");
    }
  },

  async fetchDeck(task, sessionToken, excludeUids) {
    try {
      const { data, error } = await getSupabase().rpc("directory_swipe_deck", {
        p_keyword: task.keyword,
        p_lat: task.originLat,
        p_lng: task.originLng,
        p_radius_km: task.radiusKm,
        p_budget: task.budget,
        p_session_token: sessionToken,
        p_exclude: excludeUids.length > 0 ? excludeUids : null,
        p_min_confidence: MIN_CONFIDENCE,
        p_limit: DECK_LIMIT,
      });
      if (error) return err("We couldn’t load matches right now.");
      const rows = (data ?? []) as SwipeDeckRow[];
      return ok(rows.map(toDeckCard));
    } catch {
      return err("Network error loading matches.");
    }
  },

  async requestVerification(sessionToken, contact) {
    try {
      const { data, error } = await getSupabase().rpc(
        "request_contact_verification",
        {
          p_session_token: sessionToken,
          p_name: contact.name,
          p_email: contact.email,
          p_phone: contact.phone,
        },
      );
      if (error) return err("We couldn’t send your code right now.");
      const { status, reason } = readStatus(data);
      if (status === "sent") return ok(undefined);
      return err(reason ?? "We couldn’t send your code.");
    } catch {
      return err("Network error sending your code.");
    }
  },

  async confirmVerification(sessionToken, code) {
    try {
      const { data, error } = await getSupabase().rpc(
        "confirm_contact_verification",
        { p_session_token: sessionToken, p_code: code },
      );
      if (error) return err("We couldn’t verify that code right now.");
      const { status, reason } = readStatus(data);
      if (status === "verified") return ok(undefined);
      return err(reason ?? "That code didn’t work.");
    } catch {
      return err("Network error verifying your code.");
    }
  },

  async submitLead(sessionToken, taskId, businessUid, confidence) {
    try {
      const { data, error } = await getSupabase().rpc("submit_swipe_lead", {
        p_session_token: sessionToken,
        p_task_id: taskId,
        p_business_uid: businessUid,
        p_confidence: confidence,
      });
      if (error) return err("We couldn’t send that match right now.");
      const { status, reason } = readStatus(data);
      if (status === "ok") return ok("ok");
      if (status === "duplicate") return ok("duplicate");
      return err(reason ?? "We couldn’t send that match.");
    } catch {
      return err("Network error sending that match.");
    }
  },

  async fetchMatches(sessionToken) {
    try {
      const { data, error } = await getSupabase().rpc("get_my_swipe_leads", {
        p_session_token: sessionToken,
      });
      if (error) return err("We couldn’t load your matches right now.");
      const rows = (data ?? []) as MyLeadRow[];
      return ok(rows.map(toMatch));
    } catch {
      return err("Network error loading your matches.");
    }
  },
};
