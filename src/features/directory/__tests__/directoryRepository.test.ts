import type { DirectoryBusinessRow } from "@/lib/database";

/** Chainable, awaitable Supabase query stub that records calls. */
function makeQuery(result: { data: unknown; error: unknown }) {
  const calls: { method: string; args: unknown[] }[] = [];
  const builder: Record<string, unknown> = {};
  for (const m of ["select", "order", "eq", "maybeSingle"]) {
    builder[m] = (...args: unknown[]) => {
      calls.push({ method: m, args });
      return builder;
    };
  }
  (builder as { then: unknown }).then = (resolve: (v: unknown) => void) =>
    resolve(result);
  return { builder, calls };
}

const mockFrom = jest.fn();
const mockRpc = jest.fn();
jest.mock("@/lib/supabase", () => ({
  getSupabase: () => ({ from: mockFrom, rpc: mockRpc }),
}));

import { directoryRepository } from "../directoryRepository";

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
    phone_numbers: null,
    created_at: "",
    updated_at: "",
    ...over,
  };
}

beforeEach(() => {
  mockFrom.mockReset();
  mockRpc.mockReset();
});

describe("directoryRepository.browseAll", () => {
  it("orders certified-first, then recommended_score, then name; maps rows", async () => {
    const q = makeQuery({
      data: [row({ id: "1", is_certified: true })],
      error: null,
    });
    mockFrom.mockReturnValue(q.builder);

    const res = await directoryRepository.browseAll();
    expect(res.ok).toBe(true);
    if (!res.ok) return;
    expect(res.data[0].isCertified).toBe(true);

    const orderCols = q.calls
      .filter((c) => c.method === "order")
      .map((c) => c.args[0]);
    expect(orderCols).toEqual(["is_certified", "recommended_score", "name"]);
  });

  it("pins Grantlanta Lawn + Peace of Mind Recycling to the top (in that order)", async () => {
    const data = [
      row({ id: "1", name: "Acme" }),
      row({ id: "2", name: "Peace of Mind Recycling" }),
      row({ id: "3", name: "Zzz Co" }),
      row({ id: "4", name: "Grantlanta Lawn" }),
    ];
    mockFrom.mockReturnValue(makeQuery({ data, error: null }).builder);

    const res = await directoryRepository.browseAll();
    expect(res.ok).toBe(true);
    if (!res.ok) return;
    expect(res.data.map((b) => b.name)).toEqual([
      "Grantlanta Lawn",
      "Peace of Mind Recycling",
      "Acme",
      "Zzz Co",
    ]);
  });

  it("returns an error Result when the query errors", async () => {
    mockFrom.mockReturnValue(
      makeQuery({ data: null, error: { message: "boom" } }).builder,
    );
    const res = await directoryRepository.browseAll();
    expect(res.ok).toBe(false);
  });
});

describe("directoryRepository.search", () => {
  it("calls the directory_search RPC with the query + limit 50 and maps rows", async () => {
    mockRpc.mockResolvedValue({
      data: [row({ id: "x", name: "Lawn Co" })],
      error: null,
    });

    const res = await directoryRepository.search("lawn");
    expect(res.ok).toBe(true);
    if (!res.ok) return;
    expect(res.data[0].name).toBe("Lawn Co");
    expect(mockRpc).toHaveBeenCalledWith("directory_search", {
      q: "lawn",
      lim: 50,
    });
  });

  it("returns an error Result when the RPC errors", async () => {
    mockRpc.mockResolvedValue({ data: null, error: { message: "nope" } });
    const res = await directoryRepository.search("lawn");
    expect(res.ok).toBe(false);
  });
});
