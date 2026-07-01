import { useEffect, useState } from "react";
import { Text, ScrollView, StyleSheet, ActivityIndicator } from "react-native";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTheme } from "@/theme/ThemeProvider";
import { Button } from "@/components/ui/Button";
import { TextField } from "@/features/lead-form/fields/TextField";
import { BudgetSelect } from "@/features/lead-form/fields/BudgetSelect";
import { CenteredSheet } from "./CenteredSheet";
import { swipeRepository, type SwipeRepository } from "./swipeRepository";
import {
  prefillFromTask,
  swipeContactSchema,
  type SwipeContactValues,
} from "./contactSchema";
import type { SeekerContact, SwipeTask } from "./swipeTypes";

interface LeadCaptureModalProps {
  visible: boolean;
  sessionToken: string;
  task: SwipeTask | null;
  taskId: string | null;
  /** Remembered contact (name/email/phone) to prefill for a returning Seeker. */
  contact: SeekerContact | null;
  onClose: () => void;
  onSubmitted: (contact: SeekerContact) => void;
  repo?: SwipeRepository;
}

/**
 * First-Match gate (no account, no OTP): a Concierge-style form — trimmed to contact +
 * budget + details and prefilled from the Shmoozer onboarding / remembered contact —
 * saved once per session, after which further right-swipes send instantly.
 */
export function LeadCaptureModal({
  visible,
  sessionToken,
  task,
  taskId,
  contact,
  onClose,
  onSubmitted,
  repo = swipeRepository,
}: LeadCaptureModalProps) {
  const t = useTheme();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<SwipeContactValues>({
    resolver: zodResolver(swipeContactSchema),
    defaultValues: prefillFromTask(task, contact),
    mode: "onTouched",
  });

  // Re-prefill each time the sheet opens.
  useEffect(() => {
    if (visible) {
      form.reset(prefillFromTask(task, contact));
      setError(null);
    }
    // form is stable from RHF; task + contact drive the prefill.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible, task, contact]);

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
    setBusy(false);
    if (res.ok) {
      onSubmitted({
        name: fullName,
        email: values.email.trim(),
        phone: values.phone.trim() || null,
        verified: true,
      });
    } else {
      setError(res.error);
    }
  });

  return (
    <CenteredSheet visible={visible} onClose={onClose}>
      <ScrollView
        contentContainerStyle={styles.formContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Text style={t.typography.displayXS}>Send your details</Text>
        <Text style={[t.typography.caption, { color: t.colors.muted }]}>
          We share these with the pros you match — filled in once, then it’s one
          tap.
        </Text>

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
          <Button label="Send match" variant="primary" onPress={submit} />
        )}
        <Button label="Cancel" variant="pill" tone="black" onPress={onClose} />
      </ScrollView>
    </CenteredSheet>
  );
}

const styles = StyleSheet.create({
  formContent: { paddingHorizontal: 20, paddingBottom: 24, gap: 14 },
});
