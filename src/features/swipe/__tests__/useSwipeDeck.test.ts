import { renderHook, act } from "@testing-library/react-native";
import { useSwipeDeck } from "../useSwipeDeck";
import type { SwipeRepository } from "../swipeRepository";
import type { DeckCard, SwipeTask } from "../swipeTypes";

const task: SwipeTask = {
  keyword: "roofing",
  originLat: null,
  originLng: null,
  radiusKm: 25,
  budget: null,
  timing: null,
};

function card(id: string, isFeatured = false): DeckCard {
  return {
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
    confidence: 70,
    distanceKm: null,
    isFeatured,
    matchedTerms: [],
  };
}

function makeRepo(over: Partial<SwipeRepository> = {}): SwipeRepository {
  return {
    createTask: jest.fn().mockResolvedValue({ ok: true, data: "task-1" }),
    fetchDeck: jest
      .fn()
      .mockResolvedValue({ ok: true, data: [card("a"), card("b")] }),
    requestVerification: jest.fn(),
    confirmVerification: jest.fn(),
    submitLead: jest.fn(),
    fetchMatches: jest.fn(),
    ...over,
  };
}

const render = (t: SwipeTask | null, repo: SwipeRepository) =>
  renderHook(() => useSwipeDeck(t, "sess", repo));

/** Flush createTask → fetchDeck → state settles (two awaited repo calls). */
async function flush() {
  await act(async () => {
    await new Promise((r) => setTimeout(r, 0));
    await new Promise((r) => setTimeout(r, 0));
  });
}

describe("useSwipeDeck", () => {
  it("registers the task and loads the deck", async () => {
    const repo = makeRepo();
    const { result } = await render(task, repo);
    await flush();
    expect(repo.createTask).toHaveBeenCalledWith(task, "sess");
    expect(result.current.taskId).toBe("task-1");
    expect(result.current.current?.id).toBe("a");
    expect(result.current.loading).toBe(false);
  });

  it("advances through cards then reports empty", async () => {
    const { result } = await render(task, makeRepo());
    await flush();
    await act(async () => result.current.advance());
    expect(result.current.current?.id).toBe("b");
    await act(async () => result.current.advance());
    expect(result.current.current).toBeNull();
    expect(result.current.empty).toBe(true);
  });

  it("stays idle with no task", async () => {
    const repo = makeRepo();
    const { result } = await render(null, repo);
    await flush();
    expect(repo.createTask).not.toHaveBeenCalled();
    expect(result.current.current).toBeNull();
    expect(result.current.empty).toBe(false);
  });

  it("surfaces a deck fetch error", async () => {
    const { result } = await render(task, {
      ...makeRepo(),
      fetchDeck: jest.fn().mockResolvedValue({ ok: false, error: "boom" }),
    });
    await flush();
    expect(result.current.error).toBe("boom");
    expect(result.current.empty).toBe(false);
  });
});
