import { getSupabase } from "@/lib/supabase";
import { ok, err, type Result } from "@/lib/result";
import type { DirectoryBusinessRow } from "@/lib/database";
import {
  toBusiness,
  type DirectoryBusiness,
} from "@/features/providers/providerTypes";

const VIEW = "directory_businesses_app_view";
/** `directory_search` caps at 50; mirror that here. */
const SEARCH_LIMIT = 50;
/** Always hoisted to the top of the browse list (in this order); NOT applied to search. */
const PINNED_NAMES = ["Grantlanta Lawn", "Peace of Mind Recycling"] as const;

/**
 * Data access for the Directory screen. `browseAll` lists every business
 * certified-first (the default browse view); `search` runs the typo-tolerant,
 * certified-first `directory_search` RPC. Both return the app-view shape, mapped
 * to the shared `DirectoryBusiness` view-model. Result-based (no throws).
 */
export interface DirectoryRepository {
  browseAll(): Promise<Result<DirectoryBusiness[]>>;
  search(query: string): Promise<Result<DirectoryBusiness[]>>;
}

/** Hoist the pinned providers (in PINNED_NAMES order) above the rest; immutable. */
function pinToTop(items: DirectoryBusiness[]): DirectoryBusiness[] {
  const pinned = PINNED_NAMES.map((name) =>
    items.find((b) => b.name === name),
  ).filter((b): b is DirectoryBusiness => b !== undefined);
  if (pinned.length === 0) return items;
  const pinnedNames = new Set<string>(PINNED_NAMES);
  return [...pinned, ...items.filter((b) => !pinnedNames.has(b.name))];
}

export const directoryRepository: DirectoryRepository = {
  async browseAll() {
    try {
      const { data, error } = await getSupabase()
        .from(VIEW)
        .select("*")
        .order("is_certified", { ascending: false })
        // nulls last (matches the directory_search RPC) so unscored businesses
        // don't sort ahead of recommended ones.
        .order("recommended_score", { ascending: false, nullsFirst: false })
        .order("name", { ascending: true });

      if (error) return err("We couldn’t load the registry right now.");
      const rows = (data ?? []) as DirectoryBusinessRow[];
      return ok(pinToTop(rows.map(toBusiness)));
    } catch {
      return err("Network error loading the registry.");
    }
  },

  async search(query) {
    try {
      const { data, error } = await getSupabase().rpc("directory_search", {
        q: query,
        lim: SEARCH_LIMIT,
      });

      if (error) return err("We couldn’t run that search right now.");
      // The RPC returns the app-view columns (plus an ignored `rank`).
      const rows = (data ?? []) as DirectoryBusinessRow[];
      return ok(rows.map(toBusiness));
    } catch {
      return err("Network error running search.");
    }
  },
};
