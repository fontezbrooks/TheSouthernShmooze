import { Pressable, ScrollView, StyleSheet, Text } from "react-native";
import { useTheme } from "@/theme/ThemeProvider";
import { SUGGESTED_CATEGORIES } from "./categories";

interface CategoryChipProps {
	label: string;
	onPress?: () => void;
	selected: boolean;
}

/**
 * Pill chip on `t.brand` — surface + `line` hairline at rest, clay fill with a
 * magnolia label when selected (5.74:1). Shared by the Directory tags row,
 * the swipe intake, the contact page and the concierge trade picker.
 */
export function CategoryChip({ label, selected, onPress }: CategoryChipProps) {
	const t = useTheme();
	const c = t.brand.colors;
	return (
		<Pressable
			accessibilityRole="button"
			accessibilityState={{ selected }}
			onPress={onPress}
			style={[
				styles.chip,
				{
					backgroundColor: selected ? c.clay : c.surface,
					borderColor: selected ? c.clay : c.line,
					borderRadius: t.brand.radii.pill,
				},
			]}
		>
			<Text
				style={[t.brand.typography.label, { color: selected ? c.bg : c.text }]}
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
	// minHeight, not height: the label must be able to grow under Dynamic Type.
	chip: {
		alignItems: "center",
		borderWidth: StyleSheet.hairlineWidth,
		justifyContent: "center",
		minHeight: 36,
		paddingHorizontal: 14,
	},
	row: { gap: 8, paddingRight: 16 },
});
