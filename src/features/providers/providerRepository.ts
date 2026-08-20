import type { DirectoryBusinessRow } from "@/lib/database";
import { err, ok, type Result } from "@/lib/result";
import { getSupabase } from "@/lib/supabase";
import { type DirectoryBusiness, toBusiness } from "./providerTypes";

const VIEW = "directory_businesses_app_view";

/** The three guaranteed providers, in canonical display order. */
export const PINNED_NAMES = [
	"Grantlanta Lawn",
	"Peace of Mind Recycling",
	"SLAM Plumbing",
] as const;

/** Page size for "See More" (and the pinned count). */
export const PAGE_SIZE = 5;

/** A Postgres `in` list literal, e.g. `("a","b")` with embedded quotes escaped. */
function inList(values: readonly string[]): string {
	return `(${values.map((v) => `"${v.replace(/"/g, '""')}"`).join(",")})`;
}

/**
 * Data access for Certified Providers. Pinned three are fetched by name and
 * re-sorted to canonical order (always on top); "See More" pages the remainder
 * deterministically certified-first: is_certified DESC, recommended_score DESC,
 * name ASC. All methods return a Result (no throws).
 */
export interface ProviderRepository {
	fetchMore(offset: number): Promise<Result<DirectoryBusiness[]>>;
	fetchPinned(): Promise<Result<DirectoryBusiness[]>>;
}

export const providerRepository: ProviderRepository = {
	async fetchMore(offset) {
		try {
			const { data, error } = await getSupabase()
				.from(VIEW)
				.select("*")
				.not("name", "in", inList(PINNED_NAMES))
				.order("is_certified", { ascending: false })
				.order("recommended_score", { ascending: false })
				.order("name", { ascending: true })
				.range(offset, offset + PAGE_SIZE - 1);

			if (error) {
				return err("We could not load more providers.");
			}

			const rows = (data ?? []) as DirectoryBusinessRow[];
			return ok(rows.map(toBusiness));
		} catch {
			return err("Network error loading more providers.");
		}
	},
	async fetchPinned() {
		try {
			const { data, error } = await getSupabase()
				.from(VIEW)
				.select("*")
				.in("name", PINNED_NAMES as unknown as string[]);

			if (error) {
				return err("We could not load providers right now.");
			}

			const rows = (data ?? []) as DirectoryBusinessRow[];
			const order = new Map<string, number>(PINNED_NAMES.map((n, i) => [n, i]));
			const sorted = [...rows].sort(
				(a, b) => (order.get(a.name) ?? 99) - (order.get(b.name) ?? 99)
			);
			return ok(sorted.map(toBusiness));
		} catch {
			return err("Network error loading providers.");
		}
	},
};
