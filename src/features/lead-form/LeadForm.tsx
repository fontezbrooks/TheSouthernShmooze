import { View, Text, StyleSheet, TextInput } from 'react-native';
import { Controller } from 'react-hook-form';
import { useTheme } from '@/theme/ThemeProvider';
import { Button } from '@/components/ui/Button';
import { useLeadForm } from './useLeadForm';
import { TextField } from './fields/TextField';
import { BudgetSelect } from './fields/BudgetSelect';
import { DateField } from './fields/DateField';
import { FileField } from './fields/FileField';

/** The Concierge lead form — label-inside fields, single-select budget, Button Full submit. */
export function LeadForm() {
  const t = useTheme();
  const { form, status, errorMessage, onSubmit, reset } = useLeadForm();
  const { control } = form;

  if (status === 'success') {
    return (
      <View style={styles.success} accessibilityLiveRegion="polite">
        <Text style={t.typography.displayXS}>Thanks — we got it!</Text>
        <Text style={t.typography.body}>We&apos;ll be in touch soon about your project.</Text>
        <Button label="Submit another" variant="pill" tone="rust" onPress={reset} />
      </View>
    );
  }

  const submitting = status === 'submitting';

  return (
    <View style={styles.form}>
      <TextField control={control} name="firstName" label="First Name" required autoComplete="name" />
      <TextField control={control} name="lastName" label="Last Name" required autoComplete="name" />
      <TextField
        control={control}
        name="email"
        label="Email"
        icon="mail"
        required
        keyboardType="email-address"
        autoCapitalize="none"
        autoComplete="email"
      />
      <TextField
        control={control}
        name="phone"
        label="Phone"
        icon="phone"
        required
        keyboardType="phone-pad"
        autoComplete="tel"
      />
      <TextField control={control} name="address" label="Address" icon="house" required autoComplete="street-address" />

      <BudgetSelect control={control} label="Budget" />
      <DateField control={control} label="Project Start Date" />

      <TextField
        control={control}
        name="projectDetails"
        label="Tell us what you're looking for…"
        topLabel="Project Details"
        required
        multiline
      />

      <FileField control={control} label="Add a File" />

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
            autoCorrect={false}
          />
        )}
      />

      {status === 'error' && errorMessage ? (
        <View style={[styles.banner, { borderColor: t.colors.rust }]} accessibilityLiveRegion="assertive">
          <Text style={[t.typography.body, { color: t.colors.rust }]}>{errorMessage}</Text>
        </View>
      ) : null}

      <Button
        label={submitting ? 'Submitting…' : 'Submit'}
        variant="primary"
        tone="rust"
        onPress={onSubmit}
        disabled={submitting}
        style={styles.submit}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  form: { gap: 16 },
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
