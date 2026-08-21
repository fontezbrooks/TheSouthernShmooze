import type { ReactNode } from "react";
import { StyleSheet, Text, View, type ViewStyle } from "react-native";
import { FloatingLabel } from "@/components/ui/FloatingLabel";
import { Icon, type IconName } from "@/components/ui/Icon";
import { PaddedErrorMessage } from "@/components/ui/PaddedErrorMessage";
import { useTheme } from "@/theme/ThemeProvider";

interface InputContainerProps {
	/** The value control (TextInput / Text), rendered in the lower slot. */
	children: ReactNode;
	disabled?: boolean;
	error?: string;
	/** focused || hasValue → label floats up. Forced true for multiline. */
	floated: boolean;
	/** Drives the clay focus ring. Callers with a real input pass their focus state. */
	focused?: boolean;
	/** Caption under the field when there is no error (site: phone help text). */
	helperText?: string;
	icon?: IconName;
	label: string;
	multiline?: boolean;
	/** Trailing node (chevron for selects), vertically centered. */
	trailing?: ReactNode;
}

/** Border colour by state: error wins, then focus, then rest. */
function borderFor(
	c: { clay: string; error: string; line: string },
	error: string | undefined,
	focused: boolean
): string {
	if (error) {
		return c.error;
	}
	return focused ? c.clay : c.line;
}

/** Value-row alignment for the three shell states. */
function contentStyle(multiline: boolean, floated: boolean): ViewStyle {
	if (multiline) {
		return styles.contentMultiline;
	}
	// Floated: value row drops to the bottom so the top-left label stands
	// clear. Empty/unfocused: value row centred (placeholder label sits on it).
	return floated ? styles.contentFloated : styles.contentCenter;
}

/**
 * Input shell on the 2026 brand tokens: white surface, `line` hairline that
 * turns clay on focus and error-red on error, floating label, leading icon +
 * value row, and either the padded error or a helper caption below.
 */
export function InputContainer({
	label,
	floated,
	focused = false,
	helperText,
	icon,
	trailing,
	error,
	disabled = false,
	multiline = false,
	children,
}: InputContainerProps) {
	const t = useTheme();
	const c = t.brand.colors;
	const isFloated = floated || multiline;
	const borderColor = borderFor(c, error, focused);

	return (
		<View style={styles.wrap}>
			<View
				style={[
					styles.box,
					multiline ? styles.boxMultiline : styles.boxSingle,
					{
						backgroundColor: c.surface,
						borderColor,
						borderRadius: t.brand.radii.sm,
						opacity: disabled ? 0.5 : 1,
					},
				]}
			>
				<View style={[styles.content, contentStyle(multiline, isFloated)]}>
					<FloatingLabel
						floated={isFloated}
						hasIcon={!!icon && !multiline}
						label={label}
					/>
					{/* Icon + value share the lower row, so the floated top-left label never overlaps the icon. */}
					<View
						style={[styles.valueRow, multiline && styles.valueRowMultiline]}
					>
						{icon && !multiline ? (
							<Icon color={c.textSoft} name={icon} size={18} />
						) : null}
						<View style={styles.valueFill}>{children}</View>
					</View>
				</View>
				{trailing}
			</View>
			{error ? <PaddedErrorMessage message={error} /> : null}
			{!error && helperText ? (
				<Text
					style={[
						t.brand.typography.caption,
						styles.helper,
						{ color: c.textSoft },
					]}
				>
					{helperText}
				</Text>
			) : null}
		</View>
	);
}

const styles = StyleSheet.create({
	box: {
		borderWidth: 1,
		flexDirection: "row",
		gap: 6,
		paddingHorizontal: 12,
	},
	boxMultiline: {
		alignItems: "flex-start",
		minHeight: 131,
		paddingVertical: 12,
	},
	boxSingle: { alignItems: "center", minHeight: 58, paddingVertical: 8 },
	content: {
		flex: 1,
		height: 42,
		position: "relative",
	},
	contentCenter: { justifyContent: "center" },
	contentFloated: { justifyContent: "flex-end" },
	contentMultiline: {
		flex: 1,
		height: undefined,
		justifyContent: "flex-start",
	},
	helper: { paddingHorizontal: 12 },
	valueFill: { flex: 1 },
	valueRow: {
		alignItems: "center",
		flexDirection: "row",
		gap: 6,
		width: "100%",
	},
	// Clear the floated top label on the taller multiline field.
	valueRowMultiline: { marginTop: 18 },
	wrap: { gap: 4, width: "100%" },
});
