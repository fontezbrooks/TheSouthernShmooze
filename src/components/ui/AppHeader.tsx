import { View, Text, Pressable, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "@/theme/ThemeProvider";
import { Icon } from "./Icon";

interface AppHeaderProps {
  /** Show the back arrow (Concierge); hidden on Home. */
  showBack?: boolean;
  onBack?: () => void;
}

/**
 * Cream top bar with the centered Shmooze wordmark and an optional back arrow.
 * Extends cream up into the status bar via the top safe-area inset.
 * (Figma uses a horizontal logo asset; rendered here as Shrikhand text.)
 */
export function AppHeader({ showBack = false, onBack }: AppHeaderProps) {
  const t = useTheme();
  const insets = useSafeAreaInsets();
  return (
    <View
      style={[
        styles.bar,
        {
          backgroundColor: t.colors.bg,
          borderBottomColor: t.colors.rust,
          paddingTop: insets.top,
          height: 60 + insets.top,
        },
      ]}
    >
      <View style={styles.side}>
        {showBack ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Go back"
            hitSlop={8}
            onPress={onBack}
          >
            <Icon name="arrowLeft" size={18} color={t.colors.text} />
          </Pressable>
        ) : null}
      </View>
      <Text
        style={[
          styles.wordmark,
          { fontFamily: t.fonts.display, color: t.colors.text },
        ]}
        numberOfLines={1}
      >
        The Southern Shmooze
      </Text>
      <View style={styles.side} />
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    height: 60,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  side: { width: 18, alignItems: "center", justifyContent: "center" },
  wordmark: {
    fontSize: 18,
    fontStyle: "italic",
    textAlign: "center",
    flex: 1,
    marginHorizontal: 8,
  },
});
