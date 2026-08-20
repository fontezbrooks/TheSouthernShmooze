import { decodeText } from "../transform";

/**
 * Parity tests for the inline HTML-entity decoder that replaced the `he` npm package
 * (so the transform can run on Deno + Bun from one shared module). Cases mirror the
 * real MembershipWorks corpus: named refs, decimal numeric refs (incl. emoji), and
 * hex refs. Unknown entities must pass through untouched.
 */
describe("decodeText / inline entity decoder", () => {
	it("decodes named entities", () => {
		expect(decodeText("Roofing &amp; Remodeling")).toBe("Roofing & Remodeling");
		expect(decodeText("&quot;Honey, it&apos;s DONE!&quot;")).toBe(
			'"Honey, it\'s DONE!"'
		);
		expect(decodeText("a &lt;tag&gt; b")).toBe("a <tag> b");
	});

	it("decodes decimal numeric refs (including emoji)", () => {
		expect(decodeText("Don&#8217;t")).toBe("Don’t");
		expect(decodeText("local fav&#128170;")).toBe("local fav\u{1F4AA}");
	});

	it("decodes hex numeric refs", () => {
		expect(decodeText("Don&#x2019;t")).toBe("Don’t");
		expect(decodeText("&#x1F4AA;")).toBe("\u{1F4AA}");
	});

	it("decodes &nbsp; to a non-breaking space (parity with `he`)", () => {
		expect(decodeText("a&nbsp;b")).toBe("a b");
	});

	it("leaves unknown / malformed entities untouched", () => {
		expect(decodeText("5 &lt 10 &amp; rising")).toBe("5 &lt 10 & rising");
		expect(decodeText("&notareal;")).toBe("&notareal;");
		expect(decodeText("R&D budget")).toBe("R&D budget");
	});

	it("still returns null for empty/non-strings", () => {
		expect(decodeText("")).toBeNull();
		expect(decodeText("   ")).toBeNull();
		expect(decodeText(null)).toBeNull();
		expect(decodeText(42)).toBeNull();
	});
});
