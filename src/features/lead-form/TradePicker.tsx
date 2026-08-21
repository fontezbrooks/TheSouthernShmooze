import { useState } from "react";
import { type Control, useController } from "react-hook-form";
import { StyleSheet, Text, View } from "react-native";
import { CategoryChips } from "@/features/providers/CategoryChips";
import { SUGGESTED_CATEGORIES } from "@/features/providers/categories";
import { useTheme } from "@/theme/ThemeProvider";
import type { ConciergeStepOneValues } from "./conciergeSchema";
import { TextField } from "./fields/TextField";

export const OTHER_TRADE = "Something else";
const CHOICES = [...SUGGESTED_CATEGORIES, OTHER_TRADE] as const;

/** A non-empty trade that is not one of the preset chips. */
const isCustomTrade = (value: string): boolean =>
	value.trim().length > 0 &&
	!SUGGESTED_CATEGORIES.some((c) => c.toLowerCase() === value.toLowerCase());

interface TradePickerProps {
	control: Control<ConciergeStepOneValues>;
}

/**
 * Trade chips + a "Something else" escape hatch that reveals a free-text
 * field bound to the SAME `trade` value — no schema change, and the
 * "Select a trade" rule still guards empty. `isOther` lives here, inside the
 * step-1 View that remounts per step, so it dies with the step.
 */
export function TradePicker({ control }: TradePickerProps) {
	const t = useTheme();
	const { field, fieldState } = useController({ control, name: "trade" });
	// Coming BACK from step 2 remounts this picker while RHF still holds the
	// typed trade, so start in custom mode whenever the stored value is not
	// one of the presets (review: PR #53).
	const [isOther, setIsOther] = useState(() => isCustomTrade(field.value));

	const onSelect = (choice: string) => {
		if (choice === OTHER_TRADE) {
			// Re-tapping the chip while already in custom mode keeps the text.
			if (!isOther) {
				setIsOther(true);
				field.onChange("");
			}
			return;
		}
		setIsOther(false);
		field.onChange(choice);
	};

	return (
		<View style={styles.block}>
			<CategoryChips
				categories={CHOICES}
				onSelect={onSelect}
				selected={isOther ? OTHER_TRADE : field.value}
			/>
			{isOther ? (
				<TextField
					autoCapitalize="words"
					control={control}
					label="What kind of pro do you need?"
					name="trade"
				/>
			) : null}
			{!isOther && fieldState.error ? (
				<Text
					style={[t.brand.typography.caption, { color: t.brand.colors.error }]}
				>
					{fieldState.error.message ?? "Required"}
				</Text>
			) : null}
		</View>
	);
}

const styles = StyleSheet.create({
	block: { gap: 8 },
});
