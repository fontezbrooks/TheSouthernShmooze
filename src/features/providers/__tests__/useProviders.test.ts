import { renderHook, act } from "@testing-library/react-native";
import { useProviders } from "../useProviders";
import { PAGE_SIZE, type ProviderRepository } from "../providerRepository";
import type { DirectoryBusiness } from "../providerTypes";

const biz = (id: string): DirectoryBusiness => ({
  id,
  sourceUid: id,
  name: id,
  tagline: "",
  logoUrl: null,
  phone: null,
  phoneDisplay: null,
  hasCoupon: false,
  isCertified: true,
  recommended: false,
  latitude: null,
  longitude: null,
});

const page = (prefix: string, size = PAGE_SIZE): DirectoryBusiness[] =>
  Array.from({ length: size }, (_, i) => biz(`${prefix}-${i + 1}`));

function makeRepo(over: Partial<ProviderRepository> = {}): ProviderRepository {
  return {
    fetchPinned: jest
      .fn()
      .mockResolvedValue({ ok: true, data: page("pinned", 3) }),
    fetchMore: jest.fn().mockResolvedValue({ ok: true, data: page("more") }),
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
      .mockResolvedValueOnce({ ok: false, error: "boom" })
      .mockResolvedValueOnce({ ok: true, data: page("more") });
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
      fetchMore: jest.fn().mockResolvedValue({ ok: true, data: page("more", 2) }),
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
