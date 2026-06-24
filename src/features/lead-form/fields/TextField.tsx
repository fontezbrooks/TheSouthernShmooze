import { TextInput, StyleSheet, type KeyboardTypeOptions } from 'react-native';
import { Controller, type Control, type FieldPath } from 'react-hook-form';
import { useTheme } from '@/theme/ThemeProvider';
import type { LeadFormValues } from '../leadSchema';
import { FormField } from './FormField';

interface TextFieldProps {
  control: Control<LeadFormValues>;
  name: FieldPath<LeadFormValues>;
  label: string;
  required?: boolean;
  keyboardType?: KeyboardTypeOptions;
  autoCapitalize?: 'none' | 'sentences' | 'words';
  autoComplete?: 'email' | 'tel' | 'name' | 'street-address' | 'off';
  multiline?: boolean;
  placeholder?: string;
}

/** Controlled text input. Used for name/email/phone/address and (multiline) details. */
export function TextField({
  control,
  name,
  label,
  required,
  keyboardType,
  autoCapitalize = 'sentences',
  autoComplete = 'off',
  multiline = false,
  placeholder,
}: TextFieldProps) {
  const t = useTheme();
  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <FormField label={label} required={required} error={fieldState.error?.message}>
          <TextInput
            value={typeof field.value === 'string' ? field.value : ''}
            onChangeText={field.onChange}
            onBlur={field.onBlur}
            keyboardType={keyboardType}
            autoCapitalize={autoCapitalize}
            autoComplete={autoComplete}
            multiline={multiline}
            placeholder={placeholder}
            placeholderTextColor={t.colors.line}
            accessibilityLabel={label}
            style={[
              styles.input,
              t.typography.body,
              multiline && styles.multiline,
              {
                color: t.colors.text,
                backgroundColor: t.colors.surface,
                borderRadius: t.radii.input,
                borderColor: fieldState.error ? t.colors.accent : t.colors.line,
              },
            ]}
          />
        </FormField>
      )}
    />
  );
}

const styles = StyleSheet.create({
  input: {
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
    minHeight: 44,
  },
  multiline: {
    minHeight: 110,
    paddingTop: 12,
    textAlignVertical: 'top',
  },
});
