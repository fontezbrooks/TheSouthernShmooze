import type { StyleProp, TextStyle } from "react-native";
import { useTheme } from "@/theme/ThemeProvider";
import { heading } from "@/theme/tokens";
import { StrokedText } from "./StrokedText";

type DisplayVariant = "displayL" | "displayS" | "displayXS";

interface StrokedHeadingProps {
	children: string;
	/** Fill color (defaults to the variant's color). */
	color?: string;
	strokeColor?: string;
	strokeWidth?: number;
	style?: StyleProp<TextStyle>;
	variant: DisplayVariant;
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
			strokeColor={strokeColor}
			strokeWidth={strokeWidth}
			style={[t.typography[variant], color ? { color } : null, style]}
		>
			{children}
		</StrokedText>
	);
}
