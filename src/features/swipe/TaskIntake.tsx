import { useState } from "react";
import { View, Text, TextInput, ScrollView, StyleSheet } from "react-native";
import { useTheme } from "@/theme/ThemeProvider";
import { Button } from "@/components/ui/Button";
import { CategoryChip } from "@/features/providers/CategoryChips";
import { SUGGESTED_CATEGORIES } from "@/features/providers/categories";
import type { SwipeTask } from "./swipeTypes";

interface TaskIntakeProps {
  onSubmit: (task: SwipeTask) => void;
  /** Prefill the fields (used by the Filters sheet to edit an existing search). */
  initial?: SwipeTask | null;
  heading?: string;
  submitLabel?: string;
}

/**
 * Type-only intake (July 2026 round, S1/S2): just the keyword + category tags.
 * Radius/budget/timing were dropped from the UI — the task ships with the old
 * defaults so `SwipeTask` and the RPCs are untouched. Reused by the Filters
 * sheet to change an in-progress search.
 */
export function TaskIntake({
  onSubmit,
  initial = null,
  heading = "What do you need?",
  submitLabel = "Find matches",
}: TaskIntakeProps) {
  const t = useTheme();
  const [keyword, setKeyword] = useState(initial?.keyword ?? "");

  const trimmed = keyword.trim();

  const submit = () => {
    if (!trimmed) return;
    onSubmit({
      keyword: trimmed,
      originLat: initial?.originLat ?? null,
      originLng: initial?.originLng ?? null,
      radiusKm: initial?.radiusKm ?? 25,
      budget: initial?.budget ?? null,
      timing: initial?.timing ?? null,
    });
  };

  return (
    <ScrollView
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
    >
      <Text style={t.typography.displayS}>{heading}</Text>

      <TextInput
        value={keyword}
        onChangeText={setKeyword}
        placeholder="e.g. roofing, landscaping…"
        placeholderTextColor={t.colors.muted}
        autoCapitalize="none"
        style={[
          styles.input,
          t.typography.body,
          {
            borderColor: t.colors.inputBorder,
            borderRadius: t.radii.input,
            backgroundColor: t.colors.surface,
          },
        ]}
      />

      <Text style={[t.typography.captionSemi, { color: t.colors.muted }]}>
        Popular
      </Text>
      <View style={styles.chips}>
        {SUGGESTED_CATEGORIES.map((s) => (
          <CategoryChip
            key={s}
            label={s}
            selected={trimmed.toLowerCase() === s.toLowerCase()}
            onPress={() => setKeyword(s)}
          />
        ))}
      </View>

      <Button
        label={submitLabel}
        variant="primary"
        disabled={!trimmed}
        onPress={submit}
        style={styles.submit}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { padding: 16, gap: 12 },
  input: {
    borderWidth: 1,
    paddingHorizontal: 12,
    height: 48,
  },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  submit: { marginTop: 12 },
});
