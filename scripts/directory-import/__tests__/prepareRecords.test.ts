import { prepareRecords, type DirectoryRecord } from "../transform";

/**
 * Tests for the shared `prepareRecords` seam — the function the `sync-directory` Edge
 * Function uses to turn a raw `usr[]` feed into the change set passed to
 * `directory_sync_apply`. It transforms each record, attaches its phones, and skips
 * (counting) invalid records. Must match the importer's behaviour exactly.
 */
describe("prepareRecords", () => {
  const valid: DirectoryRecord = {
    uid: "67abb394a58a47dd5100f925",
    nam: "Nailed it Roofing &amp; Remodeling",
    cnm: "Roofing &amp; gutters",
    ir5: 1,
    cpn: 1,
    lgo: { s: "https://cdn.membershipworks.com/u/abc_lgl.jpg" },
    loc: [-84.2967457, 33.7088688],
    phn: ["(770) 241-5648", "7702415648"],
  };

  it("maps a valid record into { business, phones } with decoded text", () => {
    const { prepared, skipped } = prepareRecords([valid]);
    expect(skipped).toBe(0);
    expect(prepared).toHaveLength(1);
    expect(prepared[0].business).toMatchObject({
      source_uid: "67abb394a58a47dd5100f925",
      name: "Nailed it Roofing & Remodeling",
      has_coupon: true,
      longitude: -84.2967457,
      latitude: 33.7088688,
    });
    expect(prepared[0].phones).toEqual([
      { phone_number: "(770) 241-5648", normalized_phone_number: "7702415648", position: 0 },
      { phone_number: "7702415648", normalized_phone_number: "7702415648", position: 1 },
    ]);
  });

  it("skips invalid records (missing uid / empty name) and counts them", () => {
    const records: DirectoryRecord[] = [
      valid,
      { nam: "No uid here" }, // missing uid
      { uid: "x", nam: "   " }, // empty name after decode
      { uid: "y", nam: "Acme" }, // valid, no phones
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
