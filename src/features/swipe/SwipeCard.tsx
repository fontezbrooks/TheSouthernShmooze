import { Dimensions, StyleSheet } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { DeckCardView } from "./DeckCardView";
import type { DeckCard } from "./swipeTypes";

const SCREEN_W = Dimensions.get("window").width;
const SWIPE_THRESHOLD = SCREEN_W * 0.28;

interface SwipeCardProps {
  card: DeckCard;
  onSwipeLeft: () => void;
  onSwipeRight: () => void;
}

/**
 * The draggable top card. Pan past the threshold flings it off-screen and reports the
 * direction; otherwise it springs back. Remounted per card (keyed by id in the deck), so
 * the shared offset resets cleanly between cards.
 */
export function SwipeCard({ card, onSwipeLeft, onSwipeRight }: SwipeCardProps) {
  const x = useSharedValue(0);

  const pan = Gesture.Pan()
    .onUpdate((e) => {
      x.value = e.translationX;
    })
    .onEnd((e) => {
      if (e.translationX > SWIPE_THRESHOLD) {
        x.value = withSpring(SCREEN_W * 1.5);
        runOnJS(onSwipeRight)();
      } else if (e.translationX < -SWIPE_THRESHOLD) {
        x.value = withSpring(-SCREEN_W * 1.5);
        runOnJS(onSwipeLeft)();
      } else {
        x.value = withSpring(0);
      }
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: x.value },
      { rotate: `${x.value / 22}deg` },
    ],
  }));

  return (
    <GestureDetector gesture={pan}>
      <Animated.View style={[styles.fill, animatedStyle]}>
        <DeckCardView card={card} />
      </Animated.View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  fill: { width: "100%" },
});
