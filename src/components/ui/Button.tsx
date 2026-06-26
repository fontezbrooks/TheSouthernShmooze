import {
  Pressable,
  Text,
  View,
  StyleSheet,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import { useTheme } from "@/theme/ThemeProvider";
import { Icon, type IconName } from "./Icon";

/**
 * Figma button set:
 * - `primary` → "Button Full": rust fill, 3px rustDark border, hard shadow, white label (form submit).
 * - `pill`    → "Button S":    cream fill, 32h, hugs content; border/shadow per `tone` (banner CTAs, card phone).
 * - `wide`    → "Button L":    cream fill, 56h, full width, no border/shadow ("Add a File").
 */
export type ButtonVariant = "primary" | "pill" | "wide";

/** Border + shadow + label color family for `pill` buttons. */
export type ButtonTone = "rust" | "black" | "none";

interface ButtonProps {
  label: string;
  onPress?: () => void;
  variant?: ButtonVariant;
  tone?: ButtonTone;
  icon?: IconName;
  iconPosition?: "leading" | "trailing";
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
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

  const isPrimary = variant === "primary";
  const isPill = variant === "pill";

  // Resolve surface, border, shadow, and label color.
  const toneColor =
    tone === "rust"
      ? t.colors.rust
      : tone === "black"
        ? t.colors.black
        : t.colors.text;

  // Primary has an explicit disabled look (grey fill/border/shadow); other
  // variants fall back to a simple opacity dim.
  const disabledPrimary = disabled && isPrimary;

  const bg = disabledPrimary
    ? t.colors.inputBorder
    : isPrimary
      ? t.colors.rust
      : t.colors.bg;
  const labelColor = isPrimary ? t.colors.white : toneColor;
  const labelStyle = isPrimary
    ? t.typography.bodySemibold
    : isPill
      ? t.typography.captionSemi
      : t.typography.bodySemibold;

  const bordered = isPrimary || (isPill && tone !== "none");
  const borderColor = disabledPrimary
    ? t.colors.neutral500
    : isPrimary
      ? t.colors.rustDark
      : tone === "black"
        ? t.colors.black
        : t.colors.rustDark;
  const shadowed = isPrimary || (isPill && tone !== "none");
  const shadowStyle = disabledPrimary
    ? t.shadow.hardNeutral
    : tone === "black"
      ? t.shadow.hardBlack
      : t.shadow.hard;

  const iconNode = icon ? (
    <Icon name={icon} size={isPill ? 12 : 18} color={labelColor} />
  ) : null;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.base,
        isPrimary && styles.primary,
        isPill ? styles.pill : styles.wide,
        {
          backgroundColor: bg,
          borderRadius: t.radii.button,
          borderWidth: bordered ? (isPrimary ? 3 : 2) : 0,
          borderColor: bordered ? borderColor : "transparent",
          opacity: disabledPrimary ? 1 : disabled ? 0.5 : pressed ? 0.85 : 1,
        },
        shadowed && shadowStyle,
        style,
      ]}
    >
      {icon && iconPosition === "leading" ? iconNode : null}
      <Text style={[labelStyle, { color: labelColor }]}>{label}</Text>
      {icon && iconPosition === "trailing" ? iconNode : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  primary: {
    height: 56,
    width: "100%",
    paddingHorizontal: 16,
  },
  pill: {
    height: 32,
    paddingHorizontal: 12,
    alignSelf: "flex-start",
  },
  wide: {
    height: 56,
    width: "100%",
    paddingHorizontal: 16,
  },
});

/** Re-exported for callers that only need the View type. */
export type { ViewStyle };
