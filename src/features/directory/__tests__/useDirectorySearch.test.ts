import { renderHook, act } from "@testing-library/react-native";
import { useDirectorySearch } from "../useDirectorySearch";
import type { DirectoryRepository } from "../directoryRepository";
import type { DirectoryBusiness } from "@/features/providers/providerTypes";

const biz = (id: string): DirectoryBusiness => ({
  id,
  sourceUid: id,
  name: id,
  tagline: "",
  logoUrl: null,
  phone: null,
  phoneDisplay: null,
  hasCoupon: false,
  isCertified: false,
  recommended: false,
  latitude: null,
  longitude: null,
});

function makeRepo(
  over: Partial<DirectoryRepository> = {},
): DirectoryRepository {
  return {
    browseAll: jest
      .fn()
      .mockResolvedValue({ ok: true, data: [biz("a"), biz("b")] }),
    search: jest.fn().mockResolvedValue({ ok: true, data: [biz("hit")] }),
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
      search: jest.fn().mockResolvedValue({ ok: true, data: [] }),
    });
    const { result } = await render(repo);
    await flush();
    await act(async () => result.current.setQuery("zzzz"));
    await flush();
    expect(result.current.mode).toBe("no-results");
  });

  it("surfaces a search failure instead of reporting no-results", async () => {
    const repo = makeRepo({
      search: jest.fn().mockResolvedValue({ ok: false, error: "outage" }),
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
