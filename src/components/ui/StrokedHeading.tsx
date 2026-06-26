import {
  View,
  Text,
  StyleSheet,
  type TextStyle,
  type StyleProp,
} from "react-native";
import { useTheme } from "@/theme/ThemeProvider";
import { heading } from "@/theme/tokens";

type DisplayVariant = "displayL" | "displayS" | "displayXS";

interface StrokedHeadingProps {
  variant: DisplayVariant;
  children: string;
  /** Fill color (defaults to the variant's color). */
  color?: string;
  strokeColor?: string;
  strokeWidth?: number;
  style?: StyleProp<TextStyle>;
}

// Sample N points around a circle of radius = strokeWidth. A dense ring keeps
// the outline gap-free at thicker stroke widths (8 fixed dirs leave diagonal
// gaps past ~2px).
const RING_SAMPLES = 16;
const RING = Array.from({ length: RING_SAMPLES }, (_, i) => {
  const a = (i / RING_SAMPLES) * 2 * Math.PI;
  return [Math.cos(a), Math.sin(a)] as const;
});

/**
 * Shrikhand display header with a faux text-stroke (RN has no text-stroke). The
 * text is drawn as 8 offset copies in `strokeColor` behind a fill copy, matching
 * the outlined "sticker" treatment of the Figma section headers + logo.
 * NOTE: stroke color/width come from `heading` tokens — pending exact Figma spec.
 */
export function StrokedHeading({
  variant,
  children,
  color,
  strokeColor = heading.strokeColor,
  strokeWidth = heading.strokeWidth,
  style,
}: StrokedHeadingProps) {
  const t = useTheme();
  const base = t.typography[variant];
  const fill: StyleProp<TextStyle> = [base, color ? { color } : null, style];
  const stroke: StyleProp<TextStyle> = [base, { color: strokeColor }, style];

  return (
    <View style={styles.wrap}>
      {RING.map(([dx, dy], i) => (
        <Text
          key={i}
          accessible={false}
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
      <Text style={fill}>{children}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  // Sizes to the fill text; absolute stroke copies mirror that box and wrap identically.
  wrap: { position: "relative" },
});
