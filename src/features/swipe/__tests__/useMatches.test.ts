import { renderHook, waitFor } from "@testing-library/react-native";
import { useMatches } from "../useMatches";
import type { SwipeRepository } from "../swipeRepository";
import type { SwipeMatch } from "../swipeTypes";

const match: SwipeMatch = {
  businessUid: "u1",
  name: "Roof Co",
  logoUrl: null,
  confidence: 80,
  status: "sent",
  createdAt: "2026-06-30",
};

function makeRepo(over: Partial<SwipeRepository> = {}): SwipeRepository {
  return {
    createTask: jest.fn(),
    fetchDeck: jest.fn(),
    requestVerification: jest.fn(),
    confirmVerification: jest.fn(),
    submitLead: jest.fn(),
    fetchMatches: jest.fn().mockResolvedValue({ ok: true, data: [match] }),
    ...over,
  };
}

describe("useMatches", () => {
  it("loads matches on mount", async () => {
    const repo = makeRepo();
    const { result } = await renderHook(() => useMatches("sess", repo));
    await waitFor(() => expect(result.current.matches).toEqual([match]));
    expect(repo.fetchMatches).toHaveBeenCalledWith("sess");
    expect(result.current.loading).toBe(false);
  });

  it("exposes an error and keeps matches empty", async () => {
    const repo = makeRepo({
      fetchMatches: jest.fn().mockResolvedValue({ ok: false, error: "down" }),
    });
    const { result } = await renderHook(() => useMatches("sess", repo));
    await waitFor(() => expect(result.current.error).toBe("down"));
    expect(result.current.matches).toEqual([]);
  });

  it("does not fetch without a session token", async () => {
    const repo = makeRepo();
    const { result } = await renderHook(() => useMatches("", repo));
    await waitFor(() => expect(result.current.loading).toBe(true));
    expect(repo.fetchMatches).not.toHaveBeenCalled();
  });
});
