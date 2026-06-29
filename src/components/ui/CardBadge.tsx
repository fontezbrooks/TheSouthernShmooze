import { View, StyleSheet } from "react-native";
import { useTheme } from "@/theme/ThemeProvider";
import { Icon, type IconName } from "./Icon";

/**
 * 20×20 borderless badge holding a 16px rust glyph — the reviews (thumbsUp) and
 * discount (sale) markers in the horizontal directory card's top badge row
 * (Figma "Business Card/Atoms/Reviews Tag" + "Discount Tag"). Presentational.
 */
export function CardBadge({ icon }: { icon: IconName }) {
  const t = useTheme();
  return (
    <View style={styles.badge}>
      <Icon name={icon} size={16} color={t.colors.rust} />
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    width: 20,
    height: 20,
    alignItems: "center",
    justifyContent: "center",
  },
});
