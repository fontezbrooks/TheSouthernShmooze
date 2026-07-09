import { toDeckCard, type SwipeDeckRow } from "../swipeTypes";

function deckRow(over: Partial<SwipeDeckRow> = {}): SwipeDeckRow {
  return {
    id: "id",
    source_uid: "uid",
    name: "Grantlanta Lawn",
    description: "We mow",
    logo_url: "http://logo",
    longitude: -84.3,
    latitude: 33.7,
    recommended_score: 5,
    has_coupon: true,
    is_certified: true,
    phone_numbers: [
      { phone_number: "678-790-4781", normalized_phone_number: "6787904781" },
    ],
    created_at: "",
    updated_at: "",
    confidence: 87,
    distance_km: 4.2,
    is_featured: true,
    matched_terms: ["landscaping"],
    ...over,
  };
}

describe("toDeckCard", () => {
  it("reuses toBusiness and attaches match metadata + geo", () => {
    const c = toDeckCard(deckRow());
    expect(c.name).toBe("Grantlanta Lawn");
    expect(c.isCertified).toBe(true);
    expect(c.phone).toBe("6787904781");
    expect(c.confidence).toBe(87);
    expect(c.distanceKm).toBe(4.2);
    expect(c.isFeatured).toBe(true);
    expect(c.matchedTerms).toEqual(["landscaping"]);
    expect(c.latitude).toBe(33.7);
    expect(c.longitude).toBe(-84.3);
  });

  it("defaults matched_terms null to an empty array", () => {
    expect(toDeckCard(deckRow({ matched_terms: null })).matchedTerms).toEqual([]);
  });
});
