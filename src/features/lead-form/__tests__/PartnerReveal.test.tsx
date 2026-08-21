import { fireEvent, render, waitFor } from "@testing-library/react-native";
import { PartnerReveal } from "../PartnerReveal";

const mockFetchPinned = jest.fn();
jest.mock("@/features/providers/providerRepository", () => ({
	providerRepository: { fetchPinned: () => mockFetchPinned() },
}));
const mockTrack = jest.fn();
jest.mock("@/lib/analytics/useAnalytics", () => ({
	useAnalytics: () => ({ track: (...a: unknown[]) => mockTrack(...a) }),
}));
const mockOpenLink = jest.fn();
jest.mock("@/lib/openLink", () => ({
	openLink: (u: string) => mockOpenLink(u),
}));

const partner = {
	hasCoupon: false,
	id: "p1",
	isCertified: true,
	latitude: null,
	logoUrl: null,
	longitude: null,
	name: "Kellco Pest Control",
	phone: "4047629429",
	phoneDisplay: "404-762-9429",
	recommended: true,
	sourceUid: "kellco",
	tagline: "",
};

beforeEach(() => {
	jest.clearAllMocks();
	mockFetchPinned.mockResolvedValue({ data: [partner], ok: true });
});

const renderReveal = async () => {
	const onDone = jest.fn();
	const onSeeDirectory = jest.fn();
	const utils = await render(
		<PartnerReveal onDone={onDone} onSeeDirectory={onSeeDirectory} />
	);
	return { ...utils, onDone, onSeeDirectory };
};

describe("PartnerReveal", () => {
	it("confirms in the site's words and names the preferred partner", async () => {
		const { getByText, findByText } = await renderReveal();

		expect(getByText("We're on it.")).toBeTruthy();
		expect(getByText("Prefer someone else?")).toBeTruthy();
		expect(await findByText("Kellco Pest Control")).toBeTruthy();
	});

	it("Done hands control back to the caller", async () => {
		const { getByRole, onDone } = await renderReveal();

		await fireEvent.press(getByRole("button", { name: "Done" }));

		expect(onDone).toHaveBeenCalledTimes(1);
	});

	it("links out to the full directory", async () => {
		const { getByRole, onSeeDirectory } = await renderReveal();

		await fireEvent.press(
			getByRole("link", { name: "See every certified pro in the directory" })
		);

		expect(onSeeDirectory).toHaveBeenCalledTimes(1);
	});

	it("tracks a partner call from the completion screen before dialling", async () => {
		const { findByLabelText } = await renderReveal();

		await fireEvent.press(
			await findByLabelText("Call Kellco Pest Control at 404-762-9429")
		);

		await waitFor(() =>
			expect(mockTrack).toHaveBeenCalledWith("partner_call_button_clicked", {
				call_placement_source: "find_my_pro_completion",
				pro_business_id: "kellco",
			})
		);
		expect(mockOpenLink).toHaveBeenCalledWith("tel:4047629429");
	});
});
