import { type TextStyle, type StyleProp } from "react-native";
import { useTheme } from "@/theme/ThemeProvider";
import { heading } from "@/theme/tokens";
import { StrokedText } from "./StrokedText";

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

/**
 * Shrikhand display header with a faux text-stroke, matching the outlined
 * "sticker" treatment of the Figma section headers + logo. Ring rendering
 * lives in `StrokedText`; this wrapper binds the display typography.
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
  return (
    <StrokedText
      style={[t.typography[variant], color ? { color } : null, style]}
      strokeColor={strokeColor}
      strokeWidth={strokeWidth}
    >
      {children}
    </StrokedText>
  );
}
