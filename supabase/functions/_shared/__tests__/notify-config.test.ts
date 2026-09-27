import {
	loadNotifyRecipients,
	parseAddressList,
	resolveNotifyRecipients,
} from "../notify-config";

const FROM_ERROR = /LEAD_NOTIFY_FROM/;
const TO_ERROR = /LEAD_NOTIFY_TO/;

describe("parseAddressList", () => {
	it("parses one address", () => {
		expect(parseAddressList("one@example.com")).toEqual(["one@example.com"]);
	});

	it("parses comma-separated addresses and trims spaces", () => {
		expect(parseAddressList(" one@example.com, two@example.com ")).toEqual([
			"one@example.com",
			"two@example.com",
		]);
	});

	it("drops an empty entry after a trailing comma", () => {
		expect(parseAddressList("one@example.com, ")).toEqual(["one@example.com"]);
	});

	it("returns an empty list for undefined", () => {
		expect(parseAddressList(undefined)).toEqual([]);
	});

	it("returns an empty list for an empty string", () => {
		expect(parseAddressList("")).toEqual([]);
	});
});

describe("resolveNotifyRecipients", () => {
	const reader = (values: Record<string, string>) => (name: string) =>
		values[name];

	it("resolves from, to, and bcc", () => {
		expect(
			resolveNotifyRecipients(
				reader({
					LEAD_NOTIFY_BCC: "hidden@example.com, audit@example.com",
					LEAD_NOTIFY_FROM: "Sender <sender@example.com>",
					LEAD_NOTIFY_TO: "one@example.com, two@example.com",
				})
			)
		).toEqual({
			bcc: ["hidden@example.com", "audit@example.com"],
			from: "Sender <sender@example.com>",
			to: ["one@example.com", "two@example.com"],
		});
	});

	it("omits bcc when the variable is missing", () => {
		const result = resolveNotifyRecipients(
			reader({
				LEAD_NOTIFY_FROM: "sender@example.com",
				LEAD_NOTIFY_TO: "one@example.com",
			})
		);
		expect(result).not.toHaveProperty("bcc");
	});

	it("omits bcc when the variable is empty", () => {
		const result = resolveNotifyRecipients(
			reader({
				LEAD_NOTIFY_BCC: "",
				LEAD_NOTIFY_FROM: "sender@example.com",
				LEAD_NOTIFY_TO: "one@example.com",
			})
		);
		expect(result).not.toHaveProperty("bcc");
	});

	it("throws when to is missing", () => {
		expect(() =>
			resolveNotifyRecipients(
				reader({ LEAD_NOTIFY_FROM: "sender@example.com" })
			)
		).toThrow(TO_ERROR);
	});

	it("throws when to contains only empty entries", () => {
		expect(() =>
			resolveNotifyRecipients(
				reader({
					LEAD_NOTIFY_FROM: "sender@example.com",
					LEAD_NOTIFY_TO: "  ,  ",
				})
			)
		).toThrow(TO_ERROR);
	});

	it("throws when from is missing", () => {
		expect(() =>
			resolveNotifyRecipients(reader({ LEAD_NOTIFY_TO: "one@example.com" }))
		).toThrow(FROM_ERROR);
	});
});

describe("loadNotifyRecipients", () => {
	const reader = (values: Record<string, string>) => (name: string) =>
		values[name];

	it("returns recipients for a valid environment", () => {
		expect(
			loadNotifyRecipients(
				reader({
					LEAD_NOTIFY_FROM: "sender@example.com",
					LEAD_NOTIFY_TO: "one@example.com",
				})
			)
		).toEqual({
			from: "sender@example.com",
			to: ["one@example.com"],
		});
	});

	it("logs and returns null when to is missing", () => {
		const errorSpy = jest.spyOn(console, "error").mockImplementation();

		try {
			expect(
				loadNotifyRecipients(reader({ LEAD_NOTIFY_FROM: "sender@example.com" }))
			).toBeNull();
			expect(errorSpy).toHaveBeenCalledWith("LEAD_NOTIFY_TO is not set");
		} finally {
			errorSpy.mockRestore();
		}
	});
});
