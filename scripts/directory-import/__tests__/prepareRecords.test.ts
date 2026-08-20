import { type DirectoryRecord, prepareRecords } from "../transform";

/**
 * Tests for the shared `prepareRecords` seam — the function the `sync-directory` Edge
 * Function uses to turn a raw `usr[]` feed into the change set passed to
 * `directory_sync_apply`. It transforms each record, attaches its phones, and skips
 * (counting) invalid records. Must match the importer's behaviour exactly.
 */
describe("prepareRecords", () => {
	const valid: DirectoryRecord = {
		cnm: "Roofing &amp; gutters",
		cpn: 1,
		ir5: 1,
		lgo: { s: "https://cdn.membershipworks.com/u/abc_lgl.jpg" },
		loc: [-84.296_745_7, 33.708_868_8],
		nam: "Nailed it Roofing &amp; Remodeling",
		phn: ["(770) 241-5648", "7702415648"],
		uid: "67abb394a58a47dd5100f925",
	};

	it("maps a valid record into { business, phones } with decoded text", () => {
		const { prepared, skipped } = prepareRecords([valid]);
		expect(skipped).toBe(0);
		expect(prepared).toHaveLength(1);
		expect(prepared[0].business).toMatchObject({
			has_coupon: true,
			latitude: 33.708_868_8,
			longitude: -84.296_745_7,
			name: "Nailed it Roofing & Remodeling",
			source_uid: "67abb394a58a47dd5100f925",
		});
		expect(prepared[0].phones).toEqual([
			{
				normalized_phone_number: "7702415648",
				phone_number: "(770) 241-5648",
				position: 0,
			},
			{
				normalized_phone_number: "7702415648",
				phone_number: "7702415648",
				position: 1,
			},
		]);
	});

	it("skips invalid records (missing uid / empty name) and counts them", () => {
		const records: DirectoryRecord[] = [
			valid,
			{ nam: "No uid here" }, // missing uid
			{ nam: "   ", uid: "x" }, // empty name after decode
			{ nam: "Acme", uid: "y" }, // valid, no phones
		];
		const { prepared, skipped } = prepareRecords(records);
		expect(skipped).toBe(2);
		expect(prepared.map((p) => p.business.source_uid)).toEqual([
			"67abb394a58a47dd5100f925",
			"y",
		]);
		expect(prepared[1].phones).toEqual([]); // no phn → empty list
	});

	it("returns an empty change set for an empty feed", () => {
		expect(prepareRecords([])).toEqual({ prepared: [], skipped: 0 });
	});
});
