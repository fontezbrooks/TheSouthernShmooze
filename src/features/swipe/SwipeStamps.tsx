import { StyleSheet, Text } from "react-native";
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedStyle,
} from "react-native-reanimated";
import { useTheme } from "@/theme/ThemeProvider";
import type { SharedValue } from "react-native-reanimated";

/**
 * MATCH/PASS cues that fade in with the drag. `progress` is the deck engine's
 * drag position as a fraction of the swipe threshold (0 centered, ±1 at the
 * commit point) — full opacity exactly where the swipe would commit.
 */
export function SwipeStamps({ progress }: { progress: SharedValue<number> }) {
  const t = useTheme();

  const matchCue = useAnimatedStyle(() => ({
    opacity: interpolate(progress.value, [0, 1], [0, 1], Extrapolation.CLAMP),
  }));

  const passCue = useAnimatedStyle(() => ({
    opacity: interpolate(progress.value, [-1, 0], [1, 0], Extrapolation.CLAMP),
  }));

  return (
    <>
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
    </>
  );
}

const styles = StyleSheet.create({
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
