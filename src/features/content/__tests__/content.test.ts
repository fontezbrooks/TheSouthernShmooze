import { ABOUT_STORY, COMMUNITY_LINKS, PRESS_ITEMS } from "../aboutContent";
import { FAQ_CONTENT } from "../faqContent";

describe("FAQ content parity (report §8.4)", () => {
	test("five topics per audience, ten total", () => {
		expect(FAQ_CONTENT.homeowners).toHaveLength(5);
		expect(FAQ_CONTENT.contractors).toHaveLength(5);
	});

	test("homeowner taxonomy matches the site", () => {
		expect(FAQ_CONTENT.homeowners.map((t) => t.topic)).toEqual([
			"Finding & Hiring a Pro",
			"Trust & Vetting",
			"Costs & Payments",
			"The Concierge Match",
			"About the Community",
		]);
	});

	test("contractor taxonomy matches the site", () => {
		expect(FAQ_CONTENT.contractors.map((t) => t.topic)).toEqual([
			"Joining & Getting Certified",
			"Membership Levels",
			"Getting Leads & Referrals",
			"Growth Studio (Marketing)",
			"Reviews, Profiles & Visibility",
		]);
	});

	test("every entry has a non-empty question and answer", () => {
		for (const audience of ["homeowners", "contractors"] as const) {
			for (const topic of FAQ_CONTENT[audience]) {
				expect(topic.qs.length).toBeGreaterThan(0);
				for (const { q, a } of topic.qs) {
					expect(q.trim().length).toBeGreaterThan(0);
					expect(a.trim().length).toBeGreaterThan(0);
				}
			}
		}
	});

	test("NO dollar amounts anywhere (Q5 / App Store 3.1.1 guard)", () => {
		const all = JSON.stringify(FAQ_CONTENT);
		expect(all).not.toMatch(/\$\s*\d/);
	});
});

describe("About content", () => {
	test("story has paragraphs with non-empty bodies", () => {
		expect(ABOUT_STORY.length).toBeGreaterThanOrEqual(4);
		for (const block of ABOUT_STORY) {
			expect(block.body.trim().length).toBeGreaterThan(0);
		}
	});

	test("press and community links are https", () => {
		for (const { url } of [...PRESS_ITEMS, ...COMMUNITY_LINKS]) {
			expect(url).toMatch(/^https:\/\//);
		}
		expect(PRESS_ITEMS).toHaveLength(2);
		expect(COMMUNITY_LINKS.map((l) => l.label)).toEqual([
			"Facebook Group",
			"The Shmooze Podcast",
			"The Newsletter",
			"Instagram",
			"Monthly Meetups",
		]);
	});
});
