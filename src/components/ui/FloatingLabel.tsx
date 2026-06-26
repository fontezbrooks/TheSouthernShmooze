import { useEffect } from "react";
import { StyleSheet } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  interpolate,
} from "react-native-reanimated";
import { useTheme } from "@/theme/ThemeProvider";

// Icon width (18) + row gap (6): how far the placeholder label sits past a
// leading icon, and thus how far left it travels when it floats up.
const ICON_OFFSET = 24;
// Vertical travel: placeholder (centered in the value row) → floated (top).
const PLACEHOLDER_Y = 11;

interface FloatingLabelProps {
  label: string;
  /** focused || hasValue (always true for multiline). Drives the float. */
  floated: boolean;
  hasIcon: boolean;
  color?: string;
}

/**
 * Animated label that sits as the field placeholder when empty/unfocused and
 * floats up to a small top-left label once the field is focused or filled
 * (Figma V3 "Label Inside"). Transforms only (translate + scale) so it runs on
 * the UI thread; `transformOrigin: left` keeps it left-anchored while scaling.
 */
export function FloatingLabel({
  label,
  floated,
  hasIcon,
  color,
}: FloatingLabelProps) {
  const t = useTheme();
  const progress = useSharedValue(floated ? 1 : 0);

  useEffect(() => {
    progress.value = withTiming(floated ? 1 : 0, { duration: 150 });
  }, [floated, progress]);

  // Placeholder sits after the leading icon (in the value row); when it floats
  // up it slides to the box's left edge, above the icon.
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateX: interpolate(
          progress.value,
          [0, 1],
          [hasIcon ? ICON_OFFSET : 0, 0],
        ),
      },
      { translateY: interpolate(progress.value, [0, 1], [PLACEHOLDER_Y, 0]) },
      { scale: interpolate(progress.value, [0, 1], [1, 0.75]) },
    ],
  }));

  return (
    <Animated.Text
      pointerEvents="none"
      numberOfLines={1}
      style={[
        styles.label,
        t.typography.body,
        { color: color ?? t.colors.muted },
        animatedStyle,
      ]}
    >
      {label}
    </Animated.Text>
  );
}

const styles = StyleSheet.create({
  label: {
    position: "absolute",
    left: 0,
    top: 0,
    transformOrigin: "left center",
  },
});
