import { useState } from "react";
import {
	type Control,
	Controller,
	type FieldPath,
	type FieldValues,
} from "react-hook-form";
import { Modal, Pressable, StyleSheet, Text, View } from "react-native";
import { Icon } from "@/components/ui/Icon";
import type { BudgetValue } from "@/lib/database";
import { useTheme } from "@/theme/ThemeProvider";
import { InputContainer } from "./InputContainer";

export const BUDGET_OPTIONS: ReadonlyArray<{
	value: BudgetValue;
	label: string;
}> = [
	{ label: "< $1,000", value: "lt_1000" },
	{ label: "$1,000 – $5,000", value: "1000_5000" },
	{ label: "> $5,000", value: "gt_5000" },
];

interface BudgetSelectProps<T extends FieldValues> {
	control: Control<T>;
	label: string;
	name: FieldPath<T>;
}

/** Single-select budget dropdown (dollar icon + chevron) per Figma. */
export function BudgetSelect<T extends FieldValues>({
	control,
	name,
	label,
}: BudgetSelectProps<T>) {
	const t = useTheme();
	const [open, setOpen] = useState(false);

	return (
		<Controller
			control={control}
			name={name}
			render={({ field, fieldState }) => {
				const selected = BUDGET_OPTIONS.find((o) => o.value === field.value);
				const choose = (value: BudgetValue) => {
					field.onChange(value);
					setOpen(false);
				};
				return (
					<>
						<Pressable
							accessibilityLabel={label}
							accessibilityRole="button"
							onPress={() => setOpen(true)}
						>
							<InputContainer
								error={fieldState.error?.message}
								floated={open || !!selected}
								icon="dollar"
								label={label}
								trailing={
									<Icon color={t.colors.muted} name="chevronDown" size={18} />
								}
							>
								<Text style={[t.typography.body, { color: t.colors.text }]}>
									{selected ? selected.label : ""}
								</Text>
							</InputContainer>
						</Pressable>

						<Modal
							animationType="fade"
							onRequestClose={() => setOpen(false)}
							transparent
							visible={open}
						>
							<Pressable onPress={() => setOpen(false)} style={styles.backdrop}>
								<View
									style={[styles.sheet, { backgroundColor: t.colors.surface }]}
								>
									{BUDGET_OPTIONS.map((opt) => {
										const isSel = opt.value === field.value;
										return (
											<Pressable
												accessibilityRole="button"
												accessibilityState={{ selected: isSel }}
												key={opt.value}
												onPress={() => choose(opt.value)}
												style={styles.option}
											>
												<Text
													style={[
														t.typography.body,
														isSel && { color: t.colors.rust },
													]}
												>
													{opt.label}
												</Text>
											</Pressable>
										);
									})}
								</View>
							</Pressable>
						</Modal>
					</>
				);
			}}
		/>
	);
}

const styles = StyleSheet.create({
	backdrop: {
		backgroundColor: "rgba(0,0,0,0.4)",
		flex: 1,
		justifyContent: "center",
		paddingHorizontal: 24,
	},
	option: {
		paddingHorizontal: 20,
		paddingVertical: 14,
	},
	sheet: {
		borderRadius: 12,
		paddingVertical: 8,
	},
});
