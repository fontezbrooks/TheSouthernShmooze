import { fireEvent, render } from "@testing-library/react-native";
import { BusinessCard } from "../BusinessCard";
import type { DirectoryBusiness } from "../providerTypes";

jest.mock("@/components/ui/Icon", () => {
	const { Text } = jest.requireActual("react-native");
	return {
		Icon: ({ name }: { name: string }) => <Text>{`icon:${name}`}</Text>,
	};
});

const biz = (over: Partial<DirectoryBusiness> = {}): DirectoryBusiness => ({
	hasCoupon: false,
	id: "b1",
	isCertified: true,
	latitude: null,
	logoUrl: "https://example.com/logo.png",
	longitude: null,
	name: "Grantlanta Lawn",
	phone: "6787731617",
	phoneDisplay: "678-773-1617",
	recommended: false,
	sourceUid: "grantlanta",
	tagline: "Atlanta landscaping since 2016",
	...over,
});

const renderCard = async (business: DirectoryBusiness) => {
	const onCallPress = jest.fn();
	const onCardPress = jest.fn();
	const utils = await render(
		<BusinessCard
			business={business}
			onCallPress={onCallPress}
			onCardPress={onCardPress}
		/>
	);
	return { ...utils, onCallPress, onCardPress };
};

describe("BusinessCard", () => {
	it("shows the name, tagline and the Certified chip", async () => {
		const { getByText } = await renderCard(biz());

		expect(getByText("Grantlanta Lawn")).toBeTruthy();
		expect(getByText("Atlanta landscaping since 2016")).toBeTruthy();
		expect(getByText("Certified")).toBeTruthy();
	});

	it("opens the registry listing by source uid when the card is pressed", async () => {
		const { getByLabelText, onCardPress } = await renderCard(biz());

		await fireEvent.press(
			getByLabelText("Grantlanta Lawn — open registry listing")
		);

		expect(onCardPress).toHaveBeenCalledWith("grantlanta");
	});

	it("dials the raw phone number from the nested call button", async () => {
		const { getByLabelText, onCallPress, onCardPress } = await renderCard(
			biz()
		);

		await fireEvent.press(getByLabelText("Call Grantlanta Lawn"));

		expect(onCallPress).toHaveBeenCalledWith("6787731617");
		// The nested press must not also open the listing.
		expect(onCardPress).not.toHaveBeenCalled();
	});

	it("omits the call button when the business has no phone", async () => {
		const { queryByLabelText } = await renderCard(
			biz({ phone: null, phoneDisplay: null })
		);

		expect(queryByLabelText("Call Grantlanta Lawn")).toBeNull();
	});

	it("shows the briefcase placeholder when there is no logo", async () => {
		const { getByText } = await renderCard(biz({ logoUrl: null }));

		expect(getByText("icon:briefcaseFilled")).toBeTruthy();
	});

	it("shows the reviews and discount badges only when earned", async () => {
		const plain = await renderCard(biz());
		expect(plain.queryByText("icon:thumbsUp")).toBeNull();
		expect(plain.queryByText("icon:discount")).toBeNull();
		await plain.unmount();

		const earned = await renderCard(
			biz({ hasCoupon: true, recommended: true })
		);
		expect(earned.getByText("icon:thumbsUp")).toBeTruthy();
		expect(earned.getByText("icon:discount")).toBeTruthy();
	});
});
