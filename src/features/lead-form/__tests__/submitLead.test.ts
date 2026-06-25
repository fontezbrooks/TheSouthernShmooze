import { getSupabase } from "@/lib/supabase";
import { submitLead } from "../submitLead";
import type { LeadFormValues } from "../leadSchema";

jest.mock("@/lib/supabase", () => ({ getSupabase: jest.fn() }));
jest.mock("expo-crypto", () => ({ randomUUID: () => "test-uuid" }));
jest.mock("expo-file-system", () => ({
  File: class {
    uri: string;
    constructor(uri: string) {
      this.uri = uri;
    }
    async arrayBuffer() {
      return new ArrayBuffer(8);
    }
  },
}));

const mockedGetSupabase = getSupabase as jest.MockedFunction<
  typeof getSupabase
>;

function makeClient(
  opts: { uploadError?: unknown; insertError?: unknown } = {},
) {
  const insert = jest
    .fn()
    .mockResolvedValue({ error: opts.insertError ?? null });
  const upload = jest
    .fn()
    .mockResolvedValue({ error: opts.uploadError ?? null });
  const client = {
    from: jest.fn().mockReturnValue({ insert }),
    storage: { from: jest.fn().mockReturnValue({ upload }) },
  };
  return { client, insert, upload };
}

const baseValues: LeadFormValues = {
  firstName: "Jane",
  lastName: "Doe",
  email: "jane@example.com",
  phone: "5551234567",
  address: "123 Peachtree St",
  budget: "lt_1000",
  projectDetails: "Need a plumber.",
  company: "",
};

beforeEach(() => jest.clearAllMocks());

describe("submitLead", () => {
  it("inserts a mapped row and returns ok (no file)", async () => {
    const { client, insert, upload } = makeClient();
    mockedGetSupabase.mockReturnValue(client as never);

    const result = await submitLead(baseValues);

    expect(result).toEqual({ ok: true, data: { id: "test-uuid" } });
    expect(upload).not.toHaveBeenCalled();
    expect(insert).toHaveBeenCalledWith(
      expect.objectContaining({
        id: "test-uuid",
        first_name: "Jane",
        last_name: "Doe",
        email: "jane@example.com",
        phone: "5551234567",
        address: "123 Peachtree St",
        budget: ["lt_1000"],
        project_details: "Need a plumber.",
        project_start_date: null,
        file_path: null,
      }),
    );
  });

  it("maps projectStartDate to a YYYY-MM-DD string", async () => {
    const { client, insert } = makeClient();
    mockedGetSupabase.mockReturnValue(client as never);

    await submitLead({ ...baseValues, projectStartDate: new Date(2026, 6, 4) });

    expect(insert).toHaveBeenCalledWith(
      expect.objectContaining({ project_start_date: "2026-07-04" }),
    );
  });

  it("uploads the file first, then inserts with file_path", async () => {
    const { client, insert, upload } = makeClient();
    mockedGetSupabase.mockReturnValue(client as never);

    const result = await submitLead({
      ...baseValues,
      file: {
        uri: "file:///tmp/photo.jpg",
        name: "photo.jpg",
        mimeType: "image/jpeg",
      },
    });

    expect(result.ok).toBe(true);
    expect(upload).toHaveBeenCalledWith(
      "test-uuid/photo.jpg",
      expect.any(ArrayBuffer),
      expect.objectContaining({ contentType: "image/jpeg", upsert: false }),
    );
    expect(insert).toHaveBeenCalledWith(
      expect.objectContaining({ file_path: "test-uuid/photo.jpg" }),
    );
  });

  it("returns an error and skips insert when the upload fails", async () => {
    const { client, insert } = makeClient({ uploadError: { message: "boom" } });
    mockedGetSupabase.mockReturnValue(client as never);

    const result = await submitLead({
      ...baseValues,
      file: {
        uri: "file:///tmp/photo.jpg",
        name: "photo.jpg",
        mimeType: "image/jpeg",
      },
    });

    expect(result.ok).toBe(false);
    expect(insert).not.toHaveBeenCalled();
  });

  it("returns an error when the insert fails", async () => {
    const { client } = makeClient({ insertError: { message: "db down" } });
    mockedGetSupabase.mockReturnValue(client as never);

    const result = await submitLead(baseValues);

    expect(result.ok).toBe(false);
  });

  it("returns an error when the client throws", async () => {
    mockedGetSupabase.mockImplementation(() => {
      throw new Error("no config");
    });

    const result = await submitLead(baseValues);

    expect(result.ok).toBe(false);
  });
});
