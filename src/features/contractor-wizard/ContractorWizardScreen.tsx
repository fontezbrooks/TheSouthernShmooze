import { useRouter } from "expo-router";
import { useEffect, useRef } from "react";
import { Controller, useWatch } from "react-hook-form";
import {
	ActivityIndicator,
	ImageBackground,
	KeyboardAvoidingView,
	Platform,
	Pressable,
	ScrollView,
	StyleSheet,
	View,
} from "react-native";
import { AppHeader } from "@/components/ui/AppHeader";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { StrokedHeading } from "@/components/ui/StrokedHeading";
import { StrokedText } from "@/components/ui/StrokedText";
import { TextField } from "@/features/lead-form/fields/TextField";
import { daisyBackground } from "@/theme/assets";
import { useTheme } from "@/theme/ThemeProvider";
import { BusinessLookupField } from "./BusinessLookupField";
import { FitResult } from "./FitResult";
import { OptionRows } from "./OptionRows";
import { useContractorWizard } from "./useContractorWizard";
import { buildJoinUrl } from "./wizardApi";
import {
	CHALLENGE_OPTIONS,
	LEAD_SOURCE_OPTIONS,
	LICENSED_OPTIONS,
	PAIN_POINTS,
	REVIEWS_RANGE_OPTIONS,
	WANT_HELP_OPTIONS,
	YEARS_OPTIONS,
} from "./wizardSchema";

