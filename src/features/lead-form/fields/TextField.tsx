import { useState } from "react";
import {
	type Control,
	Controller,
	type FieldPath,
	type FieldValues,
} from "react-hook-form";
import { type KeyboardTypeOptions, StyleSheet, TextInput } from "react-native";
import type { IconName } from "@/components/ui/Icon";
import { useTheme } from "@/theme/ThemeProvider";
import { InputContainer } from "./InputContainer";

interface TextFieldProps<T extends FieldValues> {
	autoCapitalize?: "none" | "sentences" | "words";
	autoComplete?: "email" | "tel" | "name" | "street-address" | "off";
	control: Control<T>;
	icon?: IconName;
	keyboardType?: KeyboardTypeOptions;
	/** Floating label (placeholder when empty, small top label when filled). */
	label: string;
	multiline?: boolean;
	name: FieldPath<T>;
	/** Example hint shown in the value row once the label has floated. */
	placeholder?: string;
	/** Accepted for call-site clarity; the V3 design has no "optional" affordance. */
	required?: boolean;
}

/** Controlled text input with a floating label (Figma V3) + padded error. */
export function TextField<T extends FieldValues>({
	control,
	name,
	label,
	placeholder,
	icon,
	keyboardType,
	autoCapitalize = "sentences",
	autoComplete = "off",
	multiline = false,
}: TextFieldProps<T>) {
	const t = useTheme();
	const [focused, setFocused] = useState(false);
	return (
		<Controller
			control={control}
			name={name}
			render={({ field, fieldState }) => {
				const value = typeof field.value === "string" ? field.value : "";
				const floated = multiline || focused || value.length > 0;
				return (
					<InputContainer
						error={fieldState.error?.message}
						floated={floated}
						icon={icon}
						label={label}
						multiline={multiline}
					>
						<TextInput
							accessibilityLabel={label}
							autoCapitalize={autoCapitalize}
							autoComplete={autoComplete}
							keyboardType={keyboardType}
							multiline={multiline}
							onBlur={() => {
								setFocused(false);
								field.onBlur();
							}}
							onChangeText={field.onChange}
							onFocus={() => setFocused(true)}
							placeholder={floated ? placeholder : undefined}
							placeholderTextColor={t.colors.muted}
							style={[t.typography.body, multiline && styles.multiline]}
							value={value}
						/>
					</InputContainer>
				);
			}}
		/>
	);
}

const styles = StyleSheet.create({
	multiline: {
		minHeight: 96,
		textAlignVertical: "top",
	},
});
