import type { SwipeTask } from "../swipeTypes";

const mockRpc = jest.fn();
jest.mock("@/lib/supabase", () => ({
	getSupabase: () => ({ rpc: mockRpc }),
}));

import { swipeRepository } from "../swipeRepository";

const task: SwipeTask = {
	budget: "1000_5000",
	keyword: "roofing",
	originLat: 33.7,
	originLng: -84.3,
	radiusKm: 25,
	timing: "this_week",
};

beforeEach(() => mockRpc.mockReset());

describe("createTask", () => {
	it("passes task params and returns the new task id", async () => {
		mockRpc.mockResolvedValue({ data: "task-1", error: null });
		const res = await swipeRepository.createTask(task, "sess");
		expect(res).toEqual({ data: "task-1", ok: true });
		expect(mockRpc).toHaveBeenCalledWith("create_swipe_task", {
			p_budget: "1000_5000",
			p_keyword: "roofing",
			p_lat: 33.7,
			p_lng: -84.3,
			p_radius_km: 25,
			p_session_token: "sess",
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
					confidence: 80,
					created_at: "",
					description: null,
					distance_km: null,
					has_coupon: false,
					id: "1",
					is_certified: false,
					is_featured: false,
					latitude: null,
					logo_url: null,
					longitude: null,
					matched_terms: ["roofing"],
					name: "Roof Co",
					phone_numbers: null,
					recommended_score: null,
					source_uid: "u1",
					updated_at: "",
				},
			],
			error: null,
		});
		const res = await swipeRepository.fetchDeck(task, "sess", []);
		expect(res.ok).toBe(true);
		if (!res.ok) {
			return;
		}
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
			budget: "1000_5000",
			details: "Need sod",
			email: "c@x.com",
			name: "Carl Higgins",
			phone: "4044372480",
		});
		expect(res.ok).toBe(true);
		expect(mockRpc).toHaveBeenCalledWith("save_swipe_contact", {
			p_budget: "1000_5000",
			p_details: "Need sod",
			p_email: "c@x.com",
			p_name: "Carl Higgins",
			p_phone: "4044372480",
			p_session_token: "sess",
			p_task_id: "task-1",
		});
	});

	it("surfaces a rejection reason", async () => {
		mockRpc.mockResolvedValue({
			data: {
				reason: "name and a valid email are required",
				status: "rejected",
			},
			error: null,
		});
		const res = await swipeRepository.saveContact("sess", null, {
			budget: null,
			details: null,
			email: "bad",
			name: "",
			phone: null,
		});
		expect(res).toEqual({
			error: "name and a valid email are required",
			ok: false,
		});
	});
});

describe("submitLead", () => {
	it("maps ok/duplicate statuses to success outcomes carrying the lead id (0021)", async () => {
		mockRpc.mockResolvedValueOnce({
			data: { lead_id: "lead-9", status: "ok" },
			error: null,
		});
		expect(await swipeRepository.submitLead("s", "t", "u", 90)).toEqual({
			data: { leadId: "lead-9", status: "ok" },
			ok: true,
		});
		mockRpc.mockResolvedValueOnce({
			data: { lead_id: "lead-9", status: "duplicate" },
			error: null,
		});
		expect(await swipeRepository.submitLead("s", "t", "u", 90)).toEqual({
			data: { leadId: "lead-9", status: "duplicate" },
			ok: true,
		});
		// Pre-0021 deploy skew: no lead_id in the payload → null, still ok.
		mockRpc.mockResolvedValueOnce({ data: { status: "ok" }, error: null });
		expect(await swipeRepository.submitLead("s", "t", "u", 90)).toEqual({
			data: { leadId: null, status: "ok" },
			ok: true,
		});
	});

	it("returns the rejection reason as an error", async () => {
		mockRpc.mockResolvedValue({
			data: { reason: "contact not verified", status: "rejected" },
			error: null,
		});
		const res = await swipeRepository.submitLead("s", "t", "u", 90);
		expect(res).toEqual({ error: "contact not verified", ok: false });
	});
});