const asRows = (opts: readonly string[]) =>
	opts.map((o) => ({ label: o, value: o }));

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

	// One ScrollView spans all steps — without a reset, a long step leaves
	// the next one opened at the previous bottom offset, hiding its heading
	// (worst on optional step 7, reachable-to-submit unseen; review: PR #34).
	const scrollRef = useRef<ScrollView>(null);
	useEffect(() => {
		scrollRef.current?.scrollTo({ animated: false, y: 0 });
	}, [step, phase]);

	const stepBody = () => {
		switch (step) {
			case 1:
				return (
					<View key="step-contact" style={styles.step}>
						<StrokedText style={stepTitleStyle(t)}>
							First, who are you?
						</StrokedText>
						<TextField
							autoCapitalize="words"
							autoComplete="name"
							control={form.control}
							label="Your name"
							name="contact"
							required
						/>
						<TextField
							autoCapitalize="none"
							autoComplete="email"
							control={form.control}
							keyboardType="email-address"
							label="Email"
							name="email"
							required
						/>
						<TextField
							autoComplete="tel"
							control={form.control}
							keyboardType="phone-pad"
							label="Phone"
							name="phone"
							required
						/>
					</View>
				);
			case 2:
				return (
					<View key="step-business" style={styles.step}>
						<StrokedText style={stepTitleStyle(t)}>
							Find your business on Google
						</StrokedText>
						<BusinessLookupField
							clearPlace={wizard.clearPlace}
							control={form.control}
							getPlaceSession={wizard.getPlaceSession}
							pickPlace={wizard.pickPlace}
							placeAddress={placeAddress}
							placeId={placeId}
						/>
					</View>
				);
			case 3:
				return (
					<View key="step-trade" style={styles.step}>
						<StrokedText style={stepTitleStyle(t)}>
							About your trade
						</StrokedText>
						<TextField
							control={form.control}
							label="Primary trade"
							name="trade"
							placeholder="e.g. Plumbing, HVAC, Roofing"
							required
						/>
						<OptionRows
							control={form.control}
							label="Years in business"
							name="yearsInBusiness"
							options={YEARS_OPTIONS}
						/>
						<OptionRows
							control={form.control}
							label="Licensed & insured for your trade (if it requires it)?"
							name="licensedInsured"
							options={LICENSED_OPTIONS}
						/>
					</View>
				);
			case 4:
				return (
					<View key="step-area" style={styles.step}>
						<StrokedText style={stepTitleStyle(t)}>
							Where do you work?
						</StrokedText>
						<TextField
							control={form.control}
							label="Primary Metro Atlanta service area"
							name="serviceArea"
							placeholder="e.g. Decatur, Chamblee, Buckhead"
							required
						/>
						<TextField
							autoCapitalize="none"
							control={form.control}
							label="Website or Google Business Profile link"
							name="webLink"
							placeholder="yourbusiness.com"
						/>
						<Controller
							control={form.control}
							name="noWebsite"
							render={({ field }) => (
								<Pressable
									accessibilityLabel="I don't have a website yet"
									accessibilityRole="checkbox"
									accessibilityState={{ checked: field.value }}
									hitSlop={8}
									onPress={() => field.onChange(!field.value)}
									style={styles.checkRow}
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
										containerStyle={styles.checkLabel}
										style={[
											t.brand.typography.caption,
											{ color: t.brand.colors.textSoft },
										]}
									>
										I don&apos;t have a website yet
									</StrokedText>
								</Pressable>
							)}
						/>
					</View>
				);
			case 5:
				return (
					<View key="step-marketing" style={styles.step}>
						<StrokedText style={stepTitleStyle(t)}>
							How business comes in
						</StrokedText>
						<OptionRows
							control={form.control}
							label="How do you get most of your customers today?"
							name="leadSource"
							options={asRows(LEAD_SOURCE_OPTIONS)}
						/>
						<OptionRows
							control={form.control}
							label="What's your biggest challenge growing right now?"
							name="biggestChallenge"
							options={asRows(CHALLENGE_OPTIONS)}
						/>
					</View>
				);
			case 6:
				return (
					<View key="step-reviews" style={styles.step}>
						<StrokedText style={stepTitleStyle(t)}>
							Reviews & what you want
						</StrokedText>
						<OptionRows
							control={form.control}
							label="Roughly how many Google reviews do you have?"
							name="reviewsRange"
							options={asRows(REVIEWS_RANGE_OPTIONS)}
						/>
						<OptionRows
							control={form.control}
							label="What would you most want help with?"
							name="wantHelp"
							options={asRows(WANT_HELP_OPTIONS)}
						/>
					</View>
				);
			default:
				return (
					<View key="step-pains" style={styles.step}>
						<StrokedText style={stepTitleStyle(t)}>
							Which of these sound like you?
						</StrokedText>
						<StrokedText
							style={[
								t.brand.typography.caption,
								{ color: t.brand.colors.textSoft },
							]}
						>
							Optional — pick any that fit.
						</StrokedText>
						<Controller
							control={form.control}
							name="painPoints"
							render={({ field }) => (
								<View style={styles.painList}>
									{PAIN_POINTS.map((p) => {
										const checked = field.value.includes(p.id);
										return (
											<Pressable
												accessibilityLabel={p.label}
												accessibilityRole="checkbox"
												accessibilityState={{ checked }}
												hitSlop={4}
												key={p.id}
												onPress={() =>
													field.onChange(
														checked
															? field.value.filter((id) => id !== p.id)
															: [...field.value, p.id]
													)
												}
												style={styles.checkRow}
											>
												<View
													style={[
														styles.checkbox,
														{
															backgroundColor: checked
																? t.brand.colors.clay
																: t.brand.colors.surface,
															borderColor: t.brand.colors.clay,
														},
													]}
												>
													{checked ? (
														<Icon
															color={t.brand.colors.bg}
															name="check"
															size={12}
														/>
													) : null}
												</View>
												<StrokedText
													containerStyle={styles.checkLabel}
													style={[
														t.brand.typography.body,
														{ color: t.brand.colors.text },
													]}
												>
													{p.label}
												</StrokedText>
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
				<View accessibilityLiveRegion="polite" style={styles.analyzing}>
					<ActivityIndicator color={t.brand.colors.clay} size="large" />
					<StrokedText
						style={[
							t.brand.typography.bodySemi,
							{ color: t.brand.colors.text },
						]}
					>
						Checking your fit…
					</StrokedText>
					<StrokedText
						style={[
							t.brand.typography.caption,
							{ color: t.brand.colors.textSoft },
						]}
					>
						Looking at your Google reviews and service area.
					</StrokedText>
				</View>
			);
		}
		if (phase === "result" && verdict) {
			return (
				<FitResult
					businessName={form.getValues("business")}
					joinUrl={buildJoinUrl(form.getValues(), verdict)}
					onStartOver={wizard.reset}
					verdict={verdict}
				/>
			);
		}
		const isLast = step === stepCount;
		return (
			<>
				<StrokedText
					accessibilityLabel={`Step ${step} of ${stepCount}`}
					style={[t.brand.typography.chip, { color: t.brand.colors.textSoft }]}
				>
					{`STEP ${step} OF ${stepCount}`}
				</StrokedText>
				{stepBody()}
				<View style={styles.actions}>
					{step > 1 ? (
						<Button label="Back" onPress={wizard.back} variant="wide" />
					) : null}
					<Button
						label={isLast ? "Check My Fit" : "Next"}
						onPress={wizard.advance}
						variant="primary"
					/>
				</View>
			</>
		);
	};

	return (
		<ImageBackground
			resizeMode="repeat"
			source={daisyBackground}
			style={styles.flex}
		>
			<AppHeader onBack={goBack} showBack surface="legacy" />
			<KeyboardAvoidingView
				behavior={Platform.OS === "ios" ? "padding" : undefined}
				style={styles.flex}
			>
				<ScrollView
					contentContainerStyle={styles.content}
					keyboardShouldPersistTaps="handled"
					ref={scrollRef}
				>
					<View style={styles.headingBlock}>
						<StrokedText style={t.typography.displayXS}>
							For local pros
						</StrokedText>
						<StrokedHeading variant="displayL">Check My Fit</StrokedHeading>
						<StrokedText
							style={[
								t.brand.typography.caption,
								{ color: t.brand.colors.textSoft },
							]}
						>
							Free, takes about 2 minutes. No card required.
						</StrokedText>
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
	actions: { gap: 12, marginTop: 4 },
	analyzing: { alignItems: "center", gap: 12, paddingVertical: 48 },
	checkbox: {
		alignItems: "center",
		borderRadius: 6,
		borderWidth: 1.5,
		height: 20,
		justifyContent: "center",
		width: 20,
	},
	checkLabel: { flex: 1 },
	checkRow: { alignItems: "center", flexDirection: "row", gap: 10 },
	content: {
		gap: 20,
		paddingBottom: 44,
		paddingHorizontal: 16,
		paddingTop: 16,
	},
	flex: { flex: 1 },
	headingBlock: { gap: 4 },
	painList: { gap: 12 },
	step: { gap: 16 },
});
