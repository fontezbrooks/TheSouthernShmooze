import {
	applicantEmail,
	buildContractorHtml,
	buildContractorSubject,
} from "../contractor-email";

describe("buildContractorSubject", () => {
	it("includes business and trade", () => {
		expect(buildContractorSubject({ business: "Acme", trade: "Roofing" })).toBe(
			"New contractor application — Acme (Roofing)"
		);
	});

	it("falls back to business only", () => {
		expect(buildContractorSubject({ business: "Acme" })).toBe(
			"New contractor application — Acme"
		);
	});

	it("uses a generic subject without a business", () => {
		expect(buildContractorSubject({ trade: "Roofing" })).toBe(
			"New contractor application"
		);
	});
});

describe("buildContractorHtml", () => {
	it("renders application details defensively", () => {
		const html = buildContractorHtml({
			biggestChallenge: "First line\nSecond line",
			business: "Unverified Business",
			googleRating: 4.8,
			googleReviewCount: 42,
			noWebsite: "yes",
			painPointLabels: ["More leads", "Better reviews"],
			phone: "",
			trade: "Roofing <b>specialist</b>",
			verifiedName: "Verified Business",
		});

		expect(html).toContain("Verified Business");
		expect(html).not.toContain("Unverified Business");
		expect(html).toContain("4.8 (42 reviews)");
		expect(html).toContain("More leads, Better reviews");
		expect(html).toContain("<strong>Website:</strong> None");
		expect(html).toContain("Roofing &lt;b&gt;specialist&lt;/b&gt;");
		expect(html).not.toContain("Phone:");
		expect(html).toContain("First line<br>Second line");
	});
});

describe("applicantEmail", () => {
	it("returns a trimmed plausible email", () => {
		expect(applicantEmail({ email: " applicant@example.com " })).toBe(
			"applicant@example.com"
		);
	});

	it("returns null when email is missing", () => {
		expect(applicantEmail({})).toBeNull();
	});

	it("returns null when email is not a string", () => {
		expect(applicantEmail({ email: 123 })).toBeNull();
	});

	it("returns null when email lacks an at sign", () => {
		expect(applicantEmail({ email: "not-an-email" })).toBeNull();
	});
});
