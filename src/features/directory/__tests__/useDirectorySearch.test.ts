import { act, renderHook } from "@testing-library/react-native";
import type { DirectoryBusiness } from "@/features/providers/providerTypes";
import type { DirectoryRepository } from "../directoryRepository";
import { useDirectorySearch } from "../useDirectorySearch";

const biz = (id: string): DirectoryBusiness => ({
	hasCoupon: false,
	id,
	isCertified: false,
	latitude: null,
	logoUrl: null,
	longitude: null,
	name: id,
	phone: null,
	phoneDisplay: null,
	recommended: false,
	sourceUid: id,
	tagline: "",
});

function makeRepo(
	over: Partial<DirectoryRepository> = {}
): DirectoryRepository {
	return {
		browseAll: jest
			.fn()
			.mockResolvedValue({ data: [biz("a"), biz("b")], ok: true }),
		search: jest.fn().mockResolvedValue({ data: [biz("hit")], ok: true }),
		...over,
	};
}

/** Render with a 0ms debounce so real timers settle synchronously-ish. */
const render = (repo: DirectoryRepository) =>
	renderHook(() => useDirectorySearch(repo, 0));

/** Flush the 0ms debounce timer + the chained async search/state updates. */
async function flush() {
	await act(async () => {
		await new Promise((r) => setTimeout(r, 0));
		await new Promise((r) => setTimeout(r, 0));
	});
}

describe("useDirectorySearch", () => {
	it("loads browse-all on mount", async () => {
		const { result } = await render(makeRepo());
		await flush();
		expect(result.current.mode).toBe("browse");
		expect(result.current.items.map((b) => b.id)).toEqual(["a", "b"]);
	});

	it("stays in browse for queries under 2 chars", async () => {
		const repo = makeRepo();
		const { result } = await render(repo);
		await flush();
		await act(async () => result.current.setQuery("l"));
		await flush();
		expect(result.current.mode).toBe("browse");
		expect(repo.search).not.toHaveBeenCalled();
	});

	it("shows results when a query matches", async () => {
		const repo = makeRepo();
		const { result } = await render(repo);
		await flush();
		await act(async () => result.current.setQuery("lawn"));
		await flush();
		expect(repo.search).toHaveBeenCalledWith("lawn");
		expect(result.current.mode).toBe("results");
		expect(result.current.items.map((b) => b.id)).toEqual(["hit"]);
	});

	it("shows no-results when a query matches nothing", async () => {
		const repo = makeRepo({
			search: jest.fn().mockResolvedValue({ data: [], ok: true }),
		});
		const { result } = await render(repo);
		await flush();
		await act(async () => result.current.setQuery("zzzz"));
		await flush();
		expect(result.current.mode).toBe("no-results");
	});

	it("surfaces a search failure instead of reporting no-results", async () => {
		const repo = makeRepo({
			search: jest.fn().mockResolvedValue({ error: "outage", ok: false }),
		});
		const { result } = await render(repo);
		await flush();
		await act(async () => result.current.setQuery("lawn"));
		await flush();
		expect(result.current.mode).not.toBe("no-results");
		expect(result.current.error).toBe("outage");
	});

	it("returns to browse after clearing the query", async () => {
		const repo = makeRepo();
		const { result } = await render(repo);
		await flush();
		await act(async () => result.current.setQuery("lawn"));
		await flush();
		expect(result.current.mode).toBe("results");
		await act(async () => result.current.clear());
		await flush();
		expect(result.current.mode).toBe("browse");
		expect(result.current.items.map((b) => b.id)).toEqual(["a", "b"]);
	});
});
