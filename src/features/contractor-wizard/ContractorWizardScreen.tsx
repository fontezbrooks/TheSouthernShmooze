import {
  View,
  Text,
  ScrollView,
  ImageBackground,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ActivityIndicator,
} from "react-native";
import { Controller, useWatch } from "react-hook-form";
import { useRouter } from "expo-router";
import { useTheme } from "@/theme/ThemeProvider";
import { daisyBackground } from "@/theme/assets";
import { AppHeader } from "@/components/ui/AppHeader";
import { StrokedHeading } from "@/components/ui/StrokedHeading";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { TextField } from "@/features/lead-form/fields/TextField";
import {
  YEARS_OPTIONS,
  LICENSED_OPTIONS,
  LEAD_SOURCE_OPTIONS,
  CHALLENGE_OPTIONS,
  REVIEWS_RANGE_OPTIONS,
  WANT_HELP_OPTIONS,
  PAIN_POINTS,
} from "./wizardSchema";
import { useContractorWizard } from "./useContractorWizard";
import { OptionRows } from "./OptionRows";
import { BusinessLookupField } from "./BusinessLookupField";
import { FitResult } from "./FitResult";
import { buildJoinUrl } from "./wizardApi";

const asRows = (opts: readonly string[]) =>
  opts.map((o) => ({ value: o, label: o }));

/**
 * Check My Fit — native contractor qualification wizard (design.md §E5,
 * FR-7). Seven steps mirroring the site's /contractors form; instant
 * decision at the end with a link-out join handoff (Q5).
 * Every step subtree is KEYED — see the keyed-steps gotcha: unkeyed
 * conditional steps get position-matched and RHF Controllers are reused
 * with swapped names, wiping typed input.
 */
