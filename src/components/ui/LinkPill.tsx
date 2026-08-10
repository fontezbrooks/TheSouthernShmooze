import {
  Text,
  Pressable,
  StyleSheet,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import { useTheme } from "@/theme/ThemeProvider";

interface LinkPillProps {
  label: string;
  onPress: () => void;
  accessibilityLabel?: string;
  style?: StyleProp<ViewStyle>;
}

/**
 * Secondary navigation pill — the app's link-pill family (business-detail
 * LinkButton, FAQ tabs): surface fill, hairline `line` border, pill radius,
 * soft card shadow. Reads as a button over busy backgrounds (daisy) where a
 * bare text link disappears (owner polish round).
 */
export function LinkPill({
  label,
  onPress,
  accessibilityLabel,
  style,
}: LinkPillProps) {
  const t = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      onPress={onPress}
      style={[
        styles.pill,
        {
          backgroundColor: t.brand.colors.surface,
          borderColor: t.brand.colors.line,
          borderRadius: t.brand.radii.pill,
        },
        t.brand.shadow.card,
        style,
      ]}
    >
      <Text style={[t.brand.typography.chip, { color: t.brand.colors.text }]}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pill: {
    minHeight: 44,
    paddingHorizontal: 16,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: StyleSheet.hairlineWidth,
  },
});
