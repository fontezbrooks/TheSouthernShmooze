import { TextInput, Text, StyleSheet, type KeyboardTypeOptions } from 'react-native';
import { Controller, type Control, type FieldPath } from 'react-hook-form';
import { useTheme } from '@/theme/ThemeProvider';
import type { IconName } from '@/components/ui/Icon';
import type { LeadFormValues } from '../leadSchema';
import { InputContainer } from './InputContainer';

interface TextFieldProps {
  control: Control<LeadFormValues>;
  name: FieldPath<LeadFormValues>;
  /** Used as the placeholder (Figma puts the label inside the field). */
  label: string;
  /** Small label shown above the input (multiline fields). */
  topLabel?: string;
  icon?: IconName;
  required?: boolean;
  keyboardType?: KeyboardTypeOptions;
  autoCapitalize?: 'none' | 'sentences' | 'words';
  autoComplete?: 'email' | 'tel' | 'name' | 'street-address' | 'off';
  multiline?: boolean;
  placeholder?: string;
}

/** Controlled label-inside text input (name/email/phone/address/details). */
export function TextField({
  control,
  name,
  label,
  topLabel,
  icon,
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
        <InputContainer
          icon={icon}
          error={fieldState.error?.message}
          align={multiline ? 'top' : 'center'}
          minHeight={multiline ? 131 : 58}
        >
          {topLabel ? (
            <Text style={[t.typography.captionSemi, { color: t.colors.muted, marginBottom: 4 }]}>{topLabel}</Text>
          ) : null}
          <TextInput
            value={typeof field.value === 'string' ? field.value : ''}
            onChangeText={field.onChange}
            onBlur={field.onBlur}
            keyboardType={keyboardType}
            autoCapitalize={autoCapitalize}
            autoComplete={autoComplete}
            multiline={multiline}
            placeholder={placeholder ?? label}
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
