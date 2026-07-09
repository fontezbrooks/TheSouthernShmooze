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
          backgroundColor: t.colors.surface,
          borderColor: t.colors.rustDark,
          borderRadius: t.radii.pill,
        },
        t.shadow.hard,
      ]}
    >
      <Icon name={icon} size={18} color={t.colors.rustDark} />
      <Text style={[t.typography.captionSemi, { color: t.colors.text }]}>
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
