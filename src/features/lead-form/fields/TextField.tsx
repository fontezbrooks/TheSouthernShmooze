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
  /** Persistent inside-label (shown above the value at all times). */
  label: string;
  /** Optional example hint shown in the value row when empty. */
  placeholder?: string;
  icon?: IconName;
  /** When false, an "Optional" hint row is shown above the field. */
  required?: boolean;
  keyboardType?: KeyboardTypeOptions;
  autoCapitalize?: 'none' | 'sentences' | 'words';
  autoComplete?: 'email' | 'tel' | 'name' | 'street-address' | 'off';
  multiline?: boolean;
}

/** Controlled label-inside text input with focus (2px black border) + error states. */
export function TextField({
  control,
  name,
  label,
  placeholder,
  icon,
  required = false,
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
      render={({ field, fieldState }) => (
        <InputContainer
          label={label}
          icon={icon}
          focused={focused}
          error={fieldState.error?.message}
          optional={!required}
          align={multiline ? 'top' : 'center'}
          minHeight={multiline ? 131 : 58}
        >
          <TextInput
            value={typeof field.value === 'string' ? field.value : ''}
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
            placeholder={placeholder}
            placeholderTextColor={t.colors.muted}
            accessibilityLabel={label}
            style={[t.typography.body, multiline && styles.multiline]}
          />
        </InputContainer>
      )}
    />
  );
}

const styles = StyleSheet.create({
  multiline: {
    minHeight: 96,
    textAlignVertical: 'top',
  },
});
