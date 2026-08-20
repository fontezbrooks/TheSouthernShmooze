import { Pressable, ScrollView, StyleSheet, Text } from "react-native";
import { useTheme } from "@/theme/ThemeProvider";
import { SUGGESTED_CATEGORIES } from "./categories";

interface CategoryChipProps {
	label: string;
	onPress?: () => void;
	selected: boolean;
}

/**
 * Pill chip — the visual extracted from TaskIntake's private Chip so the
 * Directory tags row, the swipe intake, and the contact page share one look.
 */
export function CategoryChip({ label, selected, onPress }: CategoryChipProps) {
	const t = useTheme();
	return (
		<Pressable
			accessibilityRole="button"
			accessibilityState={{ selected }}
			onPress={onPress}
			style={[
				styles.chip,
				{
					backgroundColor: selected ? t.colors.rust : t.colors.surface,
					borderColor: selected ? t.colors.rustDark : t.colors.inputBorder,
					borderRadius: t.radii.pill,
				},
			]}
		>
			<Text
				style={[
					t.typography.captionSemi,
					{ color: selected ? t.colors.white : t.colors.text },
				]}
			>
				{label}
			</Text>
		</Pressable>
	);
}

interface CategoryChipsProps {
	categories?: readonly string[];
	/** Tap handler — runs that category as the search/keyword. */
	onSelect: (category: string) => void;
	/** Current query/keyword — the chip matching it (case-insensitive) renders selected. */
	selected: string;
}

/** Horizontal scrolling row of provider-type chips (D4 "tags"). */
export function CategoryChips({
	selected,
	onSelect,
	categories = SUGGESTED_CATEGORIES,
}: CategoryChipsProps) {
	const current = selected.trim().toLowerCase();
	return (
		<ScrollView
			contentContainerStyle={styles.row}
			horizontal
			keyboardShouldPersistTaps="handled"
			showsHorizontalScrollIndicator={false}
		>
			{categories.map((category) => (
				<CategoryChip
					key={category}
					label={category}
					onPress={() => onSelect(category)}
					selected={current === category.toLowerCase()}
				/>
			))}
		</ScrollView>
	);
}

const styles = StyleSheet.create({
	chip: {
		alignItems: "center",
		borderWidth: 1,
		height: 36,
		justifyContent: "center",
		paddingHorizontal: 14,
	},
	row: { gap: 8, paddingRight: 16 },
});
