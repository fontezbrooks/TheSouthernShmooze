import { View, Text, StyleSheet } from "react-native";
import { useTheme } from "@/theme/ThemeProvider";

interface ConfidenceBadgeProps {
  confidence: number;
  isFeatured?: boolean;
}

/** "87% match" pill + an optional "Featured" tag (always shows the TRUE confidence). */
export function ConfidenceBadge({
  confidence,
  isFeatured = false,
}: ConfidenceBadgeProps) {
  const t = useTheme();
  return (
    <View style={styles.row}>
      <View
        style={[
          styles.pill,
          { backgroundColor: t.colors.rust, borderRadius: t.radii.pill },
        ]}
      >
        <Text style={[t.typography.captionSemi, { color: t.colors.white }]}>
          {Math.round(confidence)}% match
        </Text>
      </View>
      {isFeatured ? (
        <View
          style={[
            styles.pill,
            { backgroundColor: t.colors.yellow200, borderRadius: t.radii.pill },
          ]}
        >
          <Text style={[t.typography.captionSemi, { color: t.colors.text }]}>
            Featured
          </Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", gap: 6 },
  pill: { paddingHorizontal: 10, paddingVertical: 4 },
});
