import type { SwipeTask } from "../swipeTypes";

const mockRpc = jest.fn();
jest.mock("@/lib/supabase", () => ({
  getSupabase: () => ({ rpc: mockRpc }),
}));

import { swipeRepository } from "../swipeRepository";

const task: SwipeTask = {
  keyword: "roofing",
  originLat: 33.7,
  originLng: -84.3,
  radiusKm: 25,
  budget: "1000_5000",
  timing: "this_week",
};

beforeEach(() => mockRpc.mockReset());

describe("createTask", () => {
  it("passes task params and returns the new task id", async () => {
    mockRpc.mockResolvedValue({ data: "task-1", error: null });
    const res = await swipeRepository.createTask(task, "sess");
    expect(res).toEqual({ ok: true, data: "task-1" });
    expect(mockRpc).toHaveBeenCalledWith("create_swipe_task", {
      p_session_token: "sess",
      p_keyword: "roofing",
      p_lat: 33.7,
      p_lng: -84.3,
      p_radius_km: 25,
      p_budget: "1000_5000",
      p_timing: "this_week",
    });
  });

  it("errors when the RPC fails", async () => {
    mockRpc.mockResolvedValue({ data: null, error: { message: "x" } });
    const res = await swipeRepository.createTask(task, "sess");
    expect(res.ok).toBe(false);
  });
});

describe("fetchDeck", () => {
  it("maps deck rows to cards and sends null exclude when empty", async () => {
    mockRpc.mockResolvedValue({
      data: [
        {
          id: "1",
          source_uid: "u1",
          name: "Roof Co",
          description: null,
          logo_url: null,
          longitude: null,
          latitude: null,
          recommended_score: null,
          has_coupon: false,
          is_certified: false,
          phone_numbers: null,
          created_at: "",
          updated_at: "",
          confidence: 80,
          distance_km: null,
          is_featured: false,
          matched_terms: ["roofing"],
        },
      ],
      error: null,
    });
    const res = await swipeRepository.fetchDeck(task, "sess", []);
    expect(res.ok).toBe(true);
    if (!res.ok) return;
    expect(res.data[0].confidence).toBe(80);
    expect(mockRpc.mock.calls[0][1].p_exclude).toBeNull();
  });

  it("forwards the exclude list when provided", async () => {
    mockRpc.mockResolvedValue({ data: [], error: null });
    await swipeRepository.fetchDeck(task, "sess", ["a", "b"]);
    expect(mockRpc.mock.calls[0][1].p_exclude).toEqual(["a", "b"]);
  });
});

describe("saveContact", () => {
  it("forwards contact + budget + details and treats 'ok' as success", async () => {
    mockRpc.mockResolvedValue({ data: { status: "ok" }, error: null });
    const res = await swipeRepository.saveContact("sess", "task-1", {
      name: "Carl Higgins",
      email: "c@x.com",
      phone: "4044372480",
      budget: "1000_5000",
      details: "Need sod",
    });
    expect(res.ok).toBe(true);
    expect(mockRpc).toHaveBeenCalledWith("save_swipe_contact", {
      p_session_token: "sess",
      p_task_id: "task-1",
      p_name: "Carl Higgins",
      p_email: "c@x.com",
      p_phone: "4044372480",
      p_budget: "1000_5000",
      p_details: "Need sod",
    });
  });

  it("surfaces a rejection reason", async () => {
    mockRpc.mockResolvedValue({
      data: {
        status: "rejected",
        reason: "name and a valid email are required",
      },
      error: null,
    });
    const res = await swipeRepository.saveContact("sess", null, {
      name: "",
      email: "bad",
      phone: null,
      budget: null,
      details: null,
    });
    expect(res).toEqual({
      ok: false,
      error: "name and a valid email are required",
    });
  });
});

describe("submitLead", () => {
  it("maps 'ok' and 'duplicate' statuses to success outcomes", async () => {
    mockRpc.mockResolvedValueOnce({ data: { status: "ok" }, error: null });
    expect(await swipeRepository.submitLead("s", "t", "u", 90)).toEqual({
      ok: true,
      data: "ok",
    });
    mockRpc.mockResolvedValueOnce({
      data: { status: "duplicate" },
      error: null,
    });
    expect(await swipeRepository.submitLead("s", "t", "u", 90)).toEqual({
      ok: true,
      data: "duplicate",
    });
  });

  it("returns the rejection reason as an error", async () => {
    mockRpc.mockResolvedValue({
      data: { status: "rejected", reason: "contact not verified" },
      error: null,
    });
    const res = await swipeRepository.submitLead("s", "t", "u", 90);
    expect(res).toEqual({ ok: false, error: "contact not verified" });
  });
});

describe("fetchMatches", () => {
  it("maps lead rows to matches", async () => {
    mockRpc.mockResolvedValue({
      data: [
        {
          business_uid: "u1",
          name: "Roof Co",
          logo_url: null,
          confidence: 80,
          status: "sent",
          created_at: "2026-06-30",
        },
      ],
      error: null,
    });
    const res = await swipeRepository.fetchMatches("sess");
    expect(res.ok).toBe(true);
    if (!res.ok) return;
    expect(res.data[0].name).toBe("Roof Co");
  });
});
