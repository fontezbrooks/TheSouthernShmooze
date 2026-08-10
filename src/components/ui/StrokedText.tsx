import {
  View,
  Text,
  StyleSheet,
  type TextStyle,
  type ViewStyle,
  type StyleProp,
  type TextProps,
} from "react-native";
import { heading } from "@/theme/tokens";

interface StrokedTextProps extends Omit<TextProps, "style" | "children"> {
  children: string;
  /** Full text style (typography + color) — applied to fill and stroke copies. */
  style?: StyleProp<TextStyle>;
  strokeColor?: string;
  strokeWidth?: number;
  /** Layout styles (flex, margins) belong on the wrapper, not the text. */
  containerStyle?: StyleProp<ViewStyle>;
}

// Sample N points around a circle of radius = strokeWidth. Thin strokes
// (<=2px) stay gap-free with 8 directions; thicker ones need a denser ring
// (8 fixed dirs leave diagonal gaps past ~2px — see StrokedHeading).
const ring = (samples: number) =>
  Array.from({ length: samples }, (_, i) => {
    const a = (i / samples) * 2 * Math.PI;
    return [Math.cos(a), Math.sin(a)] as const;
  });
const RING_THIN = ring(8);
const RING_DENSE = ring(16);

/**
 * Faux text-stroke for arbitrary text (RN has no text-stroke): offset copies
 * in `strokeColor` behind a fill copy — the readability treatment for text
 * sitting directly on the daisy ImageBackground (form pages, per owner).
 * Stroke copies are hidden from accessibility; the fill copy carries all
 * TextProps (a11y labels, live regions).
 */
export function StrokedText({
  children,
  style,
  strokeColor = heading.strokeColor,
  strokeWidth = 1.5,
  containerStyle,
  ...textProps
}: StrokedTextProps) {
  const samples = strokeWidth <= 2 ? RING_THIN : RING_DENSE;
  const stroke: StyleProp<TextStyle> = [style, { color: strokeColor }];

  return (
    <View style={[styles.wrap, containerStyle]}>
      {samples.map(([dx, dy], i) => (
        <Text
          key={i}
          accessible={false}
          accessibilityElementsHidden
          importantForAccessibility="no-hide-descendants"
          style={[
            StyleSheet.absoluteFill,
            stroke,
            {
              transform: [
                { translateX: dx * strokeWidth },
                { translateY: dy * strokeWidth },
              ],
            },
          ]}
        >
          {children}
        </Text>
      ))}
      <Text style={style} {...textProps}>
        {children}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  // Sizes to the fill text; absolute stroke copies mirror that box and wrap identically.
  wrap: { position: "relative" },
});
