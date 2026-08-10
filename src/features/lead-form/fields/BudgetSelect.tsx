import { useState } from "react";
import { Pressable, Text, View, Modal, StyleSheet } from "react-native";
import {
  Controller,
  type Control,
  type FieldPath,
  type FieldValues,
} from "react-hook-form";
import { useTheme } from "@/theme/ThemeProvider";
import { Icon } from "@/components/ui/Icon";
import type { BudgetValue } from "@/lib/database";
import { InputContainer } from "./InputContainer";

export const BUDGET_OPTIONS: ReadonlyArray<{
  value: BudgetValue;
  label: string;
}> = [
  { value: "lt_1000", label: "< $1,000" },
  { value: "1000_5000", label: "$1,000 – $5,000" },
  { value: "gt_5000", label: "> $5,000" },
];

interface BudgetSelectProps<T extends FieldValues> {
  control: Control<T>;
  name: FieldPath<T>;
  label: string;
}

/** Single-select budget dropdown (dollar icon + chevron) per Figma. */
export function BudgetSelect<T extends FieldValues>({
  control,
  name,
  label,
}: BudgetSelectProps<T>) {
  const t = useTheme();
  const [open, setOpen] = useState(false);

  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => {
        const selected = BUDGET_OPTIONS.find((o) => o.value === field.value);
        const choose = (value: BudgetValue) => {
          field.onChange(value);
          setOpen(false);
        };
        return (
          <>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={label}
              onPress={() => setOpen(true)}
            >
              <InputContainer
                label={label}
                icon="dollar"
                floated={open || !!selected}
                error={fieldState.error?.message}
                trailing={
                  <Icon name="chevronDown" size={18} color={t.colors.muted} />
                }
              >
                <Text style={[t.typography.body, { color: t.colors.text }]}>
                  {selected ? selected.label : ""}
                </Text>
              </InputContainer>
            </Pressable>

            <Modal
              visible={open}
              transparent
              animationType="fade"
              onRequestClose={() => setOpen(false)}
            >
              <Pressable style={styles.backdrop} onPress={() => setOpen(false)}>
                <View
                  style={[styles.sheet, { backgroundColor: t.colors.surface }]}
                >
                  {BUDGET_OPTIONS.map((opt) => {
                    const isSel = opt.value === field.value;
                    return (
                      <Pressable
                        key={opt.value}
                        accessibilityRole="button"
                        accessibilityState={{ selected: isSel }}
                        onPress={() => choose(opt.value)}
                        style={styles.option}
                      >
                        <Text
                          style={[
                            t.typography.body,
                            isSel && { color: t.colors.rust },
                          ]}
                        >
                          {opt.label}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              </Pressable>
            </Modal>
          </>
        );
      }}
    />
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  sheet: {
    borderRadius: 12,
    paddingVertical: 8,
  },
  option: {
    paddingVertical: 14,
    paddingHorizontal: 20,
  },
});
