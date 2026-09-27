import { RESEND_ENDPOINT, sendResendEmail } from "../resend";

const message = {
	from: "sender@example.com",
	html: "<p>Hello</p>",
	subject: "Hello",
	to: ["recipient@example.com"],
};

describe("sendResendEmail", () => {
	const originalFetch = globalThis.fetch;
	let fetchMock: jest.Mock;

	beforeEach(() => {
		fetchMock = jest.fn();
		globalThis.fetch = fetchMock as typeof fetch;
	});

	afterEach(() => {
		globalThis.fetch = originalFetch;
	});

	it("returns the sent message id", async () => {
		fetchMock.mockResolvedValue({
			json: jest.fn().mockResolvedValue({ id: "email-123" }),
			ok: true,
		});

		await expect(sendResendEmail("api-key", message)).resolves.toEqual({
			id: "email-123",
			ok: true,
		});
		expect(fetchMock).toHaveBeenCalledWith(
			RESEND_ENDPOINT,
			expect.objectContaining({
				body: JSON.stringify(message),
				headers: {
					Authorization: "Bearer api-key",
					"Content-Type": "application/json",
				},
				method: "POST",
			})
		);
	});

	it("returns a null id when the response body is unparsable", async () => {
		fetchMock.mockResolvedValue({
			json: jest.fn().mockRejectedValue(new SyntaxError("invalid json")),
			ok: true,
		});

		await expect(sendResendEmail("api-key", message)).resolves.toEqual({
			id: null,
			ok: true,
		});
	});

	it("returns the status and reason and logs a failed send", async () => {
		const errorSpy = jest.spyOn(console, "error").mockImplementation();
		fetchMock.mockResolvedValue({
			ok: false,
			status: 422,
			statusText: "Unprocessable Content",
			text: jest.fn().mockResolvedValue("invalid recipient"),
		});

		try {
			await expect(sendResendEmail("api-key", message)).resolves.toEqual({
				ok: false,
				reason: "invalid recipient",
				status: 422,
			});
			expect(errorSpy).toHaveBeenCalledWith(
				"Resend send failed:",
				422,
				"invalid recipient"
			);
		} finally {
			errorSpy.mockRestore();
		}
	});

	it("adds the idempotency header only when provided", async () => {
		fetchMock.mockResolvedValue({
			json: jest.fn().mockResolvedValue({}),
			ok: true,
		});

		await sendResendEmail("api-key", message, {
			idempotencyKey: "lead-123",
		});
		const firstInit = fetchMock.mock.calls[0][1] as RequestInit;
		expect(firstInit.headers).toEqual(
			expect.objectContaining({ "Idempotency-Key": "lead-123" })
		);

		await sendResendEmail("api-key", message);
		const secondInit = fetchMock.mock.calls[1][1] as RequestInit;
		expect(secondInit.headers).not.toHaveProperty("Idempotency-Key");
	});

	it("forwards the signal when provided", async () => {
		fetchMock.mockResolvedValue({
			json: jest.fn().mockResolvedValue({}),
			ok: true,
		});
		const controller = new AbortController();

		await sendResendEmail("api-key", message, {
			signal: controller.signal,
		});

		expect(fetchMock).toHaveBeenCalledWith(
			RESEND_ENDPOINT,
			expect.objectContaining({ signal: controller.signal })
		);
	});
});
