import type { DirectoryBusinessRow } from "@/lib/database";

/** Build a chainable, awaitable Supabase query stub resolving to {data,error}. */
function makeQuery(result: { data: unknown; error: unknown }) {
  const calls: { method: string; args: unknown[] }[] = [];
  const builder: Record<string, unknown> = {};
  for (const m of ["select", "in", "not", "order", "range"]) {
    builder[m] = (...args: unknown[]) => {
      calls.push({ method: m, args });
      return builder;
    };
  }
  // Make the builder awaitable (thenable) so `await from().select()...` resolves.
  (builder as { then: unknown }).then = (resolve: (v: unknown) => void) =>
    resolve(result);
  return { builder, calls };
}

const mockFrom = jest.fn();
jest.mock("@/lib/supabase", () => ({
  getSupabase: () => ({ from: mockFrom }),
}));

import { providerRepository, PINNED_NAMES } from "../providerRepository";

function row(over: Partial<DirectoryBusinessRow>): DirectoryBusinessRow {
  return {
    id: "id",
    source_uid: "uid",
    name: "Biz",
    description: "desc",
    logo_url: null,
    longitude: null,
    latitude: null,
    recommended_score: 1,
    has_coupon: false,
    is_certified: false,
    phone_numbers: [
      { phone_number: "6787904781", normalized_phone_number: "6787904781" },
    ],
    created_at: "",
    updated_at: "",
    ...over,
  };
}

beforeEach(() => mockFrom.mockReset());

describe("providerRepository.fetchPinned", () => {
  it("re-sorts rows into canonical PINNED_NAMES order and maps them", async () => {
    // DB returns out of order.
    const data = [
      row({ id: "3", name: "SLAM Plumbing" }),
      row({ id: "1", name: "Grantlanta Lawn" }),
      row({ id: "2", name: "Peace of Mind Recycling" }),
    ];
    mockFrom.mockReturnValue(makeQuery({ data, error: null }).builder);

    const result = await providerRepository.fetchPinned();
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.data.map((b) => b.name)).toEqual([...PINNED_NAMES]);
    // mapper: phone formatted for display
    expect(result.data[0].phoneDisplay).toBe("678-790-4781");
  });

  it("maps source_uid and coupon/certified flags to the view-model", async () => {
    const data = [
      row({
        id: "1",
        name: "Grantlanta Lawn",
        source_uid: "abc-123",
        has_coupon: true,
        is_certified: true,
      }),
    ];
    mockFrom.mockReturnValue(makeQuery({ data, error: null }).builder);

    const result = await providerRepository.fetchPinned();
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.data[0].sourceUid).toBe("abc-123");
    expect(result.data[0].hasCoupon).toBe(true);
    expect(result.data[0].isCertified).toBe(true);
  });

  it("returns an error Result when the query errors", async () => {
    mockFrom.mockReturnValue(
      makeQuery({ data: null, error: { message: "boom" } }).builder,
    );
    const result = await providerRepository.fetchPinned();
    expect(result.ok).toBe(false);
  });
});

describe("providerRepository.fetchMore", () => {
  it("requests the correct range window and maps results", async () => {
    const q = makeQuery({
      data: [row({ id: "a", name: "Alpha" })],
      error: null,
    });
    mockFrom.mockReturnValue(q.builder);

    const result = await providerRepository.fetchMore(3);
    expect(result.ok).toBe(true);
    const rangeCall = q.calls.find((c) => c.method === "range");
    expect(rangeCall?.args).toEqual([3, 5]); // offset 3, PAGE_SIZE 3 → [3,5]
    const notCall = q.calls.find((c) => c.method === "not");
    expect(notCall?.args[0]).toBe("name"); // excludes pinned by name
  });

  it("orders certified-first, then recommended_score, then name", async () => {
    const q = makeQuery({ data: [], error: null });
    mockFrom.mockReturnValue(q.builder);

    await providerRepository.fetchMore(0);
    const orderCols = q.calls
      .filter((c) => c.method === "order")
      .map((c) => c.args[0]);
    expect(orderCols).toEqual(["is_certified", "recommended_score", "name"]);

    const certifiedCall = q.calls.find(
      (c) => c.method === "order" && c.args[0] === "is_certified",
    );
    expect(certifiedCall?.args[1]).toEqual({ ascending: false });
  });
});
