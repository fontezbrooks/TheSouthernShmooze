import type { DirectoryBusinessDetailRow } from "@/lib/database";
import { toDetail } from "../businessDetailTypes";

function detailRow(
	over: Partial<DirectoryBusinessDetailRow>
): DirectoryBusinessDetailRow {
	return {
		about_html: null,
		about_text: "We do lawns.",
		address: {
			city: "Atlanta",
			country: "US",
			line1: "1 Peachtree St",
			state: "GA",
			zip: "30301",
		},
		contact_name: "Sam",
		deal: null,
		description: "tagline",
		gallery: [
			{ large: "l1", small: "s1" },
			{ large: null, small: "s2" },
		],
		has_coupon: false,
		is_certified: true,
		latitude: null,
		logo_url: null,
		longitude: null,
		name: "Grantlanta Lawn",
		phone_numbers: [
			{ normalized_phone_number: "6787904781", phone_number: "678-790-4781" },
		],
		recommended_score: null,
		socials: {
			fbk: "https://facebook.com/x",
			links: [{ label: "Yelp", url: "https://yelp.com/x" }],
		},
		source_uid: "uid",
		website: "https://grantlanta.example",
		...over,
	};
}

describe("toDetail", () => {
	it("maps core fields", () => {
		const d = toDetail(detailRow({}));
		expect(d.name).toBe("Grantlanta Lawn");
		expect(d.isCertified).toBe(true);
		expect(d.aboutText).toBe("We do lawns.");
		expect(d.website).toBe("https://grantlanta.example");
	});

	it("normalizes a scheme-less website so the link can open", () => {
		expect(toDetail(detailRow({ website: "www.example.com" })).website).toBe(
			"https://www.example.com"
		);
		// Already-schemed URLs are left as-is; empty/null stay null.
		expect(toDetail(detailRow({ website: "http://x.com" })).website).toBe(
			"http://x.com"
		);
		expect(toDetail(detailRow({ website: null })).website).toBeNull();
	});

	it("formats the address into one line (ad1, cit, sta, zip)", () => {
		expect(toDetail(detailRow({})).address).toBe(
			"1 Peachtree St, Atlanta, GA, 30301"
		);
		expect(toDetail(detailRow({ address: null })).address).toBeNull();
	});

	it("flattens socials keeping raw keys + short pill labels, and labelled links", () => {
		const d = toDetail(detailRow({}));
		expect(d.socials).toEqual([
			{ key: "fbk", label: "Facebook", url: "https://facebook.com/x" },
			{ key: "link", label: "Yelp", url: "https://yelp.com/x" },
		]);
	});

	it("maps every known social key to its short pill label (P6)", () => {
		const d = toDetail(
			detailRow({
				socials: { bbb: "u", fbk: "u", goo: "u", igm: "u", ylp: "u" },
			})
		);
		expect(d.socials.map((s) => s.label)).toEqual([
			"BBB",
			"Facebook",
			"Google Business",
			"Instagram",
			"Yelp",
		]);
		expect(d.socials.map((s) => s.key)).toEqual([
			"bbb",
			"fbk",
			"goo",
			"igm",
			"ylp",
		]);
	});

	it("falls back to the raw key as the label for unmapped socials", () => {
		const d = toDetail(detailRow({ socials: { unknownkey: "u" } }));
		expect(d.socials).toEqual([
			{ key: "unknownkey", label: "unknownkey", url: "u" },
		]);
	});

	it("prefers large gallery URLs and drops empty ones", () => {
		expect(toDetail(detailRow({})).gallery).toEqual(["l1", "s2"]);
	});

	it("maps phones to raw + display", () => {
		expect(toDetail(detailRow({})).phones).toEqual([
			{ display: "678-790-4781", raw: "6787904781" },
		]);
	});
});
