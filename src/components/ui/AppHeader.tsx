import { View, Pressable, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "@/theme/ThemeProvider";
import { Icon } from "./Icon";
// Figma-exported wordmark (source of truth) — transparent vector, imported as a
// component via react-native-svg-transformer.
import ShmoozeLogo from "../../../assets/ShmoozeLogo-Horizontal.svg";

interface AppHeaderProps {
  /** Show the back arrow (Concierge); hidden on Home. */
  showBack?: boolean;
  onBack?: () => void;
}

// Figma ShmoozeLogo-Horizontal viewBox is 264×17.
const LOGO_WIDTH = 264;
const LOGO_HEIGHT = 17;
// Comfortable, symmetric tap slots so the logo stays centered.
const SLOT = 44;

/**
 * Cream top bar with the centered Shmooze wordmark (Figma horizontal logo asset)
 * and an optional back arrow with a 44×44 tap target. Extends cream up into the
 * status bar via the top safe-area inset.
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
          borderBottomColor: t.colors.divider,
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
            hitSlop={12}
            onPress={onBack}
            style={styles.backHit}
          >
            <Icon name="arrowLeft" size={30} color={t.colors.text} />
          </Pressable>
        ) : null}
      </View>
      <ShmoozeLogo
        width={LOGO_WIDTH}
        height={LOGO_HEIGHT}
        accessibilityRole="image"
        accessibilityLabel="The Southern Shmooze"
      />
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
  side: {
    width: SLOT,
    height: SLOT,
    alignItems: "center",
    justifyContent: "center",
  },
  backHit: {
    width: SLOT,
    height: SLOT,
    alignItems: "center",
    justifyContent: "center",
  },
});
