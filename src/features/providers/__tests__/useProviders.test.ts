import { act, renderHook } from "@testing-library/react-native";
import { PAGE_SIZE, type ProviderRepository } from "../providerRepository";
import type { DirectoryBusiness } from "../providerTypes";
import { useProviders } from "../useProviders";

const biz = (id: string): DirectoryBusiness => ({
	hasCoupon: false,
	id,
	isCertified: true,
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

const page = (prefix: string, size = PAGE_SIZE): DirectoryBusiness[] =>
	Array.from({ length: size }, (_, i) => biz(`${prefix}-${i + 1}`));

function makeRepo(over: Partial<ProviderRepository> = {}): ProviderRepository {
	return {
		fetchMore: jest.fn().mockResolvedValue({ data: page("more"), ok: true }),
		fetchPinned: jest
			.fn()
			.mockResolvedValue({ data: page("pinned", 3), ok: true }),
		...over,
	};
}

/** Let the pending repo promise resolve and state settle. */
async function flush() {
	await act(async () => {
		await new Promise((r) => setTimeout(r, 0));
	});
}

describe("useProviders", () => {
	it("loads the pinned providers on mount", async () => {
		const repo = makeRepo();
		const { result } = await renderHook(() => useProviders(repo));
		await flush();

		expect(result.current.pinned).toHaveLength(3);
		expect(result.current.loading).toBe(false);
	});

	it("appends a page and advances the offset on loadMore", async () => {
		const repo = makeRepo();
		const { result } = await renderHook(() => useProviders(repo));
		await flush();

		await act(async () => result.current.loadMore());
		await flush();

		expect(repo.fetchMore).toHaveBeenCalledWith(0);
		expect(result.current.more).toHaveLength(PAGE_SIZE);

		await act(async () => result.current.loadMore());
		await flush();

		expect(repo.fetchMore).toHaveBeenLastCalledWith(PAGE_SIZE);
	});

	it("fetches only once when loadMore fires twice before state updates", async () => {
		const repo = makeRepo();
		const { result } = await renderHook(() => useProviders(repo));
		await flush();

		// Simulates FlatList onEndReached re-firing during momentum, before the
		// loadingMore render lands — both calls see the same stale state.
		await act(async () => {
			result.current.loadMore();
			result.current.loadMore();
		});
		await flush();

		expect(repo.fetchMore).toHaveBeenCalledTimes(1);
		expect(result.current.more).toHaveLength(PAGE_SIZE);
	});

	it("surfaces a page error and allows a retry", async () => {
		const fetchMore = jest
			.fn()
			.mockResolvedValueOnce({ error: "boom", ok: false })
			.mockResolvedValueOnce({ data: page("more"), ok: true });
		const repo = makeRepo({ fetchMore });
		const { result } = await renderHook(() => useProviders(repo));
		await flush();

		await act(async () => result.current.loadMore());
		await flush();
		expect(result.current.error).toBe("boom");

		await act(async () => result.current.loadMore());
		await flush();

		expect(fetchMore).toHaveBeenCalledTimes(2);
		expect(result.current.more).toHaveLength(PAGE_SIZE);
		expect(result.current.error).toBeNull();
	});

	it("stops paging after a short page (no more data)", async () => {
		const repo = makeRepo({
			fetchMore: jest
				.fn()
				.mockResolvedValue({ data: page("more", 2), ok: true }),
		});
		const { result } = await renderHook(() => useProviders(repo));
		await flush();

		await act(async () => result.current.loadMore());
		await flush();
		expect(result.current.hasMore).toBe(false);

		await act(async () => result.current.loadMore());
		await flush();

		expect(repo.fetchMore).toHaveBeenCalledTimes(1);
	});
});
