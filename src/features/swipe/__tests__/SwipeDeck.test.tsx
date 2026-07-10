import { render, fireEvent } from "@testing-library/react-native";
import { createRef } from "react";
import { SwipeDeck } from "../SwipeDeck";
import type { SwipeDeckRef } from "@fontezbrooks/swipedaddy";
import type { DeckCard } from "../swipeTypes";

// The swipe engine has its own 16-test suite in the swipeDaddy repo (and its
// raw-TS source isn't in jest-expo's transform allowlist) — mock it at the
// boundary with a double that exposes the SAME contract: rendered cards via
// renderCard, intent/tap/left-swipe callbacks, and the imperative ref.
jest.mock("@fontezbrooks/swipedaddy", () => {
  const React = jest.requireActual("react");
  const { Text, View } = jest.requireActual("react-native");
  const SwipeDeck = ({
    data,
    renderCard,
    keyExtractor,
    onSwipeLeft,
    onSwipeRight,
    onSwipeRightIntent,
    onCardPress,
    onActiveIndexChange,
    ref,
  }: {
    data: unknown[];
    renderCard: (item: unknown, index: number, progress: unknown) => unknown;
    keyExtractor?: (item: unknown, index: number) => string;
    onSwipeLeft?: (item: unknown, index: number) => void;
    onSwipeRight?: (item: unknown, index: number) => void;
    onSwipeRightIntent?: (item: unknown, index: number) => void;
    onCardPress?: (item: unknown, index: number) => void;
    onActiveIndexChange?: (index: number) => void;
    ref?: unknown;
  }) => {
    const progress = { value: 0 };
    React.useImperativeHandle(ref, () => ({
      swipeLeft: () => {
        onSwipeLeft?.(data[0], 0);
        onActiveIndexChange?.(1);
      },
      swipeRight: () => {
        onSwipeRight?.(data[0], 0);
        onActiveIndexChange?.(1);
      },
      reset: () => {},
      activeIndex: { value: 0 },
    }));
    return (
      <View testID="swipedaddy-deck">
        {data.map((item, index) => (
          <View key={keyExtractor ? keyExtractor(item, index) : index}>
            {renderCard(item, index, progress)}
            <Text onPress={() => onSwipeRightIntent?.(item, index)}>
              {`engine-intent-${index}`}
            </Text>
            <Text onPress={() => onCardPress?.(item, index)}>
              {`engine-tap-${index}`}
            </Text>
          </View>
        ))}
      </View>
    );
  };
  return { SwipeDeck };
});

// SwipeStamps imports reanimated; the real worklets runtime can't initialize
// under jest — use the shipped mocks (see swipeDaddy's jest-setup notes).
jest.mock("react-native-worklets", () =>
  jest.requireActual("react-native-worklets/lib/module/mock"),
);
jest.mock("react-native-reanimated", () =>
  jest.requireActual("react-native-reanimated/mock"),
);
jest.mock("@/components/ui/Icon", () => ({ Icon: () => null }));

function card(id: string, name: string): DeckCard {
  return {
    id,
    sourceUid: `uid-${id}`,
    name,
    tagline: "",
    logoUrl: null,
    phone: null,
    phoneDisplay: null,
    hasCoupon: false,
    isCertified: false,
    recommended: false,
    latitude: null,
    longitude: null,
    confidence: 87,
    distanceKm: null,
    isFeatured: false,
    matchedTerms: [],
  };
}

const CARDS = [card("a", "Roof Co"), card("b", "Gutter Bros")];

function makeProps() {
  return {
    cards: CARDS,
    current: CARDS[0],
    loading: false,
    error: null,
    empty: false,
    exhausted: false,
    deckKey: "k1",
    deckRef: createRef<SwipeDeckRef | null>(),
    onIndexChange: jest.fn(),
    onPass: jest.fn(),
    onLike: jest.fn(),
    onNewSearch: jest.fn(),
    onBrowseDirectory: jest.fn(),
    onCardPress: jest.fn(),
  };
}

describe("SwipeDeck (engine adapter)", () => {
  it("renders every card face through the engine", async () => {
    const { getByText } = await render(<SwipeDeck {...makeProps()} />);

    expect(getByText("Roof Co")).toBeTruthy();
    expect(getByText("Gutter Bros")).toBeTruthy();
  });

  it("Pass button drives the engine: pass flash + index mirror", async () => {
    const props = makeProps();
    const { getByText } = await render(<SwipeDeck {...props} />);

    fireEvent.press(getByText("Pass"));

    expect(props.onPass).toHaveBeenCalledTimes(1);
    expect(props.onIndexChange).toHaveBeenCalledWith(1);
  });

  it("Match button fires the right-swipe intent with the current card", async () => {
    const props = makeProps();
    const { getByText } = await render(<SwipeDeck {...props} />);

    fireEvent.press(getByText("Match"));

    expect(props.onLike).toHaveBeenCalledWith(CARDS[0]);
    // Intent never advances the deck by itself.
    expect(props.onIndexChange).not.toHaveBeenCalled();
  });

  it("a gesture right-swipe intent carries the swiped card", async () => {
    const props = makeProps();
    const { getByText } = await render(<SwipeDeck {...props} />);

    fireEvent.press(getByText("engine-intent-0"));

    expect(props.onLike).toHaveBeenCalledWith(CARDS[0]);
  });

  it("a card tap opens the quick view with that card", async () => {
    const props = makeProps();
    const { getByText } = await render(<SwipeDeck {...props} />);

    fireEvent.press(getByText("engine-tap-0"));

    expect(props.onCardPress).toHaveBeenCalledWith(CARDS[0]);
  });

  it("shows the loading state (accessible label)", async () => {
    const { getByLabelText } = await render(
      <SwipeDeck {...makeProps()} loading cards={[]} current={null} />,
    );

    expect(getByLabelText("Finding matches")).toBeTruthy();
  });

  it("shows the error state with a retry path", async () => {
    const props = { ...makeProps(), error: "boom", cards: [], current: null };
    const { getByText } = await render(<SwipeDeck {...props} />);

    fireEvent.press(getByText("Try another search"));

    expect(props.onNewSearch).toHaveBeenCalledTimes(1);
  });

  it("shows ST5 no-matches when the deck loads empty", async () => {
    const { getByText } = await render(
      <SwipeDeck {...makeProps()} empty cards={[]} current={null} />,
    );

    expect(getByText("No matches yet")).toBeTruthy();
  });

  it("shows ST6 end-of-deck with the directory handoff", async () => {
    const props = { ...makeProps(), exhausted: true, current: null };
    const { getByText } = await render(<SwipeDeck {...props} />);

    fireEvent.press(getByText("Browse the directory"));

    expect(props.onBrowseDirectory).toHaveBeenCalledTimes(1);
  });
});
