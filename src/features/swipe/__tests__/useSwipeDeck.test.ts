import { act, renderHook } from "@testing-library/react-native";
import type { SwipeRepository } from "../swipeRepository";
import type { DeckCard, SwipeTask } from "../swipeTypes";
import { useSwipeDeck } from "../useSwipeDeck";

const task: SwipeTask = {
	budget: null,
	keyword: "roofing",
	originLat: null,
	originLng: null,
	radiusKm: 25,
	timing: null,
};

function card(id: string, isFeatured = false): DeckCard {
	return {
		confidence: 70,
		distanceKm: null,
		hasCoupon: false,
		id,
		isCertified: false,
		isFeatured,
		latitude: null,
		logoUrl: null,
		longitude: null,
		matchedTerms: [],
		name: id,
		phone: null,
		phoneDisplay: null,
		recommended: false,
		sourceUid: id,
		tagline: "",
	};
}

function makeRepo(over: Partial<SwipeRepository> = {}): SwipeRepository {
	return {
		createTask: jest.fn().mockResolvedValue({ data: "task-1", ok: true }),
		fetchDeck: jest
			.fn()
			.mockResolvedValue({ data: [card("a"), card("b")], ok: true }),
		saveContact: jest.fn(),
		submitLead: jest.fn(),
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

	it("mirrors the engine index, then reports exhausted, not empty (ST6)", async () => {
		const { result } = await render(task, makeRepo());
		await flush();
		// The engine advances itself; the hook only mirrors the index it reports.
		expect(result.current.cards.map((c) => c.id)).toEqual(["a", "b"]);
		await act(async () => result.current.setIndex(1));
		expect(result.current.current?.id).toBe("b");
		expect(result.current.cards).toHaveLength(2); // full deck stays intact
		expect(result.current.exhausted).toBe(false);
		await act(async () => result.current.setIndex(2));
		expect(result.current.current).toBeNull();
		expect(result.current.exhausted).toBe(true);
		expect(result.current.empty).toBe(false);
	});

	it("resets the mirrored index when a new task loads", async () => {
		const repo = makeRepo();
		const { result, rerender } = await renderHook(
			({ t }: { t: SwipeTask | null }) => useSwipeDeck(t, "sess", repo),
			{ initialProps: { t: task } }
		);
		await flush();
		await act(async () => result.current.setIndex(2));
		expect(result.current.exhausted).toBe(true);

		const nextTask = { ...task, keyword: "gutters" };
		await act(async () => rerender({ t: nextTask }));
		await flush();
		expect(result.current.current?.id).toBe("a");
		expect(result.current.exhausted).toBe(false);
	});

	it("reports empty when the deck loads zero cards (ST5)", async () => {
		const { result } = await render(task, {
			...makeRepo(),
			fetchDeck: jest.fn().mockResolvedValue({ data: [], ok: true }),
		});
		await flush();
		expect(result.current.empty).toBe(true);
		expect(result.current.exhausted).toBe(false);
	});

	it("stays idle with no task", async () => {
		const repo = makeRepo();
		const { result } = await render(null, repo);
		await flush();
		expect(repo.createTask).not.toHaveBeenCalled();
		expect(result.current.current).toBeNull();
		expect(result.current.empty).toBe(false);
		expect(result.current.exhausted).toBe(false);
	});

	it("surfaces a deck fetch error", async () => {
		const { result } = await render(task, {
			...makeRepo(),
			fetchDeck: jest.fn().mockResolvedValue({ error: "boom", ok: false }),
		});
		await flush();
		expect(result.current.error).toBe("boom");
		expect(result.current.empty).toBe(false);
	});
});
