import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  StyleSheet,
} from "react-native";
import { useTheme } from "@/theme/ThemeProvider";
import { Button } from "@/components/ui/Button";
import type { BudgetBand, SwipeTask, Timing } from "./swipeTypes";

const SUGGESTED = [
  "Landscaping",
  "Roofing",
  "Plumbing",
  "Electrical",
  "Cleaning",
  "HVAC",
  "Painting",
  "Catering",
] as const;

const BUDGETS: { value: BudgetBand; label: string }[] = [
  { value: "lt_1000", label: "< $1,000" },
  { value: "1000_5000", label: "$1k–$5k" },
  { value: "gt_5000", label: "> $5,000" },
];

const TIMINGS: { value: Timing; label: string }[] = [
  { value: "asap", label: "ASAP" },
  { value: "this_week", label: "This week" },
  { value: "flexible", label: "Flexible" },
];

const RADII = [10, 25, 50] as const;

interface TaskIntakeProps {
  onSubmit: (task: SwipeTask) => void;
  /** Prefill the fields (used by the Filters sheet to edit an existing search). */
  initial?: SwipeTask | null;
  heading?: string;
  submitLabel?: string;
}

/** Task-first intake: state a need (keyword + filters), then swipe providers. Reused by
 * the Filters sheet to change an in-progress search. */
export function TaskIntake({
  onSubmit,
  initial = null,
  heading = "What do you need?",
  submitLabel = "Find matches",
}: TaskIntakeProps) {
  const t = useTheme();
  const [keyword, setKeyword] = useState(initial?.keyword ?? "");
  const [radiusKm, setRadiusKm] = useState<number>(initial?.radiusKm ?? 25);
  const [budget, setBudget] = useState<BudgetBand | null>(
    initial?.budget ?? null,
  );
  const [timing, setTiming] = useState<Timing | null>(initial?.timing ?? null);

  const trimmed = keyword.trim();

  const submit = () => {
    if (!trimmed) return;
    onSubmit({
      keyword: trimmed,
      originLat: initial?.originLat ?? null,
      originLng: initial?.originLng ?? null,
      radiusKm,
      budget,
      timing,
    });
  };

  const Chip = ({
    label,
    selected,
    onPress,
  }: {
    label: string;
    selected: boolean;
    onPress: () => void;
  }) => (
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
        {SUGGESTED.map((s) => (
          <Chip
            key={s}
            label={s}
            selected={trimmed.toLowerCase() === s.toLowerCase()}
            onPress={() => setKeyword(s)}
          />
        ))}
      </View>

      <Text style={[t.typography.captionSemi, { color: t.colors.muted }]}>
        Within
      </Text>
      <View style={styles.chips}>
        {RADII.map((r) => (
          <Chip
            key={r}
            label={`${r} km`}
            selected={radiusKm === r}
            onPress={() => setRadiusKm(r)}
          />
        ))}
      </View>

      <Text style={[t.typography.captionSemi, { color: t.colors.muted }]}>
        Budget (optional)
      </Text>
      <View style={styles.chips}>
        {BUDGETS.map((b) => (
          <Chip
            key={b.value}
            label={b.label}
            selected={budget === b.value}
            onPress={() => setBudget(budget === b.value ? null : b.value)}
          />
        ))}
      </View>

      <Text style={[t.typography.captionSemi, { color: t.colors.muted }]}>
        Timing (optional)
      </Text>
      <View style={styles.chips}>
        {TIMINGS.map((tm) => (
          <Chip
            key={tm.value}
            label={tm.label}
            selected={timing === tm.value}
            onPress={() => setTiming(timing === tm.value ? null : tm.value)}
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
  chip: {
    borderWidth: 1,
    paddingHorizontal: 14,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  submit: { marginTop: 12 },
});
