import { escapeHtml } from "./lead-email.ts";

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
	const row = (label: string, value: string) =>
		value
			? `<p style="margin:0 0 12px"><strong>${label}:</strong> ${value}</p>`
			: "";
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
		`<div style="font-family:Arial,Helvetica,sans-serif;font-size:15px;color:#1b1b1c;line-height:1.5">`,
		"<p>New application from Check My Fit</p>",
		row("Business", escapeHtml(business)),
		row("Trade", escapeHtml(str(app, "trade"))),
		row("Service area", escapeHtml(str(app, "serviceArea"))),
		row("Years in business", escapeHtml(str(app, "yearsInBusiness"))),
		row("Reviews range", escapeHtml(str(app, "reviewsRange"))),
		row("Google rating", escapeHtml(ratingText)),
		row("Licensed & insured", escapeHtml(str(app, "licensedInsured"))),
		row("Website", escapeHtml(website)),
		row("Pain points", escapeHtml(stringList("painPointLabels").join(", "))),
		row(
			"Biggest challenge",
			escapeHtml(str(app, "biggestChallenge")).replace(/\n/g, "<br>")
		),
		row("Wants help", escapeHtml(str(app, "wantHelp"))),
		row("Instant decision", escapeHtml(str(app, "instantDecision"))),
		row("Recommended level", escapeHtml(str(app, "recommendedLevel"))),
		row("Lead source", escapeHtml(str(app, "leadSource"))),
		row("Contact", escapeHtml(str(app, "contact"))),
		row("Email", escapeHtml(str(app, "email"))),
		row("Phone", escapeHtml(str(app, "phone"))),
		row("Address", escapeHtml(str(app, "placeAddress"))),
		"</div>",
	]
		.filter(Boolean)
		.join("");
}

export function applicantEmail(app: ContractorApplication): string | null {
	const email = str(app, "email");
	return email.includes("@") ? email : null;
}
