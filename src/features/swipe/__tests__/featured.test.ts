import { interleaveFeatured, orderDeck } from "../featured";
import type { DeckCard } from "../swipeTypes";

function card(id: string, isFeatured = false): DeckCard {
	return {
		confidence: 50,
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

describe("interleaveFeatured", () => {
	it("returns a copy and preserves order when there are no featured cards", () => {
		const input = [card("a"), card("b"), card("c")];
		const out = interleaveFeatured(input);
		expect(out.map((c) => c.id)).toEqual(["a", "b", "c"]);
		expect(out).not.toBe(input);
	});

	it("places a featured card in slot 0 and every Nth position", () => {
		const cards = [
			card("o1"),
			card("o2"),
			card("o3"),
			card("o4"),
			card("o5"),
			card("o6"),
			card("f1", true),
			card("f2", true),
		];
		const out = interleaveFeatured(cards, 5).map((c) => c.id);
		// slot 0 and slot 5 are featured; organic fill the gaps in order
		expect(out[0]).toBe("f1");
		expect(out[5]).toBe("f2");
		expect(out.slice(1, 5)).toEqual(["o1", "o2", "o3", "o4"]);
	});

	it("appends leftover featured when organic runs out", () => {
		const out = interleaveFeatured(
			[card("o1"), card("f1", true), card("f2", true), card("f3", true)],
			5
		).map((c) => c.id);
		expect(out[0]).toBe("f1");
		expect(out).toContain("f2");
		expect(out).toContain("f3");
		expect(out).toHaveLength(4);
	});

	it("never mutates the input array", () => {
		const input = [card("o1"), card("f1", true)];
		const snapshot = input.map((c) => c.id);
		interleaveFeatured(input);
		expect(input.map((c) => c.id)).toEqual(snapshot);
	});
});

describe("orderDeck (design.md §E4 ordering hook)", () => {
	it("applies the current heuristic (featured interleave) without mutating", () => {
		const input = [card("o1"), card("o2"), card("f1", true)];
		const out = orderDeck(input);
		expect(out.map((c) => c.id)).toEqual(
			interleaveFeatured(input).map((c) => c.id)
		);
		expect(out).not.toBe(input);
	});
});
