import { fireEvent, render } from "@testing-library/react-native";
import NotFoundScreen from "../../../../app/+not-found";
import { AppErrorBoundary } from "../AppErrorBoundary";
import { ErrorStateScreen } from "../ErrorStateScreen";

const mockReplace = jest.fn();
const mockCaptureException = jest.fn();
const RAW_ERROR_TEXT = /TypeError: undefined is not an object/;

jest.mock("expo-router", () => ({
	useRouter: () => ({ replace: mockReplace }),
}));

jest.mock("@/lib/analytics/posthog", () => ({
	getAnalyticsClient: () => ({ captureException: mockCaptureException }),
}));

beforeEach(() => {
	mockReplace.mockClear();
	mockCaptureException.mockClear();
});

describe("ErrorStateScreen", () => {
	it("renders the kicker, heading, body and action", async () => {
		const { getByRole, getByText } = await render(
			<ErrorStateScreen
				actionLabel="Do the thing"
				body="Body copy."
				heading="A heading"
				kicker="Kicker"
				onAction={jest.fn()}
			/>
		);

		expect(getByText("Kicker")).toBeTruthy();
		expect(getByRole("header", { name: "A heading" })).toBeTruthy();
		expect(getByText("Body copy.")).toBeTruthy();
		expect(getByRole("button", { name: "Do the thing" })).toBeTruthy();
	});

	it("calls onAction when the action is pressed", async () => {
		const onAction = jest.fn();
		const { getByRole } = await render(
			<ErrorStateScreen
				actionLabel="Do the thing"
				body="Body copy."
				heading="A heading"
				kicker="Kicker"
				onAction={onAction}
			/>
		);

		fireEvent.press(getByRole("button", { name: "Do the thing" }));

		expect(onAction).toHaveBeenCalledTimes(1);
	});
});

describe("AppErrorBoundary", () => {
	it("offers a way out instead of a blank screen", async () => {
		const { getByRole } = await render(
			<AppErrorBoundary error={new Error("boom")} retry={jest.fn()} />
		);

		expect(
			getByRole("header", { name: "Something went sideways" })
		).toBeTruthy();
		expect(getByRole("button", { name: "Try again" })).toBeTruthy();
	});

	it("retries the failed segment when the action is pressed", async () => {
		const retry = jest.fn();
		const { getByRole } = await render(
			<AppErrorBoundary error={new Error("boom")} retry={retry} />
		);

		fireEvent.press(getByRole("button", { name: "Try again" }));

		expect(retry).toHaveBeenCalledTimes(1);
	});

	it("reports the caught error, which the SDK's uncaught handler never sees", async () => {
		const error = new Error("boom");

		await render(<AppErrorBoundary error={error} retry={jest.fn()} />);

		expect(mockCaptureException).toHaveBeenCalledWith(error);
	});

	it("never shows the raw error to the user", async () => {
		const { queryByText } = await render(
			<AppErrorBoundary
				error={new Error("TypeError: undefined is not an object")}
				retry={jest.fn()}
			/>
		);

		expect(queryByText(RAW_ERROR_TEXT)).toBeNull();
	});
});

describe("NotFoundScreen", () => {
	it("explains the dead end", async () => {
		const { getByRole } = await render(<NotFoundScreen />);

		expect(
			getByRole("header", { name: "We can't find that page" })
		).toBeTruthy();
	});

	it("replaces the stale route with home so back cannot return to it", async () => {
		const { getByRole } = await render(<NotFoundScreen />);

		fireEvent.press(getByRole("button", { name: "Back home" }));

		expect(mockReplace).toHaveBeenCalledWith("/");
	});
});
