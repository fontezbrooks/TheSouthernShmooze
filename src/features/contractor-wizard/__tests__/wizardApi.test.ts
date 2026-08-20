import {
	buildApplicationPayload,
	buildJoinUrl,
	type FitVerdict,
	fallbackVerdict,
	submitApplication,
	suggestPlaces,
	tradeRecognized,
	verifyFit,
} from "../wizardApi";
import type { WizardValues } from "../wizardSchema";

const mockInvoke = jest.fn();
jest.mock("@/lib/supabase", () => ({
	getSupabase: () => ({
		functions: { invoke: (...a: unknown[]) => mockInvoke(...a) },
	}),
}));

const values: WizardValues = {
	biggestChallenge: "Not enough leads",
	business: "Smith Plumbing",
	contact: "Jonah Smith",
	email: "jonah@example.com",
	leadSource: "Paid ads",
	licensedInsured: "yes",
	noWebsite: true,
	painPoints: ["nogoogle", "reviews", "leads"],
	phone: "(404) 555-0134",
	placeAddress: "Decatur, GA",
	placeId: "place-1",
	placeSession: "sess-1",
	reviewsRange: "11 to 50",
	serviceArea: "Decatur",
	trade: "Plumbing",
	wantHelp: "More leads",
	webLink: "",
	yearsInBusiness: "4-9",
};

const verdict: FitVerdict = {
	offline: false,
	outcome: "verified",
	place: { name: "Smith Plumbing LLC", placeId: "place-verified" },
	rating: 4.6,
	recommendedLevel: "Market Leader",
	reviewCount: 32,
};

beforeEach(() => mockInvoke.mockReset());

describe("suggestPlaces", () => {
	test("returns predictions from the worker", async () => {
		mockInvoke.mockResolvedValue({
			data: { predictions: [{ placeId: "p1", primary: "A", secondary: "B" }] },
			error: null,
		});
		const res = await suggestPlaces("smith", "sess");
		expect(res.ok && res.data).toEqual([
			{ placeId: "p1", primary: "A", secondary: "B" },
		]);
		expect(mockInvoke).toHaveBeenCalledWith("contractor-wizard", {
			body: { action: "suggest", input: "smith", session: "sess" },
		});
	});

	test("errors are non-fatal", async () => {
		mockInvoke.mockResolvedValue({ data: null, error: { message: "boom" } });
		const res = await suggestPlaces("smith", "sess");
		expect(res.ok).toBe(false);
	});
});

describe("verifyFit", () => {
	test("maps a worker verdict", async () => {
		mockInvoke.mockResolvedValue({
			data: {
				outcome: "verified",
				place: { name: "N", placeId: "p" },
				rating: 4.6,
				recommendedLevel: "Market Leader",
				reviewCount: 32,
			},
			error: null,
		});
		const res = await verifyFit(values);
		expect(res.outcome).toBe("verified");
		expect(res.rating).toBe(4.6);
		expect(res.offline).toBe(false);
	});

	test("network failure falls back to a PASS (never rejects)", async () => {
		mockInvoke.mockRejectedValue(new Error("down"));
		const res = await verifyFit(values);
		expect(res.outcome).toBe("unverified");
		expect(res.offline).toBe(true);
	});

	test("missing outcome falls back to a PASS", async () => {
		mockInvoke.mockResolvedValue({ data: { nonsense: true }, error: null });
		const res = await verifyFit(values);
		expect(res.outcome).toBe("unverified");
	});

	test("verified verdict without numeric rating data falls back to a PASS", async () => {
		mockInvoke.mockResolvedValue({
			data: { outcome: "verified", recommendedLevel: "Market Leader" },
			error: null,
		});
		const res = await verifyFit(values);
		expect(res.outcome).toBe("unverified");
		expect(res.offline).toBe(true);
	});

	test("unknown outcome string falls back to a PASS", async () => {
		mockInvoke.mockResolvedValue({
			data: { outcome: "error", rating: 1 },
			error: null,
		});
		const res = await verifyFit(values);
		expect(res.outcome).toBe("unverified");
		expect(res.offline).toBe(true);
	});
});

describe("fallbackVerdict", () => {
	test("lead-hungry answers recommend Established Business", () => {
		expect(fallbackVerdict(values).recommendedLevel).toBe(
			"Established Business"
		);
	});
	test("otherwise Local Business", () => {
		expect(
			fallbackVerdict({
				...values,
				biggestChallenge: "Something else",
				leadSource: "Word of mouth / referrals",
			}).recommendedLevel
		).toBe("Local Business");
	});
});

describe("buildApplicationPayload", () => {
	test("mirrors the site wizard's application shape", () => {
		const p = buildApplicationPayload(values, verdict);
		expect(p).toMatchObject({
			business: "Smith Plumbing",
			contact: "Jonah Smith",
			googleRating: 4.6,
			googleReviewCount: 32,
			instantDecision: "verified",
			noWebsite: "yes",
			recommendedLevel: "Market Leader",
			tradeRecognized: true,
			verifiedName: "Smith Plumbing LLC",
			verifiedPlaceId: "place-verified",
			verifyOffline: false,
		});
		expect(p.painPointLabels).toHaveLength(3);
		// nogoogle + reviews share a service — deduped.
		expect(p.painServices).toEqual([
			"GBP Optimization + Reviews",
			"Google & Meta Ads",
		]);
	});

	test("website checkbox serialises empty when a site exists", () => {
		const p = buildApplicationPayload(
			{ ...values, noWebsite: false, webLink: "x.com" },
			verdict
		);
		expect(p.noWebsite).toBe("");
	});

	test("falls back to the typed placeId when no verified place", () => {
		const p = buildApplicationPayload(values, { ...verdict, place: null });
		expect(p.verifiedPlaceId).toBe("place-1");
		expect(p.verifiedName).toBe("");
	});
});

describe("submitApplication", () => {
	test("fire-and-forget: swallows failures", async () => {
		mockInvoke.mockRejectedValue(new Error("down"));
		await expect(submitApplication(values, verdict)).resolves.toBeUndefined();
	});
});

describe("buildJoinUrl", () => {
	test("carries only public fields — no email, phone, or name", () => {
		const url = buildJoinUrl(values, verdict);
		expect(url).toContain("/join?");
		expect(url).toContain("business=Smith+Plumbing+LLC");
		expect(url).toContain("outcome=verified");
		expect(url).not.toContain("jonah%40example.com");
		expect(url).not.toContain("555");
	});
});

describe("tradeRecognized", () => {
	test.each([
		["Plumbing", true],
		["HVAC repair", true],
		["Mortgage brokerage", false],
		["", false],
	])("%s → %s", (trade, expected) => {
		expect(tradeRecognized(trade)).toBe(expected);
	});
});
