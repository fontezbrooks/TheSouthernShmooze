import { View, Text, StyleSheet } from "react-native";
import { useTheme } from "@/theme/ThemeProvider";
import { Icon } from "@/components/ui/Icon";
import { Button } from "@/components/ui/Button";

interface SearchEmptyStateProps {
  onAskCommunity: () => void;
}

/**
 * Directory search "no results" state (Figma 59:7303): a file-question icon, a
 * plain Bitter heading (NOT the Shrikhand display face), a full sentence of
 * guidance, and a rust "Ask the Community" button. Top-aligned under the search
 * bar, centered horizontally.
 */
export function SearchEmptyState({ onAskCommunity }: SearchEmptyStateProps) {
  const t = useTheme();
  return (
    <View style={styles.wrap}>
      <Icon name="fileQuestion" size={32} color={t.colors.rustDark} />
      <View style={styles.text}>
        <Text
          style={[
            styles.heading,
            { fontFamily: t.fonts.bodySemi, color: t.colors.black },
          ]}
        >
          No results
        </Text>
        <Text style={[t.typography.body, styles.body, { color: t.colors.muted }]}>
          Please try your search again or ask the community for their
          recommendations.
        </Text>
      </View>
      <Button
        variant="solid"
        label="Ask the Community"
        onPress={onAskCommunity}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: "center",
    gap: 24,
    paddingTop: 24,
    paddingBottom: 64,
    paddingHorizontal: 64,
  },
  text: { alignItems: "center", gap: 4 },
  // Header XS Bitter — Bitter SemiBold 24/1.25, slight negative tracking.
  heading: {
    fontSize: 24,
    lineHeight: 30,
    letterSpacing: -0.24,
    textAlign: "center",
  },
  body: { textAlign: "center" },
});
