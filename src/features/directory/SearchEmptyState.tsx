import { View, Text, StyleSheet } from "react-native";
import { useTheme } from "@/theme/ThemeProvider";
import { Icon } from "@/components/ui/Icon";
import { Button } from "@/components/ui/Button";

interface SearchEmptyStateProps {
  onAskCommunity: () => void;
}

/**
 * Registry search "no results" state: a file-question icon, a Fraunces
 * heading (rebrand, design.md §E2), a full sentence of guidance, and an
 * "Ask the Community" button. Top-aligned under the search bar, centered
 * horizontally.
 */
export function SearchEmptyState({ onAskCommunity }: SearchEmptyStateProps) {
  const t = useTheme();
  return (
    <View style={styles.wrap}>
      <Icon name="fileQuestion" size={32} color={t.brand.colors.clay} />
      <View style={styles.text}>
        <Text
          style={[
            styles.heading,
            { fontFamily: t.brand.fonts.display, color: t.brand.colors.text },
          ]}
        >
          No results
        </Text>
        <Text
          style={[
            t.brand.typography.body,
            styles.body,
            { color: t.brand.colors.textSoft },
          ]}
        >
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
  // Fraunces 700 24/1.25, slight negative tracking (brand displayM metrics).
  heading: {
    fontSize: 24,
    lineHeight: 30,
    letterSpacing: -0.24,
    textAlign: "center",
  },
  body: { textAlign: "center" },
});
