import { View, Text, TextInput, Pressable, StyleSheet } from "react-native";
import { Controller } from "react-hook-form";
import { useTheme } from "@/theme/ThemeProvider";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { CategoryChips } from "@/features/providers/CategoryChips";
import { SUGGESTED_CATEGORIES } from "@/features/providers/categories";
import { TextField } from "./fields/TextField";
import { PartnerReveal } from "./PartnerReveal";
import { useConciergeForm } from "./useConciergeForm";

interface ConciergeFormProps {
  onBackHome: () => void;
}

/**
 * Hidden honeypot input — mounted on BOTH steps so a bot filling every
 * field is caught before even the partial insert (step 1) as well as the
 * completion (step 2). Bound to the contact form's `company` field.
 */
function HoneypotField({
  control,
}: {
  control: ReturnType<typeof useConciergeForm>["stepTwoForm"]["control"];
}) {
  return (
    <Controller
      control={control}
      name="company"
      render={({ field }) => (
        <TextInput
          value={field.value ?? ""}
          onChangeText={field.onChange}
          style={styles.honeypot}
          accessibilityElementsHidden
          importantForAccessibility="no-hide-descendants"
          autoComplete="off"
          autoCorrect={false}
        />
      )}
    />
  );
}

/**
 * Two-step "Find My Pro" flow (design.md §E3b, FR-4.1). Step 1 captures the
 * job (trade chips + zip + notes) and fires the partial lead on advance;
 * step 2 captures contact + newsletter opt-in; the confirmation reveals the
 * preferred partner. Honeypot + error-banner behavior carried over from the
 * legacy LeadForm.
 */
export function ConciergeForm({ onBackHome }: ConciergeFormProps) {
  const t = useTheme();
  const {
    step,
    status,
    errorMessage,
    stepOneForm,
    stepTwoForm,
    advance,
    back,
    submit,
  } = useConciergeForm();

  if (step === "success") {
    return <PartnerReveal onBackHome={onBackHome} />;
  }

  if (step === "job") {
    return (
      // Keyed per step: without keys React reuses the position-matched
      // TextFields across steps (zip→lastName, notes→email) and RHF's
      // Controller doesn't survive a live control/name swap — typed text
      // vanishes. The key forces a clean remount per step.
      <View key="step-job" style={styles.form}>
        <Text
          style={[t.brand.typography.bodySemi, { color: t.brand.colors.text }]}
        >
          What do you need done?
        </Text>
        <Controller
          control={stepOneForm.control}
          name="trade"
          render={({ field, fieldState }) => (
            <View style={styles.tradeBlock}>
              <CategoryChips
                categories={SUGGESTED_CATEGORIES}
                selected={field.value}
                onSelect={field.onChange}
              />
              {fieldState.error ? (
                <Text
                  style={[
                    t.brand.typography.caption,
                    { color: t.colors.error },
                  ]}
                >
                  {fieldState.error.message}
                </Text>
              ) : null}
            </View>
          )}
        />
        <TextField
          control={stepOneForm.control}
          name="zip"
          label="Zip code"
          placeholder="30303"
          keyboardType="number-pad"
          required
        />
        <TextField
          control={stepOneForm.control}
          name="notes"
          label="Anything else about the job? (optional)"
          multiline
        />
        <HoneypotField control={stepTwoForm.control} />
        <Button label="Next" variant="primary" onPress={advance} />
      </View>
    );
  }

  const submitting = status === "submitting";
  return (
    <View key="step-contact" style={styles.form}>
      <Text
        style={[t.brand.typography.bodySemi, { color: t.brand.colors.text }]}
      >
        How should your pro reach you?
      </Text>
      <TextField
        control={stepTwoForm.control}
        name="firstName"
        label="First name"
        autoComplete="name"
        autoCapitalize="words"
        required
      />
      <TextField
        control={stepTwoForm.control}
        name="lastName"
        label="Last name"
        autoCapitalize="words"
        required
      />
      <TextField
        control={stepTwoForm.control}
        name="email"
        label="Email"
        keyboardType="email-address"
        autoComplete="email"
        autoCapitalize="none"
        required
      />
      <TextField
        control={stepTwoForm.control}
        name="phone"
        label="Phone"
        keyboardType="phone-pad"
        autoComplete="tel"
        required
      />

      <Controller
        control={stepTwoForm.control}
        name="newsletterOptIn"
        render={({ field }) => (
          <Pressable
            accessibilityRole="checkbox"
            accessibilityState={{ checked: field.value }}
            accessibilityLabel="Send me occasional Shmooze tips and trusted local pro recommendations"
            onPress={() => field.onChange(!field.value)}
            style={styles.optInRow}
            hitSlop={8}
          >
            <View
              style={[
                styles.checkbox,
                {
                  borderColor: t.brand.colors.clay,
                  backgroundColor: field.value
                    ? t.brand.colors.clay
                    : t.brand.colors.surface,
                },
              ]}
            >
              {field.value ? (
                <Icon name="check" size={12} color={t.brand.colors.bg} />
              ) : null}
            </View>
            <Text
              style={[
                t.brand.typography.caption,
                styles.optInLabel,
                { color: t.brand.colors.textSoft },
              ]}
            >
              Send me occasional Shmooze tips and trusted local pro
              recommendations. No spam, unsubscribe anytime.
            </Text>
          </Pressable>
        )}
      />

      <HoneypotField control={stepTwoForm.control} />

      {status === "error" && errorMessage ? (
        <View
          style={[styles.banner, { borderColor: t.brand.colors.clay }]}
          accessibilityLiveRegion="assertive"
        >
          <Text
            style={[t.brand.typography.body, { color: t.brand.colors.clay }]}
          >
            {errorMessage}
          </Text>
        </View>
      ) : null}

      <View style={styles.actions}>
        <Button label="Back" variant="wide" onPress={back} />
        <Button
          label={submitting ? "Submitting…" : "See My Match"}
          variant="primary"
          onPress={submit}
          disabled={submitting}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  form: { gap: 16 },
  tradeBlock: { gap: 4 },
  optInRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  optInLabel: { flex: 1 },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 6,
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
  },
  honeypot: { position: "absolute", left: -9999, height: 1, width: 1 },
  banner: { borderWidth: 1, borderRadius: 10, padding: 12 },
  actions: { gap: 12, marginTop: 4 },
});
