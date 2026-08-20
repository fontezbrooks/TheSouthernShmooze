import { useState } from "react";
import { ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { Button } from "@/components/ui/Button";
import { CategoryChip } from "@/features/providers/CategoryChips";
import { SUGGESTED_CATEGORIES } from "@/features/providers/categories";
import { useTheme } from "@/theme/ThemeProvider";
import type { SwipeTask } from "./swipeTypes";

interface TaskIntakeProps {
	heading?: string;
	/** Prefill the fields (used by the Filters sheet to edit an existing search). */
	initial?: SwipeTask | null;
	onSubmit: (task: SwipeTask) => void;
	submitLabel?: string;
}

/**
 * Type-only intake (July 2026 round, S1/S2): just the keyword + category tags.
 * Radius/budget/timing were dropped from the UI — the task ships with the old
 * defaults so `SwipeTask` and the RPCs are untouched. Reused by the Filters
 * sheet to change an in-progress search.
 */
export function TaskIntake({
	onSubmit,
	initial = null,
	heading = "What do you need?",
	submitLabel = "Find matches",
}: TaskIntakeProps) {
	const t = useTheme();
	const [keyword, setKeyword] = useState(initial?.keyword ?? "");

	const trimmed = keyword.trim();

	const submit = () => {
		if (!trimmed) {
			return;
		}
		onSubmit({
			budget: initial?.budget ?? null,
			keyword: trimmed,
			originLat: initial?.originLat ?? null,
			originLng: initial?.originLng ?? null,
			radiusKm: initial?.radiusKm ?? 25,
			timing: initial?.timing ?? null,
		});
	};

	return (
		<ScrollView
			contentContainerStyle={styles.content}
			keyboardShouldPersistTaps="handled"
		>
			<Text style={t.typography.displayS}>{heading}</Text>

			<TextInput
				autoCapitalize="none"
				onChangeText={setKeyword}
				placeholder="e.g. roofing, landscaping…"
				placeholderTextColor={t.colors.muted}
				style={[
					styles.input,
					t.typography.body,
					{
						backgroundColor: t.colors.surface,
						borderColor: t.colors.inputBorder,
						borderRadius: t.radii.input,
					},
				]}
				value={keyword}
			/>

			<Text style={[t.typography.captionSemi, { color: t.colors.muted }]}>
				Popular
			</Text>
			<View style={styles.chips}>
				{SUGGESTED_CATEGORIES.map((s) => (
					<CategoryChip
						key={s}
						label={s}
						onPress={() => setKeyword(s)}
						selected={trimmed.toLowerCase() === s.toLowerCase()}
					/>
				))}
			</View>

			<Button
				disabled={!trimmed}
				label={submitLabel}
				onPress={submit}
				style={styles.submit}
				variant="primary"
			/>
		</ScrollView>
	);
}

const styles = StyleSheet.create({
	chips: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
	content: { gap: 12, padding: 16 },
	input: {
		borderWidth: 1,
		height: 48,
		paddingHorizontal: 12,
	},
	submit: { marginTop: 12 },
});
