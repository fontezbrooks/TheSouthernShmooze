import type { ReactNode } from "react";
import { StyleSheet, Text, View } from "react-native";
import { useTheme } from "@/theme/ThemeProvider";

/** Page gutter. Sections own their padding so a child can bleed past it. */
export const PAGE_PADDING = 16;

interface HomeSectionProps {
	/** Trailing control on the heading row (e.g. a "View all" pill). */
	action?: ReactNode;
	/** Skip the gutter on children so a horizontal rail can run off the edge. */
	bleed?: boolean;
	children: ReactNode;
	/**
	 * Handwritten Caveat lead-in. This is the site's own section grammar
	 * (report.md §8.5) — a named brand system, not a generic tracked eyebrow —
	 * so it is used sparingly and only where a section needs a voice.
	 */
	kicker?: string;
	paddingBottom?: number;
	paddingTop?: number;
	title?: string;
	/** `cream` = porch-cream band, marking the sections that ARE the registry. */
	tone?: "cream" | "plain";
}

/**
 * One band of the Home scroll. Alternating `plain` (magnolia) and `cream`
 * (porch-cream) bands give the page its rhythm — the thing six identical
 * full-width promo cards could not do.
 */
export function HomeSection({
	action,
	bleed = false,
	children,
	kicker,
	paddingBottom = 32,
	paddingTop = 32,
	title,
	tone = "plain",
}: HomeSectionProps) {
	const t = useTheme();
	const hasHeading = Boolean(title || kicker || action);

	return (
		<View
			style={[
				{ paddingBottom, paddingTop },
				tone === "cream" && { backgroundColor: t.brand.colors.porchCream },
			]}
		>
			{hasHeading ? (
				<View style={styles.heading}>
					<View style={styles.headingText}>
						{kicker ? (
							<Text
								style={[
									t.brand.typography.accent,
									{ color: t.brand.colors.clay },
								]}
							>
								{kicker}
							</Text>
						) : null}
						{title ? (
							<Text
								accessibilityRole="header"
								style={t.brand.typography.displayL}
							>
								{title}
							</Text>
						) : null}
					</View>
					{action}
				</View>
			) : null}
			<View style={bleed ? undefined : styles.gutter}>{children}</View>
		</View>
	);
}

const styles = StyleSheet.create({
	gutter: { paddingHorizontal: PAGE_PADDING },
	heading: {
		alignItems: "flex-end",
		flexDirection: "row",
		gap: 12,
		justifyContent: "space-between",
		marginBottom: 16,
		paddingHorizontal: PAGE_PADDING,
	},
	headingText: { flex: 1 },
});
