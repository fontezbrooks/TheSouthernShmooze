import { type ReactNode } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '@/theme/ThemeProvider';

interface FormFieldProps {
  label: string;
  required?: boolean;
  error?: string;
  children: ReactNode;
}

/** Label + required marker + child control + inline error message. */
export function FormField({ label, required, error, children }: FormFieldProps) {
  const t = useTheme();
  return (
    <View style={styles.wrap}>
      <Text style={[t.typography.label, styles.label]}>
        {label}
        {required ? <Text style={{ color: t.colors.accent }}> *</Text> : null}
      </Text>
      {children}
      {error ? (
        <Text
          accessibilityLiveRegion="polite"
          style={[t.typography.caption, { color: t.colors.accent }]}
        >
          {error}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 6 },
  label: { marginBottom: 2 },
});
