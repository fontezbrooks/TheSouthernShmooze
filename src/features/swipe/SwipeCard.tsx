import { Dimensions, StyleSheet, Text } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  Extrapolation,
  interpolate,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { useTheme } from "@/theme/ThemeProvider";
import { DeckCardView } from "./DeckCardView";
import type { DeckCard } from "./swipeTypes";

const SCREEN_W = Dimensions.get("window").width;
const SWIPE_THRESHOLD = SCREEN_W * 0.28;
// Fluid, non-bouncy return/fling — feels like the card has real weight.
const SPRING = { damping: 20, stiffness: 220, mass: 0.7 } as const;

interface SwipeCardProps {
  card: DeckCard;
  onSwipeLeft: () => void;
  onSwipeRight: () => void;
}

/**
 * The draggable top card. Tracks the finger 1:1 in real time — the user can drift toward a
 * side and, while still pressed, drag back to center — with a clamped tilt and MATCH/PASS
 * cues that fade in with the drag. Remounted per card (keyed by id in the deck), so the
 * shared offset resets cleanly between cards. All motion runs on the UI thread (worklets).
 */
export function SwipeCard({ card, onSwipeLeft, onSwipeRight }: SwipeCardProps) {
  const t = useTheme();
  const x = useSharedValue(0);

  const pan = Gesture.Pan()
    // Engage once the drag is clearly horizontal so movement starts crisp (no dead zone jump).
    .activeOffsetX([-12, 12])
    .onUpdate((e) => {
      x.value = e.translationX;
    })
    .onEnd((e) => {
      if (e.translationX > SWIPE_THRESHOLD) {
        // Right = Match. Spring back to center (a right swipe may be gated by contact
        // verification — the parent opens a modal WITHOUT advancing — so the card must stay
        // recoverable). When the parent advances, this card unmounts and the spring is unseen.
        x.value = withSpring(0, SPRING);
        runOnJS(onSwipeRight)();
      } else if (e.translationX < -SWIPE_THRESHOLD) {
        // Left = Pass. The parent always advances, so fling it away.
        x.value = withSpring(-SCREEN_W * 1.5, SPRING);
        runOnJS(onSwipeLeft)();
      } else {
        x.value = withSpring(0, SPRING);
      }
    });

  const cardStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: x.value },
      {
        rotate: `${interpolate(
          x.value,
          [-SCREEN_W, SCREEN_W],
          [-10, 10],
          Extrapolation.CLAMP,
        )}deg`,
      },
    ],
  }));

  const matchCue = useAnimatedStyle(() => ({
    opacity: interpolate(
      x.value,
      [0, SWIPE_THRESHOLD],
      [0, 1],
      Extrapolation.CLAMP,
    ),
  }));

  const passCue = useAnimatedStyle(() => ({
    opacity: interpolate(
      x.value,
      [-SWIPE_THRESHOLD, 0],
      [1, 0],
      Extrapolation.CLAMP,
    ),
  }));

  return (
    <GestureDetector gesture={pan}>
      <Animated.View style={[styles.fill, cardStyle]}>
        <DeckCardView card={card} />
        <Animated.View
          pointerEvents="none"
          style={[
            styles.stamp,
            styles.stampRight,
            { borderColor: t.colors.rust },
            matchCue,
          ]}
        >
          <Text style={[styles.stampText, { color: t.colors.rust }]}>MATCH</Text>
        </Animated.View>
        <Animated.View
          pointerEvents="none"
          style={[
            styles.stamp,
            styles.stampLeft,
            { borderColor: t.colors.neutral800 },
            passCue,
          ]}
        >
          <Text style={[styles.stampText, { color: t.colors.neutral800 }]}>
            PASS
          </Text>
        </Animated.View>
      </Animated.View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  fill: { width: "100%" },
  stamp: {
    position: "absolute",
    top: 24,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 4,
    borderRadius: 8,
    backgroundColor: "rgba(255,255,255,0.85)",
  },
  stampRight: { right: 20, transform: [{ rotate: "12deg" }] },
  stampLeft: { left: 20, transform: [{ rotate: "-12deg" }] },
  stampText: { fontSize: 28, fontWeight: "800", letterSpacing: 1 },
});