export function ContractorWizardScreen() {
  const t = useTheme();
  const router = useRouter();
  const wizard = useContractorWizard();
  const { form, step, stepCount, phase, verdict } = wizard;
  const placeId = useWatch({ control: form.control, name: "placeId" });
  const placeAddress = useWatch({
    control: form.control,
    name: "placeAddress",
  });

  const goBack = () =>
    router.canGoBack() ? router.back() : router.replace("/");

  const stepBody = () => {
    switch (step) {
      case 1:
        return (
          <View key="step-contact" style={styles.step}>
            <Text style={stepTitleStyle(t)}>First, who are you?</Text>
            <TextField
              control={form.control}
              name="contact"
              label="Your name"
              autoComplete="name"
              autoCapitalize="words"
              required
            />
            <TextField
              control={form.control}
              name="email"
              label="Email"
              keyboardType="email-address"
              autoComplete="email"
              autoCapitalize="none"
              required
            />
            <TextField
              control={form.control}
              name="phone"
              label="Phone"
              keyboardType="phone-pad"
              autoComplete="tel"
              required
            />
          </View>
        );
      case 2:
        return (
          <View key="step-business" style={styles.step}>
            <Text style={stepTitleStyle(t)}>Find your business on Google</Text>
            <BusinessLookupField
              control={form.control}
              placeId={placeId}
              placeAddress={placeAddress}
              pickPlace={wizard.pickPlace}
              clearPlace={wizard.clearPlace}
              getPlaceSession={wizard.getPlaceSession}
            />
          </View>
        );
      case 3:
        return (
          <View key="step-trade" style={styles.step}>
            <Text style={stepTitleStyle(t)}>About your trade</Text>
            <TextField
              control={form.control}
              name="trade"
              label="Primary trade"
              placeholder="e.g. Plumbing, HVAC, Roofing"
              required
            />
            <OptionRows
              control={form.control}
              name="yearsInBusiness"
              label="Years in business"
              options={YEARS_OPTIONS}
            />
            <OptionRows
              control={form.control}
              name="licensedInsured"
              label="Licensed & insured for your trade (if it requires it)?"
              options={LICENSED_OPTIONS}
            />
          </View>
        );
      case 4:
        return (
          <View key="step-area" style={styles.step}>
            <Text style={stepTitleStyle(t)}>Where do you work?</Text>
            <TextField
              control={form.control}
              name="serviceArea"
              label="Primary Metro Atlanta service area"
              placeholder="e.g. Decatur, Chamblee, Buckhead"
              required
            />
            <TextField
              control={form.control}
              name="webLink"
              label="Website or Google Business Profile link"
              placeholder="yourbusiness.com"
              autoCapitalize="none"
            />
            <Controller
              control={form.control}
              name="noWebsite"
              render={({ field }) => (
                <Pressable
                  accessibilityRole="checkbox"
                  accessibilityState={{ checked: field.value }}
                  accessibilityLabel="I don't have a website yet"
                  onPress={() => field.onChange(!field.value)}
                  style={styles.checkRow}
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
                      styles.checkLabel,
                      { color: t.brand.colors.textSoft },
                    ]}
                  >
                    I don&apos;t have a website yet
                  </Text>
                </Pressable>
              )}
            />
          </View>
        );
      case 5:
        return (
          <View key="step-marketing" style={styles.step}>
            <Text style={stepTitleStyle(t)}>How business comes in</Text>
            <OptionRows
              control={form.control}
              name="leadSource"
              label="How do you get most of your customers today?"
              options={asRows(LEAD_SOURCE_OPTIONS)}
            />
            <OptionRows
              control={form.control}
              name="biggestChallenge"
              label="What's your biggest challenge growing right now?"
              options={asRows(CHALLENGE_OPTIONS)}
            />
          </View>
        );
      case 6:
        return (
          <View key="step-reviews" style={styles.step}>
            <Text style={stepTitleStyle(t)}>Reviews & what you want</Text>
            <OptionRows
              control={form.control}
              name="reviewsRange"
              label="Roughly how many Google reviews do you have?"
              options={asRows(REVIEWS_RANGE_OPTIONS)}
            />
            <OptionRows
              control={form.control}
              name="wantHelp"
              label="What would you most want help with?"
              options={asRows(WANT_HELP_OPTIONS)}
            />
          </View>
        );
      default:
        return (
          <View key="step-pains" style={styles.step}>
            <Text style={stepTitleStyle(t)}>
              Which of these sound like you?
            </Text>
            <Text
              style={[
                t.brand.typography.caption,
                { color: t.brand.colors.textSoft },
              ]}
            >
              Optional — pick any that fit.
            </Text>
            <Controller
              control={form.control}
              name="painPoints"
              render={({ field }) => (
                <View style={styles.painList}>
                  {PAIN_POINTS.map((p) => {
                    const checked = field.value.includes(p.id);
                    return (
                      <Pressable
                        key={p.id}
                        accessibilityRole="checkbox"
                        accessibilityState={{ checked }}
                        accessibilityLabel={p.label}
                        onPress={() =>
                          field.onChange(
                            checked
                              ? field.value.filter((id) => id !== p.id)
                              : [...field.value, p.id],
                          )
                        }
                        style={styles.checkRow}
                        hitSlop={4}
                      >
                        <View
                          style={[
                            styles.checkbox,
                            {
                              borderColor: t.brand.colors.clay,
                              backgroundColor: checked
                                ? t.brand.colors.clay
                                : t.brand.colors.surface,
                            },
                          ]}
                        >
                          {checked ? (
                            <Icon
                              name="check"
                              size={12}
                              color={t.brand.colors.bg}
                            />
                          ) : null}
                        </View>
                        <Text
                          style={[
                            t.brand.typography.body,
                            styles.checkLabel,
                            { color: t.brand.colors.text },
                          ]}
                        >
                          {p.label}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              )}
            />
          </View>
        );
    }
  };

  const body = () => {
    if (phase === "analyzing") {
      return (
        <View style={styles.analyzing} accessibilityLiveRegion="polite">
          <ActivityIndicator size="large" color={t.brand.colors.clay} />
          <Text
            style={[
              t.brand.typography.bodySemi,
              { color: t.brand.colors.text },
            ]}
          >
            Checking your fit…
          </Text>
          <Text
            style={[
              t.brand.typography.caption,
              { color: t.brand.colors.textSoft },
            ]}
          >
            Looking at your Google reviews and service area.
          </Text>
        </View>
      );
    }
    if (phase === "result" && verdict) {
      return (
        <FitResult
          verdict={verdict}
          businessName={form.getValues("business")}
          joinUrl={buildJoinUrl(form.getValues(), verdict)}
          onStartOver={wizard.reset}
        />
      );
    }
    const isLast = step === stepCount;
    return (
      <>
        <Text
          style={[t.brand.typography.chip, { color: t.brand.colors.textSoft }]}
          accessibilityLabel={`Step ${step} of ${stepCount}`}
        >
          STEP {step} OF {stepCount}
        </Text>
        {stepBody()}
        <View style={styles.actions}>
          {step > 1 ? (
            <Button label="Back" variant="wide" onPress={wizard.back} />
          ) : null}
          <Button
            label={isLast ? "Check My Fit" : "Next"}
            variant="primary"
            onPress={wizard.advance}
          />
        </View>
      </>
    );
  };

  return (
    <ImageBackground
      source={daisyBackground}
      resizeMode="repeat"
      style={styles.flex}
    >
      <AppHeader showBack onBack={goBack} />
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.headingBlock}>
            <Text style={t.typography.displayXS}>For local pros</Text>
            <StrokedHeading variant="displayL">Check My Fit</StrokedHeading>
            <Text
              style={[
                t.brand.typography.caption,
                { color: t.brand.colors.textSoft },
              ]}
            >
              Free, takes about 2 minutes. No card required.
            </Text>
          </View>
          {body()}
        </ScrollView>
      </KeyboardAvoidingView>
    </ImageBackground>
  );
}

const stepTitleStyle = (t: ReturnType<typeof useTheme>) => [
  t.brand.typography.bodySemi,
  { color: t.brand.colors.text },
];

const styles = StyleSheet.create({
  flex: { flex: 1 },
  headingBlock: { gap: 4 },
  content: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 44,
    gap: 20,
  },
  step: { gap: 16 },
  actions: { gap: 12, marginTop: 4 },
  analyzing: { alignItems: "center", gap: 12, paddingVertical: 48 },
  painList: { gap: 12 },
  checkRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  checkLabel: { flex: 1 },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 6,
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
  },
});
