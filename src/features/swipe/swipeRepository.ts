/**
 * Data access for "The Shmoozer". Every method wraps a SECURITY DEFINER RPC (migration
 * 0016) and returns a `Result` — no exceptions escape. Mirrors `directoryRepository`.
 */

import { err, ok, type Result } from "@/lib/result";
import { getSupabase } from "@/lib/supabase";
import {
	type BudgetBand,
	type DeckCard,
	type SwipeDeckRow,
	type SwipeTask,
	toDeckCard,
} from "./swipeTypes";

/** Contact + task context captured by the first-Match form. */
export interface SwipeContactInput {
	budget: BudgetBand | null;
	details: string | null;
	email: string;
	name: string;
	phone: string | null;
}

const DECK_LIMIT = 30;
const MIN_CONFIDENCE = 30;

export type SubmitOutcome = "ok" | "duplicate";

export interface SwipeRepository {
	createTask(task: SwipeTask, sessionToken: string): Promise<Result<string>>;
	fetchDeck(
		task: SwipeTask,
		sessionToken: string,
		excludeUids: string[]
	): Promise<Result<DeckCard[]>>;
	saveContact(
		sessionToken: string,
		taskId: string | null,
		contact: SwipeContactInput
	): Promise<Result<void>>;
	submitLead(
		sessionToken: string,
		taskId: string,
		businessUid: string,
		confidence: number
	): Promise<Result<SubmitOutcome>>;
}

/** Read `{ status, reason }` from an RPC jsonb result. */
function readStatus(data: unknown): { status?: string; reason?: string } {
	return (data ?? {}) as { status?: string; reason?: string };
}

export const swipeRepository: SwipeRepository = {
	async createTask(task, sessionToken) {
		try {
			const { data, error } = await getSupabase().rpc("create_swipe_task", {
				p_budget: task.budget,
				p_keyword: task.keyword,
				p_lat: task.originLat,
				p_lng: task.originLng,
				p_radius_km: task.radiusKm,
				p_session_token: sessionToken,
				p_timing: task.timing,
			});
			if (error || !data) {
				return err("We couldn’t start your search right now.");
			}
			return ok(data as string);
		} catch {
			return err("Network error starting your search.");
		}
	},

	async fetchDeck(task, sessionToken, excludeUids) {
		try {
			const { data, error } = await getSupabase().rpc("directory_swipe_deck", {
				p_budget: task.budget,
				p_exclude: excludeUids.length > 0 ? excludeUids : null,
				p_keyword: task.keyword,
				p_lat: task.originLat,
				p_limit: DECK_LIMIT,
				p_lng: task.originLng,
				p_min_confidence: MIN_CONFIDENCE,
				p_radius_km: task.radiusKm,
				p_session_token: sessionToken,
			});
			if (error) {
				return err("We couldn’t load matches right now.");
			}
			const rows = (data ?? []) as SwipeDeckRow[];
			return ok(rows.map(toDeckCard));
		} catch {
			return err("Network error loading matches.");
		}
	},

	async saveContact(sessionToken, taskId, contact) {
		try {
			const { data, error } = await getSupabase().rpc("save_swipe_contact", {
				p_budget: contact.budget,
				p_details: contact.details,
				p_email: contact.email,
				p_name: contact.name,
				p_phone: contact.phone,
				p_session_token: sessionToken,
				p_task_id: taskId,
			});
			if (error) {
				return err("We couldn’t save your details right now.");
			}
			const { status, reason } = readStatus(data);
			if (status === "ok") {
				return ok(undefined);
			}
			return err(reason ?? "We couldn’t save your details.");
		} catch {
			return err("Network error saving your details.");
		}
	},

	async submitLead(sessionToken, taskId, businessUid, confidence) {
		try {
			const { data, error } = await getSupabase().rpc("submit_swipe_lead", {
				p_business_uid: businessUid,
				p_confidence: confidence,
				p_session_token: sessionToken,
				p_task_id: taskId,
			});
			if (error) {
				return err("We couldn’t send that match right now.");
			}
			const { status, reason } = readStatus(data);
			if (status === "ok") {
				return ok("ok");
			}
			if (status === "duplicate") {
				return ok("duplicate");
			}
			return err(reason ?? "We couldn’t send that match.");
		} catch {
			return err("Network error sending that match.");
		}
	},
};
