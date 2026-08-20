import type { ReactNode } from "react";
import { StyleSheet, View } from "react-native";
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
	icon?: IconName;
	label: string;
	multiline?: boolean;
	/** Trailing node (chevron for selects), vertically centered. */
	trailing?: ReactNode;
}

/**
 * The Figma V3 "Label Inside" input shell: a floating label (placeholder → small
 * top label), a leading icon + value row, and a padded error message below. The
 * label is pinned floated for multiline fields.
 */
export function InputContainer({
	label,
	floated,
	icon,
	trailing,
	error,
	disabled = false,
	multiline = false,
	children,
}: InputContainerProps) {
	const t = useTheme();
	const isFloated = floated || multiline;
	const borderColor = error ? t.colors.error : t.colors.inputBorder;

	return (
		<View style={styles.wrap}>
			<View
				style={[
					styles.box,
					multiline ? styles.boxMultiline : styles.boxSingle,
					{
						backgroundColor: t.colors.surface,
						borderColor,
						borderRadius: t.radii.input,
						opacity: disabled ? 0.5 : 1,
					},
				]}
			>
				<View
					style={[
						styles.content,
						multiline
							? styles.contentMultiline
							: isFloated
								? styles.contentFloated
								: styles.contentCenter,
					]}
				>
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
							<Icon color={t.colors.muted} name={icon} size={18} />
						) : null}
						<View style={styles.valueFill}>{children}</View>
					</View>
				</View>
				{trailing}
			</View>
			{error ? <PaddedErrorMessage message={error} /> : null}
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
	// Empty/unfocused: value row centered (placeholder label sits over it).
	contentCenter: { justifyContent: "center" },
	// Floated: value row drops to the bottom so the top-left label stands clear.
	contentFloated: { justifyContent: "flex-end" },
	contentMultiline: {
		flex: 1,
		height: undefined,
		justifyContent: "flex-start",
	},
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
