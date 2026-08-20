import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { Button } from "@/components/ui/Button";
import { BudgetSelect } from "@/features/lead-form/fields/BudgetSelect";
import { TextField } from "@/features/lead-form/fields/TextField";
import { useTheme } from "@/theme/ThemeProvider";
import {
	prefillFromTask,
	type SwipeContactValues,
	swipeContactSchema,
} from "./contactSchema";
import { type SwipeRepository, swipeRepository } from "./swipeRepository";
import type { SeekerContact, SwipeTask } from "./swipeTypes";

interface LeadCaptureFormProps {
	/** Remembered contact (name/email/phone) to prefill for a returning Seeker. */
	contact: SeekerContact | null;
	onCancel: () => void;
	/** Saves the contact, then hands the verified contact up (the caller sends the lead). */
	onSubmitted: (contact: SeekerContact) => void | Promise<void>;
	repo?: SwipeRepository;
	sessionToken: string;
	task: SwipeTask | null;
	taskId: string | null;
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
		defaultValues: prefillFromTask(task, contact),
		mode: "onTouched",
		resolver: zodResolver(swipeContactSchema),
	});

	const submit = form.handleSubmit(async (values) => {
		const fullName =
			`${values.firstName.trim()} ${values.lastName.trim()}`.trim();
		setBusy(true);
		setError(null);
		const res = await repo.saveContact(sessionToken, taskId, {
			budget: values.budget ?? null,
			details: values.projectDetails.trim() || null,
			email: values.email.trim(),
			name: fullName,
			phone: values.phone.trim() || null,
		});
		if (res.ok) {
			// Stay busy while the caller sends the lead / navigates away.
			await onSubmitted({
				email: values.email.trim(),
				name: fullName,
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
				autoComplete="name"
				control={form.control}
				label="First Name"
				name="firstName"
				required
			/>
			<TextField
				autoComplete="name"
				control={form.control}
				label="Last Name"
				name="lastName"
				required
			/>
			<TextField
				autoCapitalize="none"
				autoComplete="email"
				control={form.control}
				icon="mail"
				keyboardType="email-address"
				label="Email"
				name="email"
				required
			/>
			<TextField
				autoComplete="tel"
				control={form.control}
				icon="phoneFilled"
				keyboardType="phone-pad"
				label="Phone"
				name="phone"
				required
			/>
			<BudgetSelect control={form.control} label="Budget" name="budget" />
			<TextField
				control={form.control}
				label="Project Details"
				multiline
				name="projectDetails"
				placeholder="Tell them what you're looking for…"
				required
			/>

			{error ? (
				<Text style={[t.typography.caption, { color: t.colors.error }]}>
					{error}
				</Text>
			) : null}

			{busy ? (
				<ActivityIndicator color={t.colors.rust} />
			) : (
				<Button label="Send request" onPress={submit} variant="primary" />
			)}
			<Button label="Cancel" onPress={onCancel} tone="black" variant="pill" />
		</View>
	);
}

const styles = StyleSheet.create({
	formContent: { gap: 14 },
});
