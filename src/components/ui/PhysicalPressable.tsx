import { type ReactNode } from "react";
import {
  Pressable,
  View,
  StyleSheet,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
} from "react-native-reanimated";
import { useTheme } from "@/theme/ThemeProvider";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface PhysicalPressableProps {
  onPress: () => void;
  /** Travel distance toward the shadow (matches the hard-shadow offset). */
  offset?: number;
  /** Static shadow color behind the surface (default rustDark). */
  shadowColor?: string;
  /** Corner radius — must match the surface so the shadow lines up. */
  radius?: number;
  /** Stretch to the parent's width (banners). When false, sizes to content (cards). */
  fullWidth?: boolean;
  style?: StyleProp<ViewStyle>;
  accessibilityLabel?: string;
  children: ReactNode;
}

/**
 * A surface that physically "pushes" into its hard shadow on press. A static
 * shadow rectangle sits behind the animated content, offset by `offset`; on
 * press the content springs onto it (covering the shadow), then springs back —
 * giving a tactile, physical-button feel without animating native shadow props.
 */
export function PhysicalPressable({
  onPress,
  offset = 4,
  shadowColor,
  radius = 0,
  fullWidth = true,
  style,
  accessibilityLabel,
  children,
}: PhysicalPressableProps) {
  const t = useTheme();
  const pressed = useSharedValue(0); // 0 = rest, 1 = fully pressed

  const contentStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: pressed.value * offset },
      { translateY: pressed.value * offset },
    ],
  }));

  return (
    <View style={fullWidth ? styles.wrap : styles.wrapContent}>
      <View
        pointerEvents="none"
        style={[
          StyleSheet.absoluteFill,
          {
            backgroundColor: shadowColor ?? t.colors.rustDark,
            borderRadius: radius,
            transform: [{ translateX: offset }, { translateY: offset }],
          },
        ]}
      />
      <AnimatedPressable
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
        onPress={onPress}
        onPressIn={() => {
          pressed.value = withTiming(1, { duration: 80 });
        }}
        onPressOut={() => {
          pressed.value = withSpring(0, { damping: 12, stiffness: 220 });
        }}
        style={[style, contentStyle]}
      >
        {children}
      </AnimatedPressable>
    </View>
  );
}

const styles = StyleSheet.create({
  // Sizes to the content; the absolute shadow layer mirrors that size.
  wrap: { position: "relative", width: "100%" },
  // Sizes to the content's intrinsic width (cards in a horizontal row).
  wrapContent: { position: "relative", alignSelf: "flex-start" },
});
