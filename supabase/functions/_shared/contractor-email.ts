import { EMAIL_WRAPPER_OPEN, escapeHtml, htmlRow } from "./lead-email.ts";

export type ContractorApplication = Record<string, unknown>;

function str(app: ContractorApplication, key: string): string {
	return typeof app[key] === "string" ? app[key].trim() : "";
}

export function buildContractorSubject(app: ContractorApplication): string {
	const business = str(app, "business");
	const trade = str(app, "trade");
	if (business && trade) {
		return `New contractor application — ${business} (${trade})`;
	}
	if (business) {
		return `New contractor application — ${business}`;
	}
	return "New contractor application";
}

export function buildContractorHtml(app: ContractorApplication): string {
	const stringList = (key: string) =>
		Array.isArray(app[key])
			? app[key].filter((value): value is string => typeof value === "string")
			: [];
	const rating = typeof app.googleRating === "number" ? app.googleRating : null;
	const reviewCount =
		typeof app.googleReviewCount === "number" ? app.googleReviewCount : null;
	const website =
		str(app, "webLink") || (str(app, "noWebsite") === "yes" ? "None" : "");
	const business = str(app, "verifiedName") || str(app, "business");
	const ratingText =
		rating === null
			? ""
			: `${rating} (${reviewCount === null ? 0 : reviewCount} reviews)`;

	return [
		EMAIL_WRAPPER_OPEN,
		"<p>New application from Check My Fit</p>",
		htmlRow("Business", escapeHtml(business)),
		htmlRow("Trade", escapeHtml(str(app, "trade"))),
		htmlRow("Service area", escapeHtml(str(app, "serviceArea"))),
		htmlRow("Years in business", escapeHtml(str(app, "yearsInBusiness"))),
		htmlRow("Reviews range", escapeHtml(str(app, "reviewsRange"))),
		htmlRow("Google rating", escapeHtml(ratingText)),
		htmlRow("Licensed & insured", escapeHtml(str(app, "licensedInsured"))),
		htmlRow("Website", escapeHtml(website)),
		htmlRow(
			"Pain points",
			escapeHtml(stringList("painPointLabels").join(", "))
		),
		htmlRow(
			"Biggest challenge",
			escapeHtml(str(app, "biggestChallenge")).replace(/\n/g, "<br>")
		),
		htmlRow("Wants help", escapeHtml(str(app, "wantHelp"))),
		htmlRow("Instant decision", escapeHtml(str(app, "instantDecision"))),
		htmlRow("Recommended level", escapeHtml(str(app, "recommendedLevel"))),
		htmlRow("Lead source", escapeHtml(str(app, "leadSource"))),
		htmlRow("Contact", escapeHtml(str(app, "contact"))),
		htmlRow("Email", escapeHtml(str(app, "email"))),
		htmlRow("Phone", escapeHtml(str(app, "phone"))),
		htmlRow("Address", escapeHtml(str(app, "placeAddress"))),
		"</div>",
	]
		.filter(Boolean)
		.join("");
}

export function applicantEmail(app: ContractorApplication): string | null {
	const email = str(app, "email");
	return email.includes("@") ? email : null;
}
