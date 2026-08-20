import {
	buildBatchPayload,
	contentHash,
	type DirectoryRecord,
	decodeText,
	extractPhones,
	normalizePhone,
	splitLoc,
	toBooleanFlag,
	transformRecord,
} from "../transform";

describe("decodeText", () => {
	it("decodes HTML entities and trims", () => {
		expect(decodeText("Don&#8217;t")).toBe("Don’t");
		expect(decodeText("&quot;Honey, it&apos;s DONE!&quot;")).toBe(
			'"Honey, it\'s DONE!"'
		);
		expect(decodeText("  spaced  ")).toBe("spaced");
	});
	it("returns null for empty/non-strings", () => {
		expect(decodeText("")).toBeNull();
		expect(decodeText("   ")).toBeNull();
		expect(decodeText(null)).toBeNull();
		expect(decodeText(42)).toBeNull();
	});
});

describe("toBooleanFlag", () => {
	it("treats 1/true as true, everything else false", () => {
		expect(toBooleanFlag(1)).toBe(true);
		expect(toBooleanFlag(true)).toBe(true);
		expect(toBooleanFlag(0)).toBe(false);
		expect(toBooleanFlag(undefined)).toBe(false);
		expect(toBooleanFlag("1")).toBe(false);
	});
});

describe("normalizePhone", () => {
	it("strips non-digits, keeps digit-only intact", () => {
		expect(normalizePhone("(404) 635-6505")).toBe("4046356505");
		expect(normalizePhone("7702415648")).toBe("7702415648");
	});
});

describe("splitLoc", () => {
	it("returns [lng, lat] for valid Atlanta coords", () => {
		expect(splitLoc([-84.296_745_7, 33.708_868_8])).toEqual({
			latitude: 33.708_868_8,
			longitude: -84.296_745_7,
		});
	});
	it("nulls out invalid / out-of-range / non-array", () => {
		expect(splitLoc([200, 0])).toEqual({ latitude: null, longitude: null });
		expect(splitLoc([0, 99])).toEqual({ latitude: null, longitude: null });
		expect(splitLoc(null)).toEqual({ latitude: null, longitude: null });
		expect(splitLoc([1])).toEqual({ latitude: null, longitude: null });
	});
});

describe("extractPhones", () => {
	it("maps the phn array into positioned normalized rows", () => {
		expect(extractPhones(["(404) 635-6505", "7702415648"])).toEqual([
			{
				normalized_phone_number: "4046356505",
				phone_number: "(404) 635-6505",
				position: 0,
			},
			{
				normalized_phone_number: "7702415648",
				phone_number: "7702415648",
				position: 1,
			},
		]);
	});
	it("returns [] for non-arrays and skips empty entries", () => {
		expect(extractPhones(undefined)).toEqual([]);
		expect(extractPhones(["", "  "])).toEqual([]);
	});
});

