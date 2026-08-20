import { Controller } from "react-hook-form";
import { Pressable, StyleSheet, TextInput, View } from "react-native";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { StrokedText } from "@/components/ui/StrokedText";
import { CategoryChips } from "@/features/providers/CategoryChips";
import { SUGGESTED_CATEGORIES } from "@/features/providers/categories";
import { useTheme } from "@/theme/ThemeProvider";
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
					accessibilityElementsHidden
					autoComplete="off"
					autoCorrect={false}
					importantForAccessibility="no-hide-descendants"
					onChangeText={field.onChange}
					style={styles.honeypot}
					value={field.value ?? ""}
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
		reset,
	} = useConciergeForm();

	if (step === "success") {
		return <PartnerReveal onBackHome={onBackHome} onSubmitAnother={reset} />;
	}

	if (step === "job") {
		return (
			// Keyed per step: without keys React reuses the position-matched
			// TextFields across steps (zip→lastName, notes→email) and RHF's
			// Controller doesn't survive a live control/name swap — typed text
			// vanishes. The key forces a clean remount per step.
			<View key="step-job" style={styles.form}>
				<StrokedText
					style={[t.brand.typography.bodySemi, { color: t.brand.colors.text }]}
				>
					What do you need done?
				</StrokedText>
				<Controller
					control={stepOneForm.control}
					name="trade"
					render={({ field, fieldState }) => (
						<View style={styles.tradeBlock}>
							<CategoryChips
								categories={SUGGESTED_CATEGORIES}
								onSelect={field.onChange}
								selected={field.value}
							/>
							{fieldState.error ? (
								<StrokedText
									style={[
										t.brand.typography.caption,
										{ color: t.colors.error },
									]}
								>
									{fieldState.error.message ?? "Required"}
								</StrokedText>
							) : null}
						</View>
					)}
				/>
				<TextField
					control={stepOneForm.control}
					keyboardType="number-pad"
					label="Zip code"
					name="zip"
					placeholder="30303"
					required
				/>
				<TextField
					control={stepOneForm.control}
					label="Anything else about the job? (optional)"
					multiline
					name="notes"
				/>
				<HoneypotField control={stepTwoForm.control} />
				<Button label="Next" onPress={advance} variant="primary" />
			</View>
		);
	}

	const submitting = status === "submitting";
	return (
		<View key="step-contact" style={styles.form}>
			<StrokedText
				style={[t.brand.typography.bodySemi, { color: t.brand.colors.text }]}
			>
				How should your pro reach you?
			</StrokedText>
			<TextField
				autoCapitalize="words"
				autoComplete="name"
				control={stepTwoForm.control}
				label="First name"
				name="firstName"
				required
			/>
			<TextField
				autoCapitalize="words"
				control={stepTwoForm.control}
				label="Last name"
				name="lastName"
				required
			/>
			<TextField
				autoCapitalize="none"
				autoComplete="email"
				control={stepTwoForm.control}
				keyboardType="email-address"
				label="Email"
				name="email"
				required
			/>
			<TextField
				autoComplete="tel"
				control={stepTwoForm.control}
				keyboardType="phone-pad"
				label="Phone"
				name="phone"
				required
			/>

			<Controller
				control={stepTwoForm.control}
				name="newsletterOptIn"
				render={({ field }) => (
					<Pressable
						accessibilityLabel="Send me occasional Shmooze tips and trusted local pro recommendations"
						accessibilityRole="checkbox"
						accessibilityState={{ checked: field.value }}
						hitSlop={8}
						onPress={() => field.onChange(!field.value)}
						style={styles.optInRow}
					>
						<View
							style={[
								styles.checkbox,
								{
									backgroundColor: field.value
										? t.brand.colors.clay
										: t.brand.colors.surface,
									borderColor: t.brand.colors.clay,
								},
							]}
						>
							{field.value ? (
								<Icon color={t.brand.colors.bg} name="check" size={12} />
							) : null}
						</View>
						<StrokedText
							containerStyle={styles.optInLabel}
							style={[
								t.brand.typography.caption,
								{ color: t.brand.colors.textSoft },
							]}
						>
							Send me occasional Shmooze tips and trusted local pro
							recommendations. No spam, unsubscribe anytime.
						</StrokedText>
					</Pressable>
				)}
			/>

			<HoneypotField control={stepTwoForm.control} />

			{status === "error" && errorMessage ? (
				<View
					accessibilityLiveRegion="assertive"
					style={[styles.banner, { borderColor: t.brand.colors.clay }]}
				>
					<StrokedText
						style={[t.brand.typography.body, { color: t.brand.colors.clay }]}
					>
						{errorMessage}
					</StrokedText>
				</View>
			) : null}

			<View style={styles.actions}>
				<Button
					disabled={submitting}
					label="Back"
					onPress={back}
					variant="wide"
				/>
				<Button
					disabled={submitting}
					label={submitting ? "Submitting…" : "See My Match"}
					onPress={submit}
					variant="primary"
				/>
			</View>
		</View>
	);
}

const styles = StyleSheet.create({
	actions: { gap: 12, marginTop: 4 },
	banner: { borderRadius: 10, borderWidth: 1, padding: 12 },
	checkbox: {
		alignItems: "center",
		borderRadius: 6,
		borderWidth: 1.5,
		height: 20,
		justifyContent: "center",
		width: 20,
	},
	form: { gap: 16 },
	honeypot: { height: 1, left: -9999, position: "absolute", width: 1 },
	optInLabel: { flex: 1 },
	optInRow: { alignItems: "center", flexDirection: "row", gap: 10 },
	tradeBlock: { gap: 4 },
});
