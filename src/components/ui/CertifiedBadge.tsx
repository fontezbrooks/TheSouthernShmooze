import { View, Text, StyleSheet } from "react-native";
import { useTheme } from "@/theme/ThemeProvider";
import { Icon } from "./Icon";

interface CertifiedBadgeProps {
  /** Pill label — directory card uses "Shmooze Certified"; Home card uses "Certified". */
  label?: string;
}

/**
 * Certified pill (Figma "Business Card/Atoms/Certified"): pale-yellow fill,
 * mustard hairline + 2px mustard hard shadow, a yellow star, and a chocolate
 * label. Shared by the horizontal directory card ("Shmooze Certified") and the
 * vertical Certified-Providers card ("Certified"). Presentational only.
 */
export function CertifiedBadge({
  label = "Shmooze Certified",
}: CertifiedBadgeProps) {
  const t = useTheme();
  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: t.colors.yellow200,
          borderColor: t.colors.mustard,
          borderRadius: t.radii.pill,
        },
        t.shadow.certified,
      ]}
    >
      <Icon name="starFilled" size={12} color={t.colors.yellow} />
      <Text style={[t.typography.captionSemiXS, { color: t.colors.rustDark }]}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    gap: 4,
    height: 20,
    paddingHorizontal: 6,
    borderWidth: 1,
  },
});