describe("transformRecord", () => {
	const sample: DirectoryRecord = {
		cnm: "Voted Southern Shmooze local fav&#128170;",
		cpn: 1,
		ir5: 3,
		lgo: { s: "https://cdn.example.com/logo.jpg" },
		loc: [-84.296_745_7, 33.708_868_8],
		nam: "- Nailed it Roofing &amp; Remodeling",
		phn: ["7702415648"],
		uid: "67abb394a58a47dd5100f925",
	};

	it("maps all fields with clean names + decoded text", () => {
		const row = transformRecord(sample);
		expect(row).not.toBeNull();
		expect(row).toMatchObject({
			has_coupon: true,
			is_certified: false,
			latitude: 33.708_868_8,
			logo_url: "https://cdn.example.com/logo.jpg",
			longitude: -84.296_745_7,
			name: "- Nailed it Roofing & Remodeling",
			recommended_score: 3,
			source_uid: "67abb394a58a47dd5100f925",
		});
		expect(row?.description).toContain("local fav");
		expect(row?.raw_source_payload).toBe(sample);
	});

	it("returns null when uid is missing", () => {
		expect(transformRecord({ ...sample, uid: undefined })).toBeNull();
	});
	it("returns null when nam is missing/empty", () => {
		expect(transformRecord({ ...sample, nam: undefined })).toBeNull();
		expect(transformRecord({ ...sample, nam: "   " })).toBeNull();
	});
	it("nulls optional fields when absent", () => {
		const row = transformRecord({ nam: "Acme", uid: "x" });
		expect(row).toMatchObject({
			description: null,
			has_coupon: false,
			is_certified: false,
			latitude: null,
			logo_url: null,
			longitude: null,
			recommended_score: null,
		});
	});

	it("maps the xgm flag to is_certified (certified star)", () => {
		expect(
			transformRecord({ nam: "Acme", uid: "x", xgm: 1 })?.is_certified
		).toBe(true);
		expect(transformRecord({ nam: "Acme", uid: "x" })?.is_certified).toBe(
			false
		);
	});

	it("stamps a content hash that changes only when content changes", () => {
		const base = transformRecord(sample)?.source_content_hash;
		expect(typeof base).toBe("string");
		expect(base).toHaveLength(16);
		// Same input → same hash (deterministic / idempotent sync).
		expect(transformRecord(sample)?.source_content_hash).toBe(base);
		// Certified flip, tagline edit, and a phone change each move the hash.
		expect(
			transformRecord({ ...sample, xgm: 1 })?.source_content_hash
		).not.toBe(base);
		expect(
			transformRecord({ ...sample, cnm: "different tagline" })
				?.source_content_hash
		).not.toBe(base);
		expect(
			transformRecord({ ...sample, phn: ["7705550000"] })?.source_content_hash
		).not.toBe(base);
	});
});

describe("contentHash", () => {
	const content = {
		description: "desc",
		has_coupon: false,
		is_certified: false,
		latitude: null,
		logo_url: null,
		longitude: null,
		name: "Biz",
		recommended_score: 1,
		source_uid: "uid",
	};

	it("is stable and 16 hex chars", () => {
		const h = contentHash(content, []);
		expect(h).toMatch(/^[0-9a-f]{16}$/);
		expect(contentHash(content, [])).toBe(h);
	});

	it("ignores source_uid (the key) but reflects every content field + phones", () => {
		const h = contentHash(content, []);
		expect(contentHash({ ...content, source_uid: "other" }, [])).toBe(h);
		expect(contentHash({ ...content, is_certified: true }, [])).not.toBe(h);
		expect(contentHash({ ...content, logo_url: "x" }, [])).not.toBe(h);
		expect(
			contentHash(content, [
				{ normalized_phone_number: "1", phone_number: "1", position: 0 },
			])
		).not.toBe(h);
	});
});

describe("buildBatchPayload", () => {
	const json = {
		_re: 837,
		_st: {
			_mk: "SECRET_MAPS_KEY",
			_rc: "US",
			crd: { dtl: "<div>[nam]</div>" },
		},
		typ: "a",
		usr: [
			{ nam: "A", uid: "1" },
			{ nam: "B", uid: "2" },
		],
	};

	it("strips _mk (and keeps other top-level data)", () => {
		const payload = buildBatchPayload(json);
		const raw = JSON.stringify(payload.raw_top_level_payload);
		expect(raw).not.toContain("SECRET_MAPS_KEY");
		expect(raw).not.toContain("_mk");
		expect(payload.raw_top_level_payload._st).toMatchObject({ _rc: "US" });
	});

	it("omits usr and counts actual processed records", () => {
		const payload = buildBatchPayload(json);
		expect(payload.source_type).toBe("a");
		expect(payload.source_record_count).toBe(2);
		expect(payload.raw_top_level_payload).not.toHaveProperty("usr");
		// claimed total preserved in raw payload
		expect(payload.raw_top_level_payload._re).toBe(837);
	});
});
