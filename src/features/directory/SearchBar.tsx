import {
	Pressable,
	StyleSheet,
	Text,
	TextInput,
	View,
	type ViewStyle,
} from "react-native";
import { Icon } from "@/components/ui/Icon";
import { useTheme } from "@/theme/ThemeProvider";

const PLACEHOLDER = "Search by service type...";

/**
 * Rebrand pill frame (design.md §E2): white surface, hairline `line` border,
 * soft brand card shadow — replaces the legacy 4px hard-offset shell.
 */
function Shell({
	children,
	pressableProps,
}: {
	children: React.ReactNode;
	pressableProps?: { onPress: () => void; accessibilityLabel: string };
}) {
	const t = useTheme();
	const pill: ViewStyle[] = [
		styles.pill,
		t.brand.shadow.card,
		{
			backgroundColor: t.brand.colors.surface,
			borderColor: t.brand.colors.line,
		},
	];
	return (
		<View style={styles.outer}>
			{pressableProps ? (
				<Pressable
					accessibilityLabel={pressableProps.accessibilityLabel}
					accessibilityRole="button"
					onPress={pressableProps.onPress}
					style={pill}
				>
					{children}
				</Pressable>
			) : (
				<View style={pill}>{children}</View>
			)}
		</View>
	);
}

/** Filled circle-with-X clear control (Figma `circleWithXFilled`). */
function ClearButton({ onPress }: { onPress: () => void }) {
	const t = useTheme();
	return (
		<Pressable
			accessibilityLabel="Clear search"
			accessibilityRole="button"
			hitSlop={8}
			onPress={onPress}
			style={[styles.clear, { backgroundColor: t.brand.colors.textSoft }]}
		>
			<Icon color={t.brand.colors.bg} name="x" size={12} />
		</Pressable>
	);
}

interface SearchBarProps {
	/** Ref to the underlying input so callers can focus it (e.g. arriving from Home). */
	inputRef?: React.RefObject<TextInput | null>;
	onBlur?: () => void;
	onChangeText: (text: string) => void;
	onClear?: () => void;
	onFocus?: () => void;
	value: string;
}

/**
 * Directory search input (Figma 47:14848): rounded rust pill with the hard 4px
 * brown drop shadow, magnifier, "Search by service type…" placeholder, and a
 * filled circle-X clear once populated. Controlled by the parent.
 */
export function SearchBar({
	value,
	onChangeText,
	onFocus,
	onBlur,
	onClear,
	inputRef,
}: SearchBarProps) {
	const t = useTheme();
	return (
		<Shell>
			<Icon color={t.brand.colors.clay} name="search" size={18} />
			<TextInput
				accessibilityLabel="Search the registry"
				autoCapitalize="none"
				autoCorrect={false}
				onBlur={onBlur}
				onChangeText={onChangeText}
				onFocus={onFocus}
				placeholder={PLACEHOLDER}
				placeholderTextColor={t.brand.colors.textSoft}
				ref={inputRef}
				returnKeyType="search"
				style={[
					t.brand.typography.body,
					styles.input,
					{ color: t.brand.colors.text },
				]}
				value={value}
			/>
			{value.length > 0 ? (
				<ClearButton
					onPress={() => {
						onChangeText("");
						onClear?.();
					}}
				/>
			) : null}
		</Shell>
	);
}

/**
 * Non-editable search bar that just routes to the Directory search (the Home
 * entry point — "another option for the same route", no in-place search).
 */
export function SearchBarButton({ onPress }: { onPress: () => void }) {
	const t = useTheme();
	return (
		<Shell
			pressableProps={{ accessibilityLabel: "Search the registry", onPress }}
		>
			<Icon color={t.brand.colors.clay} name="search" size={18} />
			<Text
				style={[
					t.brand.typography.body,
					styles.input,
					{ color: t.brand.colors.textSoft },
				]}
			>
				{PLACEHOLDER}
			</Text>
		</Shell>
	);
}

const styles = StyleSheet.create({
	clear: {
		alignItems: "center",
		borderRadius: 9,
		height: 18,
		justifyContent: "center",
		width: 18,
	},
	// Center the text in the 48px pill: no default vertical padding, lineHeight
	// tightened below the 24px body token (which sat the text low) but ABOVE the
	// font size — a 16px line box clipped the font's ascenders at the top
	// (device report). Listed AFTER t.brand.typography.body so the override wins.
	input: {
		flex: 1,
		includeFontPadding: false,
		lineHeight: 20,
		paddingVertical: 0,
		textAlignVertical: "center",
	},
	outer: { position: "relative", width: "100%" },
	pill: {
		alignItems: "center",
		borderRadius: 999,
		borderWidth: 1,
		flexDirection: "row",
		gap: 6,
		height: 48,
		paddingHorizontal: 12,
	},
});
