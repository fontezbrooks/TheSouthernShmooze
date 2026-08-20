import type { DirectoryBusinessDetailRow } from "@/lib/database";
import { err, ok, type Result } from "@/lib/result";
import { getSupabase } from "@/lib/supabase";
import { type BusinessDetail, toDetail } from "./businessDetailTypes";

const VIEW = "directory_business_detail_view";

/**
 * Data access for the business-detail screen. Reads one row of
 * `directory_business_detail_view` (business + ingested profile + phones) by
 * source_uid. `ok(null)` means the uid wasn't found. Result-based (no throws).
 */
export interface BusinessDetailRepository {
	fetchByUid(sourceUid: string): Promise<Result<BusinessDetail | null>>;
}

export const businessDetailRepository: BusinessDetailRepository = {
	async fetchByUid(sourceUid) {
		try {
			const { data, error } = await getSupabase()
				.from(VIEW)
				.select("*")
				.eq("source_uid", sourceUid)
				.maybeSingle();

			if (error) {
				return err("We couldn’t load this business right now.");
			}
			if (!data) {
				return ok(null);
			}
			return ok(toDetail(data as DirectoryBusinessDetailRow));
		} catch {
			return err("Network error loading this business.");
		}
	},
};
