import { Pressable, View, Text, StyleSheet } from 'react-native';
import { Controller, type Control } from 'react-hook-form';
import { useTheme } from '@/theme/ThemeProvider';
import type { BudgetValue } from '@/lib/database';
import type { LeadFormValues } from '../leadSchema';
import { BUDGET_OPTIONS } from '../leadSchema';
import { FormField } from './FormField';

interface BudgetCheckboxGroupProps {
  control: Control<LeadFormValues>;
  label: string;
}

/** Multi-select budget checkboxes (matches the site's checkbox group). */
export function BudgetCheckboxGroup({ control, label }: BudgetCheckboxGroupProps) {
  const t = useTheme();
  return (
    <Controller
      control={control}
      name="budget"
      render={({ field, fieldState }) => {
        const selected: BudgetValue[] = field.value ?? [];
        const toggle = (value: BudgetValue) => {
          // Immutable update: add or remove from the selection.
          const next = selected.includes(value)
            ? selected.filter((v) => v !== value)
            : [...selected, value];
          field.onChange(next);
        };
        return (
          <FormField label={label} error={fieldState.error?.message}>
            <View style={styles.group}>
              {BUDGET_OPTIONS.map((opt) => {
                const checked = selected.includes(opt.value);
                return (
                  <Pressable
                    key={opt.value}
                    onPress={() => toggle(opt.value)}
                    accessibilityRole="checkbox"
                    accessibilityState={{ checked }}
                    accessibilityLabel={opt.label}
                    style={styles.row}
                  >
                    <View
                      style={[
                        styles.box,
                        {
                          borderColor: checked ? t.colors.text : t.colors.line,
                          backgroundColor: checked ? t.colors.text : t.colors.surface,
                        },
                      ]}
                    >
                      {checked ? <Text style={styles.check}>✓</Text> : null}
                    </View>
                    <Text style={t.typography.body}>{opt.label}</Text>
                  </Pressable>
                );
              })}
            </View>
          </FormField>
        );
      }}
    />
  );
}

const styles = StyleSheet.create({
  group: { gap: 10 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 4 },
  box: {
    width: 22,
    height: 22,
    borderWidth: 1,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  check: { color: '#ffffff', fontSize: 14, lineHeight: 16, fontWeight: '700' },
});
