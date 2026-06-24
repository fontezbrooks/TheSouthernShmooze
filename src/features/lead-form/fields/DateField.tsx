import { useState } from 'react';
import { Pressable, Text, StyleSheet, Platform } from 'react-native';
import DateTimePicker, { type DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { Controller, type Control } from 'react-hook-form';
import { useTheme } from '@/theme/ThemeProvider';
import type { LeadFormValues } from '../leadSchema';
import { FormField } from './FormField';

interface DateFieldProps {
  control: Control<LeadFormValues>;
  label: string;
}

/** Format as MM/DD/YYYY to match the site. */
function formatDate(d: Date): string {
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${mm}/${dd}/${d.getFullYear()}`;
}

/** Optional project start date with the native date picker. */
export function DateField({ control, label }: DateFieldProps) {
  const t = useTheme();
  const [show, setShow] = useState(false);

  return (
    <Controller
      control={control}
      name="projectStartDate"
      render={({ field, fieldState }) => {
        const value = field.value instanceof Date ? field.value : undefined;
        const onChange = (event: DateTimePickerEvent, date?: Date) => {
          if (Platform.OS !== 'ios') setShow(false);
          if (event.type === 'set' && date) field.onChange(date);
        };
        return (
          <FormField label={label} error={fieldState.error?.message}>
            <Pressable
              onPress={() => setShow(true)}
              accessibilityRole="button"
              accessibilityLabel={label}
              style={[
                styles.input,
                { backgroundColor: t.colors.surface, borderRadius: t.radii.input, borderColor: t.colors.line },
              ]}
            >
              <Text style={[t.typography.body, { color: value ? t.colors.text : t.colors.line }]}>
                {value ? formatDate(value) : 'mm/dd/yyyy'}
              </Text>
            </Pressable>
            {show ? (
              <DateTimePicker
                value={value ?? new Date()}
                mode="date"
                display={Platform.OS === 'ios' ? 'inline' : 'default'}
                onChange={onChange}
              />
            ) : null}
          </FormField>
        );
      }}
    />
  );
}

const styles = StyleSheet.create({
  input: {
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 12,
    minHeight: 44,
    justifyContent: 'center',
  },
});
