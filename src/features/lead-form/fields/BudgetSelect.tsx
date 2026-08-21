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

/** Single-select budget dropdown (dollar icon + chevron) on `t.brand`. */
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
									<Icon
										color={t.brand.colors.textSoft}
										name="chevronDown"
										size={18}
									/>
								}
							>
								<Text
									style={[
										t.brand.typography.body,
										{ color: t.brand.colors.text },
									]}
								>
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
									style={[
										styles.sheet,
										t.brand.shadow.card,
										{
											backgroundColor: t.brand.colors.surface,
											borderRadius: t.brand.radii.md,
										},
									]}
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
														t.brand.typography.body,
														{
															color: isSel
																? t.brand.colors.clay
																: t.brand.colors.text,
														},
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
		justifyContent: "center",
		minHeight: 48,
		paddingHorizontal: 20,
	},
	sheet: {
		paddingVertical: 8,
	},
});
