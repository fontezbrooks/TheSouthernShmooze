import {
	Pressable,
	type StyleProp,
	StyleSheet,
	Text,
	type ViewStyle,
} from "react-native";
import { useTheme } from "@/theme/ThemeProvider";
import type { BrandColors } from "@/theme/tokens";
import { Icon, type IconName } from "./Icon";

/**
 * Button set on the 2026 brand tokens — modelled on the live site's buttons
 * (report.md §8.5: Public Sans 700, pill radius, clay fill with magnolia
 * label, no shadow; secondary = outlined pill).
 *
 * - `primary` → clay fill, 56h, full width (form submit).
 * - `solid`   → clay fill, 48h, hugs content (empty-state CTA, Match).
 * - `outline` → surface, 1px clay border, clay label, 48h — the light twin of
 *               `solid` so a pair (Pass/Match) shares one shape.
 * - `pill`    → surface, hairline, 32h, hugs content — the LinkPill family;
 *               `tone` picks the label colour.
 * - `wide`    → surface, hairline, 56h, full width (secondary form action).
 *
 * Pressed state is a fill change, not an opacity dip: clay -> clay-dark for
 * filled variants, surface -> porch-cream for light ones. Disabled `primary`
 * gets an explicit peach-soft look (ink-soft label, 6.05:1); other variants
 * dim to 50%.
 */
export type ButtonVariant = "primary" | "solid" | "pill" | "wide" | "outline";

/** Label colour family for `pill` buttons. `none` also drops the hairline. */
export type ButtonTone = "rust" | "black" | "none";

interface ButtonProps {
	disabled?: boolean;
	icon?: IconName;
	iconPosition?: "leading" | "trailing";
	label: string;
	onPress?: () => void;
	style?: StyleProp<ViewStyle>;
	tone?: ButtonTone;
	variant?: ButtonVariant;
}

/** Resolved colours for one variant in one state. */
interface Look {
	border: string;
	borderWidth: number;
	label: string;
	pressed: string;
	rest: string;
}

const HAIRLINE = StyleSheet.hairlineWidth;

function resolveLook(
	variant: ButtonVariant,
	tone: ButtonTone,
	disabled: boolean,
	c: BrandColors
): Look {
	if (variant === "primary" && disabled) {
		return {
			border: "transparent",
			borderWidth: 0,
			label: c.textSoft,
			pressed: c.peachSoft,
			rest: c.peachSoft,
		};
	}
	if (variant === "primary" || variant === "solid") {
		return {
			border: "transparent",
			borderWidth: 0,
			label: c.bg,
			pressed: c.clayDark,
			rest: c.clay,
		};
	}
	if (variant === "outline") {
		return {
			border: c.clay,
			borderWidth: 1,
			label: c.clay,
			pressed: c.porchCream,
			rest: c.surface,
		};
	}
	if (variant === "pill") {
		const toneLabel: Record<ButtonTone, string> = {
			black: c.black,
			none: c.text,
			rust: c.clay,
		};
		return {
			border: c.line,
			borderWidth: tone === "none" ? 0 : HAIRLINE,
			label: toneLabel[tone],
			pressed: c.porchCream,
			rest: c.surface,
		};
	}
	return {
		border: c.line,
		borderWidth: HAIRLINE,
		label: c.text,
		pressed: c.porchCream,
		rest: c.surface,
	};
}

export function Button({
	label,
	onPress,
	variant = "primary",
	tone = "rust",
	icon,
	iconPosition = "trailing",
	disabled = false,
	style,
}: ButtonProps) {
	const t = useTheme();
	const look = resolveLook(variant, tone, disabled, t.brand.colors);
	const isPill = variant === "pill";
	// Disabled primary carries its own explicit look; everything else dims.
	const dimmed = disabled && variant !== "primary";

	const iconNode = icon ? (
		<Icon color={look.label} name={icon} size={isPill ? 12 : 18} />
	) : null;

	return (
		<Pressable
			accessibilityRole="button"
			accessibilityState={{ disabled }}
			disabled={disabled}
			onPress={onPress}
			style={({ pressed }) => [
				styles.base,
				styles[variant],
				{
					backgroundColor: pressed && !disabled ? look.pressed : look.rest,
					borderColor: look.border,
					borderRadius: t.brand.radii.pill,
					borderWidth: look.borderWidth,
					opacity: dimmed ? 0.5 : 1,
				},
				style,
			]}
		>
			{icon && iconPosition === "leading" ? iconNode : null}
			<Text
				style={[
					isPill ? t.brand.typography.chip : t.brand.typography.button,
					{ color: look.label },
				]}
			>
				{label}
			</Text>
			{icon && iconPosition === "trailing" ? iconNode : null}
		</Pressable>
	);
}

/**
 * Sizes are `minHeight` + vertical padding, never a fixed `height`. A fixed
 * height clips the label at large Dynamic Type sizes — the same defect Codex
 * flagged on the home hero CTA in PR #52, which this file still had in five
 * places.
 *
 * The padding is set so the intrinsic height at default type stays exactly
 * what it was (button label is 15/20, chip 11/14), so nothing moves for most
 * users; the box only grows once the text genuinely needs the room.
 */
const styles = StyleSheet.create({
	base: {
		alignItems: "center",
		flexDirection: "row",
		gap: 6,
		justifyContent: "center",
	},
	outline: {
		alignSelf: "center",
		minHeight: 48,
		paddingHorizontal: 20,
		paddingVertical: 12,
	},
	pill: {
		alignSelf: "flex-start",
		minHeight: 32,
		paddingHorizontal: 12,
		paddingVertical: 6,
	},
	primary: {
		minHeight: 56,
		paddingHorizontal: 20,
		paddingVertical: 16,
		width: "100%",
	},
	solid: {
		alignSelf: "center",
		minHeight: 48,
		paddingHorizontal: 20,
		paddingVertical: 12,
	},
	wide: {
		minHeight: 56,
		paddingHorizontal: 20,
		paddingVertical: 16,
		width: "100%",
	},
});
