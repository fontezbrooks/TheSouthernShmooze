import { captureServerEvent } from "../posthog-capture";

const CONFIG = { apiKey: "phc_test", host: "https://us.i.posthog.com" };

describe("captureServerEvent (P4 server-side capture)", () => {
	let fetchMock: jest.Mock;
	let errorSpy: jest.SpyInstance;

	beforeEach(() => {
		fetchMock = jest.fn().mockResolvedValue({ ok: true, status: 200 });
		globalThis.fetch = fetchMock as unknown as typeof fetch;
		errorSpy = jest.spyOn(console, "error").mockImplementation(() => {
			/* silence */
		});
	});

	afterEach(() => {
		errorSpy.mockRestore();
	});

	test("POSTs the event envelope to /i/v0/e/ with person processing off", async () => {
		await captureServerEvent(CONFIG, {
			event: "registry_sync_completed",
			properties: { records_ingested: 42, sync_status: "ok" },
		});
		expect(fetchMock).toHaveBeenCalledTimes(1);
		const [url, init] = fetchMock.mock.calls[0];
		expect(url).toBe("https://us.i.posthog.com/i/v0/e/");
		expect(init.method).toBe("POST");
		expect(JSON.parse(init.body)).toEqual({
			api_key: "phc_test",
			distinct_id: "server:sync",
			event: "registry_sync_completed",
			properties: {
				$process_person_profile: false,
				distinct_id: "server:sync",
				records_ingested: 42,
				sync_status: "ok",
			},
		});
	});

	test("honors a custom distinct id and strips a trailing host slash", async () => {
		await captureServerEvent(
			{ ...CONFIG, host: "https://us.i.posthog.com/" },
			{ distinctId: "server:custom", event: "e", properties: {} }
		);
		const [url, init] = fetchMock.mock.calls[0];
		expect(url).toBe("https://us.i.posthog.com/i/v0/e/");
		expect(JSON.parse(init.body).distinct_id).toBe("server:custom");
		// Legacy capture schema position (review: PR #45).
		expect(JSON.parse(init.body).properties.distinct_id).toBe("server:custom");
	});

	test("missing key or host is a silent no-op", async () => {
		await captureServerEvent(
			{ host: CONFIG.host },
			{ event: "e", properties: {} }
		);
		await captureServerEvent(
			{ apiKey: CONFIG.apiKey },
			{ event: "e", properties: {} }
		);
		expect(fetchMock).not.toHaveBeenCalled();
	});

	test("HTTP failure resolves without throwing and logs", async () => {
		fetchMock.mockResolvedValue({ ok: false, status: 500 });
		await expect(
			captureServerEvent(CONFIG, { event: "e", properties: {} })
		).resolves.toBeUndefined();
		expect(errorSpy).toHaveBeenCalledWith("[posthog-capture] e: HTTP 500");
	});

	test("network rejection (incl. abort/timeout) resolves without throwing", async () => {
		fetchMock.mockRejectedValue(new Error("The operation was aborted"));
		await expect(
			captureServerEvent(CONFIG, { event: "e", properties: {} })
		).resolves.toBeUndefined();
		expect(errorSpy).toHaveBeenCalledWith(
			"[posthog-capture] e: The operation was aborted"
		);
	});
});
