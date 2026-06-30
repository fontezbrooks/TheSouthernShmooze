import { interleaveFeatured } from "../featured";
import type { DeckCard } from "../swipeTypes";

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
    confidence: 50,
    distanceKm: null,
    isFeatured,
    matchedTerms: [],
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
      5,
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
