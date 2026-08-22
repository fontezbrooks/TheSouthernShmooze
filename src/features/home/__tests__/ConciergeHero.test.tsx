import { render } from "@testing-library/react-native";
import { StyleSheet } from "react-native";
import { ConciergeHero } from "../ConciergeHero";

describe("ConciergeHero", () => {
	it("sets the emphasis word in Fraunces italic + clay, like the site", async () => {
		const { getByText } = await render(<ConciergeHero onPress={jest.fn()} />);

		const style = StyleSheet.flatten(getByText("Concierge").props.style);

		expect(style.fontFamily).toBe("Fraunces_700Bold_Italic");
		expect(style.color).toBe("#A8472B");
	});
});
