import { type SwipeDeckRow, toDeckCard } from "../swipeTypes";

function deckRow(over: Partial<SwipeDeckRow> = {}): SwipeDeckRow {
	return {
		confidence: 87,
		created_at: "",
		description: "We mow",
		distance_km: 4.2,
		has_coupon: true,
		id: "id",
		is_certified: true,
		is_featured: true,
		latitude: 33.7,
		logo_url: "http://logo",
		longitude: -84.3,
		matched_terms: ["landscaping"],
		name: "Grantlanta Lawn",
		phone_numbers: [
			{ normalized_phone_number: "6787904781", phone_number: "678-790-4781" },
		],
		recommended_score: 5,
		source_uid: "uid",
		updated_at: "",
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
		expect(toDeckCard(deckRow({ matched_terms: null })).matchedTerms).toEqual(
			[]
		);
	});
});
