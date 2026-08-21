import {
	type Control,
	Controller,
	type FieldPath,
	type FieldValues,
} from "react-hook-form";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useTheme } from "@/theme/ThemeProvider";

interface OptionRowsProps<T extends FieldValues> {
	control: Control<T>;
	label: string;
	name: FieldPath<T>;
	/** value stored in the form; label shown to the user */
	options: readonly { value: string; label: string }[];
}

/**
 * Inline single-select (radio) rows on brand tokens — used for the wizard's
 * dropdown-equivalent questions. Inline instead of a modal picker: options
 * are few, and a flat list is one tap and screen-reader friendly.
 */
export function OptionRows<T extends FieldValues>({
	control,
	name,
	label,
	options,
}: OptionRowsProps<T>) {
	const t = useTheme();
	return (
		<Controller
			control={control}
			name={name}
			render={({ field, fieldState }) => (
				<View style={styles.block}>
					<Text
						style={[
							t.brand.typography.bodySemi,
							{ color: t.brand.colors.text },
						]}
					>
						{label}
					</Text>
					<View style={styles.rows}>
						{options.map((opt) => {
							const selected = field.value === opt.value;
							return (
								<Pressable
									accessibilityLabel={opt.label}
									accessibilityRole="radio"
									accessibilityState={{ checked: selected }}
									key={opt.value}
									onPress={() => field.onChange(opt.value)}
									style={[
										styles.row,
										{
											backgroundColor: selected
												? t.brand.colors.peachSoft
												: t.brand.colors.surface,
											borderColor: selected
												? t.brand.colors.clay
												: t.brand.colors.line,
											borderRadius: t.brand.radii.md,
										},
									]}
								>
									<View
										style={[
											styles.dot,
											{ borderColor: t.brand.colors.clay },
											selected && { backgroundColor: t.brand.colors.clay },
										]}
									/>
									<Text
										style={[
											t.brand.typography.body,
											styles.rowLabel,
											{ color: t.brand.colors.text },
										]}
									>
										{opt.label}
									</Text>
								</Pressable>
							);
						})}
					</View>
					{fieldState.error ? (
						<Text
							style={[
								t.brand.typography.caption,
								{ color: t.brand.colors.error },
							]}
						>
							{fieldState.error.message ?? "Required"}
						</Text>
					) : null}
				</View>
			)}
		/>
	);
}

const styles = StyleSheet.create({
	block: { gap: 8 },
	dot: {
		borderRadius: 8,
		borderWidth: 2,
		height: 16,
		width: 16,
	},
	row: {
		alignItems: "center",
		borderWidth: 1,
		flexDirection: "row",
		gap: 10,
		paddingHorizontal: 14,
		paddingVertical: 12,
	},
	rowLabel: { flex: 1 },
	rows: { gap: 8 },
});
