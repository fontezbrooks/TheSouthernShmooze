import { View, Text, StyleSheet, TextInput } from 'react-native';
import { Controller } from 'react-hook-form';
import { useTheme } from '@/theme/ThemeProvider';
import { Button } from '@/components/ui/Button';
import { useLeadForm } from './useLeadForm';
import { TextField } from './fields/TextField';
import { BudgetCheckboxGroup } from './fields/BudgetCheckboxGroup';
import { DateField } from './fields/DateField';
import { FileField } from './fields/FileField';

/** The "Let's Plan Something Awesome" lead form. */
export function LeadForm() {
  const t = useTheme();
  const { form, status, errorMessage, onSubmit, reset } = useLeadForm();
  const { control } = form;

  if (status === 'success') {
    return (
      <View style={styles.success} accessibilityLiveRegion="polite">
        <Text style={t.typography.h2}>Thanks — we got it!</Text>
        <Text style={t.typography.body}>
          We&apos;ll be in touch soon about your project.
        </Text>
        <Button label="Submit another" variant="secondary" onPress={reset} />
      </View>
    );
  }

  const submitting = status === 'submitting';

  return (
    <View style={styles.form}>
      <View style={styles.row}>
        <View style={styles.col}>
          <TextField control={control} name="firstName" label="First Name" required autoComplete="name" />
        </View>
        <View style={styles.col}>
          <TextField control={control} name="lastName" label="Last Name" required autoComplete="name" />
        </View>
      </View>

      <TextField
        control={control}
        name="email"
        label="Email"
        required
        keyboardType="email-address"
        autoCapitalize="none"
        autoComplete="email"
      />
      <TextField
        control={control}
        name="phone"
        label="Phone"
        required
        keyboardType="phone-pad"
        autoComplete="tel"
      />
      <TextField control={control} name="address" label="Address" required autoComplete="street-address" />

      <BudgetCheckboxGroup control={control} label="Budget" />
      <DateField control={control} label="Project start date" />

      <TextField
        control={control}
        name="projectDetails"
        label="Project Details"
        required
        multiline
        placeholder="Tell us what you need help with…"
      />

      <FileField control={control} label="File Upload" />

      {/* Honeypot — visually hidden; bots fill it, humans never see it. */}
      <Controller
        control={control}
        name="company"
        render={({ field }) => (
          <TextInput
            value={field.value ?? ''}
            onChangeText={field.onChange}
            style={styles.honeypot}
            accessibilityElementsHidden
            importantForAccessibility="no-hide-descendants"
            autoComplete="off"
            // eslint-disable-next-line jsx-a11y/no-autofocus
            autoCorrect={false}
          />
        )}
      />

      {status === 'error' && errorMessage ? (
        <View style={[styles.banner, { borderColor: t.colors.accent }]} accessibilityLiveRegion="assertive">
          <Text style={[t.typography.body, { color: t.colors.accent }]}>{errorMessage}</Text>
        </View>
      ) : null}

      <Button
        label={submitting ? 'Submitting…' : 'Submit'}
        variant="primary"
        onPress={onSubmit}
        disabled={submitting}
        style={styles.submit}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  form: { gap: 16 },
  row: { flexDirection: 'row', gap: 12 },
  col: { flex: 1 },
  submit: { marginTop: 4 },
  banner: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
  },
  success: {
    gap: 12,
    paddingVertical: 24,
    alignItems: 'flex-start',
  },
  honeypot: {
    position: 'absolute',
    width: 1,
    height: 1,
    opacity: 0,
    left: -9999,
  },
});
