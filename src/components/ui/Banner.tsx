import type { ReactNode } from "react";
import {
	Image,
	type ImageSourcePropType,
	StyleSheet,
	Text,
	View,
} from "react-native";
import { useTheme } from "@/theme/ThemeProvider";
import { PhysicalPressable } from "./PhysicalPressable";

interface BannerProps {
	/** CTA is visual only — the whole banner is the tap target. */
	cta: { label: string };
	/** lg = taller CTA with the full-size button label (community banner, H9). Default md. */
	ctaSize?: "md" | "lg";
	/** Banner photo (Figma V3). Omit for text-first blocks (Newsletter — approved, design §8). */
	image?: ImageSourcePropType;
	/** Component image (e.g. a transformer-imported SVG) rendered in the image slot instead of `image`. */
	imageNode?: ReactNode;
	/**
	 * imageTop = photo across the top (Concierge top card); imageLeft = photo
	 * beside the copy (community); titleRow = logo + title share the top row,
	 * subtitle and a full-width CTA span below (Match block, SR3).
	 */
	layout: "imageTop" | "imageLeft" | "titleRow";
	onPress: () => void;
	subtitle?: string;
	title: string;
	/** Figma 85:3127 centers the top-card "Concierge" title. Default left. */
	titleAlign?: "left" | "center";
	/** Per-usage title leading override (community banner uses a tighter value). */
	titleLineHeight?: number;
}

/** Dark solid CTA (Figma V3 banner button — #602A00, white label ). Presentational. */
function BannerCta({
	label,
	fullWidth,
	size = "md",
}: {
	label: string;
	fullWidth?: boolean;
	size?: "md" | "lg";
}) {
	const t = useTheme();
	const isLg = size === "lg";
	return (
		<View
			style={[
				styles.cta,
				isLg && styles.ctaLg,
				fullWidth && styles.ctaFull,
				{ backgroundColor: t.colors.rustDark, borderRadius: t.radii.button },
			]}
		>
			<Text
				style={[
					isLg ? t.typography.bodySemibold : t.typography.captionSemi,
					{ color: t.colors.white },
				]}
			>
				{label}
			</Text>
		</View>
	);
}

/**
 * Rust promo banner with a photo — the Figma V3 "Banner". The ENTIRE surface
 * (incl. the dark CTA) is one physical-press tap target. `imageTop` stacks the
 * photo above the copy with a full-width button; `imageLeft` places the photo to
 * the left with the copy + a hug-width button on the right.
 */
export function Banner({
	title,
	subtitle,
	image,
	imageNode,
	layout,
	titleAlign = "left",
	cta,
	ctaSize = "md",
	titleLineHeight,
	onPress,
}: BannerProps) {
	const t = useTheme();
	const isTop = layout === "imageTop";
	const isTitleRow = layout === "titleRow";

	const titleNode = (
		<Text
			style={[
				t.typography.displayS,
				{ color: t.colors.bg },
				titleAlign === "center" && styles.titleCenter,
				titleLineHeight != null && { lineHeight: titleLineHeight },
			]}
		>
			{title}
		</Text>
	);
	const subtitleNode = subtitle ? (
		<Text style={[t.typography.body, { color: t.colors.white }]}>
			{subtitle}
		</Text>
	) : null;
	const imageSlot =
		imageNode ??
		(image ? (
			<Image
				resizeMode="cover"
				source={image}
				style={isTop ? styles.imageTop : styles.imageLeft}
			/>
		) : null);

	return (
		<PhysicalPressable
			accessibilityLabel={title}
			onPress={onPress}
			radius={t.radii.card}
			shadowColor={t.colors.rustDark}
			style={[
				isTop || isTitleRow ? styles.wrapTop : styles.wrapLeft,
				{
					backgroundColor: t.colors.rust,
					borderColor: t.colors.rustDark,
					borderRadius: t.radii.card,
				},
			]}
		>
			{isTop ? (
				// Figma 85:3127 (amendment A1): title → image → helper text → CTA.
				<>
					{titleNode}
					{imageSlot}
					{subtitleNode}
					<BannerCta fullWidth label={cta.label} size={ctaSize} />
				</>
			) : isTitleRow ? (
				// SR3 grid: [logo | title] row → helper text → full-width CTA.
				<>
					<View style={styles.titleRow}>
						{imageSlot}
						<View style={styles.titleRowText}>{titleNode}</View>
					</View>
					{subtitleNode}
					<BannerCta fullWidth label={cta.label} size={ctaSize} />
				</>
			) : (
				<>
					{imageSlot}
					<View style={styles.rightCol}>
						<View style={styles.copy}>
							{titleNode}
							{subtitleNode}
						</View>
						<BannerCta label={cta.label} size={ctaSize} />
					</View>
				</>
			)}
		</PhysicalPressable>
	);
}

const styles = StyleSheet.create({
	copy: { gap: 4, width: "100%" },
	cta: {
		alignItems: "center",
		alignSelf: "flex-start",
		height: 32,
		justifyContent: "center",
		paddingHorizontal: 12,
		paddingVertical: 8,
	},
	ctaFull: { alignSelf: "stretch", width: "100%" },
	ctaLg: { height: 44, paddingHorizontal: 16 },
	imageLeft: { height: 169, width: 88 },
	imageTop: { borderRadius: 8, height: 124, width: "100%" },
	rightCol: { alignItems: "flex-start", flex: 1, gap: 16 },
	titleCenter: { alignSelf: "stretch", textAlign: "center" },
	titleRow: {
		alignItems: "center",
		alignSelf: "stretch",
		flexDirection: "row",
		gap: 16,
	},
	titleRowText: { flex: 1 },
	wrapLeft: {
		alignItems: "center",
		borderWidth: 2,
		flexDirection: "row",
		gap: 16,
		paddingLeft: 16,
		paddingRight: 24,
		paddingVertical: 24,
		width: "100%",
	},
	wrapTop: {
		alignItems: "flex-start",
		borderWidth: 2,
		gap: 16,
		padding: 24,
		width: "100%",
	},
});
