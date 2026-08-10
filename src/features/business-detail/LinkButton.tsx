import { Pressable, Text, StyleSheet } from "react-native";
import { useTheme } from "@/theme/ThemeProvider";
import { Icon, type IconName } from "@/components/ui/Icon";

interface LinkButtonProps {
  icon: IconName;
  label: string;
  onPress: () => void;
}

/**
 * External-link pill (P6): brand/Feather icon + short label on a cream pill
 * with the hard shadow — one visual for website, socials, and brand links.
 */
export function LinkButton({ icon, label, onPress }: LinkButtonProps) {
  const t = useTheme();
  return (
    <Pressable
      accessibilityRole="link"
      accessibilityLabel={label}
      onPress={onPress}
      style={[
        styles.pill,
        {
          backgroundColor: t.brand.colors.surface,
          borderColor: t.brand.colors.line,
          borderRadius: t.brand.radii.pill,
        },
        t.brand.shadow.card,
      ]}
    >
      <Icon name={icon} size={18} color={t.brand.colors.clay} />
      <Text
        style={[t.brand.typography.chip, { color: t.brand.colors.text }]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    height: 40,
    paddingHorizontal: 14,
    borderWidth: 2,
  },
});
