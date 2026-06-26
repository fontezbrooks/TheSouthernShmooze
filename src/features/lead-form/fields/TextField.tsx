import { useState } from 'react';
import { TextInput, StyleSheet, type KeyboardTypeOptions } from 'react-native';
import { Controller, type Control, type FieldPath } from 'react-hook-form';
import { useTheme } from '@/theme/ThemeProvider';
import type { IconName } from '@/components/ui/Icon';
import type { LeadFormValues } from '../leadSchema';
import { InputContainer } from './InputContainer';

interface TextFieldProps {
  control: Control<LeadFormValues>;
  name: FieldPath<LeadFormValues>;
  /** Floating label (placeholder when empty, small top label when filled). */
  label: string;
  /** Example hint shown in the value row once the label has floated. */
  placeholder?: string;
  icon?: IconName;
  /** Accepted for call-site clarity; the V3 design has no "optional" affordance. */
  required?: boolean;
  keyboardType?: KeyboardTypeOptions;
  autoCapitalize?: 'none' | 'sentences' | 'words';
  autoComplete?: 'email' | 'tel' | 'name' | 'street-address' | 'off';
  multiline?: boolean;
}

/** Controlled text input with a floating label (Figma V3) + padded error. */
export function TextField({
  control,
  name,
  label,
  placeholder,
  icon,
  keyboardType,
  autoCapitalize = 'sentences',
  autoComplete = 'off',
  multiline = false,
}: TextFieldProps) {
  const t = useTheme();
  const [focused, setFocused] = useState(false);
  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => {
        const value = typeof field.value === 'string' ? field.value : '';
        const floated = multiline || focused || value.length > 0;
        return (
          <InputContainer
            label={label}
            floated={floated}
            icon={icon}
            error={fieldState.error?.message}
            multiline={multiline}
          >
            <TextInput
              value={value}
              onChangeText={field.onChange}
              onFocus={() => setFocused(true)}
              onBlur={() => {
                setFocused(false);
                field.onBlur();
              }}
              keyboardType={keyboardType}
              autoCapitalize={autoCapitalize}
              autoComplete={autoComplete}
              multiline={multiline}
              placeholder={floated ? placeholder : undefined}
              placeholderTextColor={t.colors.muted}
              accessibilityLabel={label}
              style={[t.typography.body, multiline && styles.multiline]}
            />
          </InputContainer>
        );
      }}
    />
  );
}

const styles = StyleSheet.create({
  multiline: {
    minHeight: 96,
    textAlignVertical: 'top',
  },
});
