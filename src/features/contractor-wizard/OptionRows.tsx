import { View, Text, Pressable, StyleSheet } from "react-native";
import {
  Controller,
  type Control,
  type FieldPath,
  type FieldValues,
} from "react-hook-form";
import { useTheme } from "@/theme/ThemeProvider";
import { StrokedText } from "@/components/ui/StrokedText";

interface OptionRowsProps<T extends FieldValues> {
  control: Control<T>;
  name: FieldPath<T>;
  label: string;
  /** value stored in the form; label shown to the user */
  options: readonly { value: string; label: string }[];
}

/**
 * Inline single-select (radio) rows on brand tokens — used for the wizard's
 * dropdown-equivalent questions. Inline instead of a modal picker: options
 * are few, and a flat list is one tap and screen-reader friendly.
 */
export function OptionRows<T extends FieldValues>({
  control,
  name,
  label,
  options,
}: OptionRowsProps<T>) {
  const t = useTheme();
  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <View style={styles.block}>
          <StrokedText
            style={[
              t.brand.typography.bodySemi,
              { color: t.brand.colors.text },
            ]}
          >
            {label}
          </StrokedText>
          <View style={styles.rows}>
            {options.map((opt) => {
              const selected = field.value === opt.value;
              return (
                <Pressable
                  key={opt.value}
                  accessibilityRole="radio"
                  accessibilityState={{ checked: selected }}
                  accessibilityLabel={opt.label}
                  onPress={() => field.onChange(opt.value)}
                  style={[
                    styles.row,
                    {
                      borderColor: selected
                        ? t.brand.colors.clay
                        : t.brand.colors.line,
                      backgroundColor: selected
                        ? t.brand.colors.peachSoft
                        : t.brand.colors.surface,
                      borderRadius: t.brand.radii.md,
                    },
                  ]}
                >
                  <View
                    style={[
                      styles.dot,
                      { borderColor: t.brand.colors.clay },
                      selected && { backgroundColor: t.brand.colors.clay },
                    ]}
                  />
                  <Text
                    style={[
                      t.brand.typography.body,
                      styles.rowLabel,
                      { color: t.brand.colors.text },
                    ]}
                  >
                    {opt.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
          {fieldState.error ? (
            <StrokedText
              style={[t.brand.typography.caption, { color: t.colors.error }]}
            >
              {fieldState.error.message ?? "Required"}
            </StrokedText>
          ) : null}
        </View>
      )}
    />
  );
}

const styles = StyleSheet.create({
  block: { gap: 8 },
  rows: { gap: 8 },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderWidth: 1,
    paddingVertical: 12,
    paddingHorizontal: 14,
  },
  rowLabel: { flex: 1 },
  dot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2,
  },
});
