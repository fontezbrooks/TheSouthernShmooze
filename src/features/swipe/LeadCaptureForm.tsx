import { useState } from "react";
import { View, Text, StyleSheet, ActivityIndicator } from "react-native";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTheme } from "@/theme/ThemeProvider";
import { Button } from "@/components/ui/Button";
import { TextField } from "@/features/lead-form/fields/TextField";
import { BudgetSelect } from "@/features/lead-form/fields/BudgetSelect";
import { swipeRepository, type SwipeRepository } from "./swipeRepository";
import {
  prefillFromTask,
  swipeContactSchema,
  type SwipeContactValues,
} from "./contactSchema";
import type { SeekerContact, SwipeTask } from "./swipeTypes";

interface LeadCaptureFormProps {
  sessionToken: string;
  task: SwipeTask | null;
  taskId: string | null;
  /** Remembered contact (name/email/phone) to prefill for a returning Seeker. */
  contact: SeekerContact | null;
  /** Saves the contact, then hands the verified contact up (the caller sends the lead). */
  onSubmitted: (contact: SeekerContact) => void | Promise<void>;
  onCancel: () => void;
  repo?: SwipeRepository;
}

/**
 * The Match contact form (extracted from the old LeadCaptureModal): contact +
 * budget + details, prefilled from the task / remembered contact. Mounts fresh
 * per page visit, so defaults ARE the prefill — no reset effect needed.
 */
export function LeadCaptureForm({
  sessionToken,
  task,
  taskId,
  contact,
  onSubmitted,
  onCancel,
  repo = swipeRepository,
}: LeadCaptureFormProps) {
  const t = useTheme();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<SwipeContactValues>({
    resolver: zodResolver(swipeContactSchema),
    defaultValues: prefillFromTask(task, contact),
    mode: "onTouched",
  });

  const submit = form.handleSubmit(async (values) => {
    const fullName =
      `${values.firstName.trim()} ${values.lastName.trim()}`.trim();
    setBusy(true);
    setError(null);
    const res = await repo.saveContact(sessionToken, taskId, {
      name: fullName,
      email: values.email.trim(),
      phone: values.phone.trim() || null,
      budget: values.budget ?? null,
      details: values.projectDetails.trim() || null,
    });
    if (res.ok) {
      // Stay busy while the caller sends the lead / navigates away.
      await onSubmitted({
        name: fullName,
        email: values.email.trim(),
        phone: values.phone.trim() || null,
        verified: true,
      });
      setBusy(false);
    } else {
      setBusy(false);
      setError(res.error);
    }
  });

  return (
    <View style={styles.formContent}>
      <TextField
        control={form.control}
        name="firstName"
        label="First Name"
        required
        autoComplete="name"
      />
      <TextField
        control={form.control}
        name="lastName"
        label="Last Name"
        required
        autoComplete="name"
      />
      <TextField
        control={form.control}
        name="email"
        label="Email"
        icon="mail"
        required
        keyboardType="email-address"
        autoCapitalize="none"
        autoComplete="email"
      />
      <TextField
        control={form.control}
        name="phone"
        label="Phone"
        icon="phoneFilled"
        required
        keyboardType="phone-pad"
        autoComplete="tel"
      />
      <BudgetSelect control={form.control} name="budget" label="Budget" />
      <TextField
        control={form.control}
        name="projectDetails"
        label="Project Details"
        placeholder="Tell them what you're looking for…"
        required
        multiline
      />

      {error ? (
        <Text style={[t.typography.caption, { color: t.colors.error }]}>
          {error}
        </Text>
      ) : null}

      {busy ? (
        <ActivityIndicator color={t.colors.rust} />
      ) : (
        <Button label="Send request" variant="primary" onPress={submit} />
      )}
      <Button label="Cancel" variant="pill" tone="black" onPress={onCancel} />
    </View>
  );
}

const styles = StyleSheet.create({
  formContent: { gap: 14 },
});
