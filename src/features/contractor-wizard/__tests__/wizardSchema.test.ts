import {
	emptyWizard,
	STEP_COUNT,
	STEP_FIELDS,
	type WizardValues,
	webLinkMissing,
	wizardSchema,
} from "../wizardSchema";

const validValues: WizardValues = {
	biggestChallenge: "Not enough leads",
	business: "Smith Plumbing",
	contact: "Jonah Smith",
	email: "jonah@example.com",
	leadSource: "Word of mouth / referrals",
	licensedInsured: "yes",
	noWebsite: false,
	painPoints: ["reviews", "website"],
	phone: "(404) 555-0134",
	placeAddress: "Decatur, GA",
	placeId: "place-1",
	placeSession: "sess-1",
	reviewsRange: "11 to 50",
	serviceArea: "Decatur",
	trade: "Plumbing",
	wantHelp: "More leads",
	webLink: "smithplumbing.com",
	yearsInBusiness: "4-9",
};

describe("wizardSchema", () => {
	test("accepts a complete valid application", () => {
		const res = wizardSchema.safeParse(validValues);
		expect(res.success).toBe(true);
	});

	test("trims whitespace on text fields", () => {
		const res = wizardSchema.parse({
			...validValues,
			contact: "  Jonah  ",
			serviceArea: " Decatur ",
		});
		expect(res.contact).toBe("Jonah");
		expect(res.serviceArea).toBe("Decatur");
	});

	test.each([
		["contact", ""],
		["business", "  "],
		["trade", ""],
		["serviceArea", ""],
	])("rejects empty %s", (field, value) => {
		const res = wizardSchema.safeParse({ ...validValues, [field]: value });
		expect(res.success).toBe(false);
	});

	test("rejects malformed email", () => {
		expect(
			wizardSchema.safeParse({ ...validValues, email: "not-an-email" }).success
		).toBe(false);
	});

	test("rejects short phone", () => {
		expect(
			wizardSchema.safeParse({ ...validValues, phone: "123" }).success
		).toBe(false);
	});

	test("rejects punctuation-only phone (needs 7+ digits)", () => {
		expect(
			wizardSchema.safeParse({ ...validValues, phone: "......." }).success
		).toBe(false);
		expect(
			wizardSchema.safeParse({ ...validValues, phone: "(---) --- ----" })
				.success
		).toBe(false);
	});

	test.each([
		"yearsInBusiness",
		"licensedInsured",
		"leadSource",
		"reviewsRange",
		"wantHelp",
		"biggestChallenge",
	] as const)("rejects unselected %s", (field) => {
		const res = wizardSchema.safeParse({ ...validValues, [field]: "" });
		expect(res.success).toBe(false);
	});

	test("empty webLink and painPoints are valid (optional fields)", () => {
		const res = wizardSchema.safeParse({
			...validValues,
			painPoints: [],
			webLink: "",
		});
		expect(res.success).toBe(true);
	});
});

describe("webLinkMissing (cross-field website rule)", () => {
	test("missing when no link and box unchecked", () => {
		expect(webLinkMissing({ noWebsite: false, webLink: "  " })).toBe(true);
	});
	test("ok when box checked", () => {
		expect(webLinkMissing({ noWebsite: true, webLink: "" })).toBe(false);
	});
	test("ok when link present", () => {
		expect(webLinkMissing({ noWebsite: false, webLink: "x.com" })).toBe(false);
	});
});

describe("STEP_FIELDS", () => {
	test("covers every schema field the user must fill", () => {
		const covered = new Set(STEP_FIELDS.flat());
		const hidden = ["placeId", "placeAddress", "placeSession", "noWebsite"];
		for (const key of Object.keys(emptyWizard)) {
			if (hidden.includes(key)) {
				continue;
			}
			expect(covered.has(key as keyof WizardValues)).toBe(true);
		}
		expect(STEP_COUNT).toBe(7);
	});
});
