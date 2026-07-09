import { ScrollView, Text, Pressable, StyleSheet } from "react-native";
import { useTheme } from "@/theme/ThemeProvider";
import { SUGGESTED_CATEGORIES } from "./categories";

interface CategoryChipProps {
  label: string;
  selected: boolean;
  onPress?: () => void;
}

/**
 * Pill chip — the visual extracted from TaskIntake's private Chip so the
 * Directory tags row, the swipe intake, and the contact page share one look.
 */
export function CategoryChip({ label, selected, onPress }: CategoryChipProps) {
  const t = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={onPress}
      style={[
        styles.chip,
        {
          borderRadius: t.radii.pill,
          backgroundColor: selected ? t.colors.rust : t.colors.surface,
          borderColor: selected ? t.colors.rustDark : t.colors.inputBorder,
        },
      ]}
    >
      <Text
        style={[
          t.typography.captionSemi,
          { color: selected ? t.colors.white : t.colors.text },
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

interface CategoryChipsProps {
  /** Current query/keyword — the chip matching it (case-insensitive) renders selected. */
  selected: string;
  /** Tap handler — runs that category as the search/keyword. */
  onSelect: (category: string) => void;
  categories?: readonly string[];
}

/** Horizontal scrolling row of provider-type chips (D4 "tags"). */
export function CategoryChips({
  selected,
  onSelect,
  categories = SUGGESTED_CATEGORIES,
}: CategoryChipsProps) {
  const current = selected.trim().toLowerCase();
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
      contentContainerStyle={styles.row}
    >
      {categories.map((category) => (
        <CategoryChip
          key={category}
          label={category}
          selected={current === category.toLowerCase()}
          onPress={() => onSelect(category)}
        />
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  row: { gap: 8, paddingRight: 16 },
  chip: {
    borderWidth: 1,
    paddingHorizontal: 14,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
  },
});
