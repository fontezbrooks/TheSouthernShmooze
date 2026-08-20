import { Image, StyleSheet, Text, View } from "react-native";
import { CertifiedBadge } from "@/components/ui/CertifiedBadge";
import { Icon } from "@/components/ui/Icon";
import { useTheme } from "@/theme/ThemeProvider";
import { ConfidenceBadge } from "./ConfidenceBadge";
import type { DeckCard } from "./swipeTypes";

/** The face of a swipe card: logo, name, tagline, confidence, distance, badges. */
export function DeckCardView({ card }: { card: DeckCard }) {
	const t = useTheme();
	const distance =
		card.distanceKm == null ? null : `${card.distanceKm.toFixed(1)} km away`;

	return (
		<View
			style={[
				styles.card,
				{
					backgroundColor: t.colors.surface,
					borderColor: t.colors.rustDark,
					borderRadius: t.radii.card,
				},
				t.shadow.hard,
			]}
		>
			<View
				style={[
					styles.imageWrap,
					{ borderBottomColor: t.colors.imageHairline },
				]}
			>
				{card.logoUrl ? (
					<Image
						resizeMode="cover"
						source={{ uri: card.logoUrl }}
						style={styles.imageFill}
					/>
				) : (
					<View
						style={[
							styles.imageFill,
							styles.placeholder,
							{ backgroundColor: t.colors.bg },
						]}
					>
						<Icon color={t.colors.rustDark} name="briefcaseFilled" size={96} />
					</View>
				)}
			</View>

			<View style={styles.body}>
				<ConfidenceBadge
					confidence={card.confidence}
					isFeatured={card.isFeatured}
				/>
				<Text numberOfLines={2} style={t.typography.displayXS}>
					{card.name}
				</Text>
				{card.tagline ? (
					<Text numberOfLines={3} style={t.typography.body}>
						{card.tagline}
					</Text>
				) : null}
				<View style={styles.meta}>
					{card.isCertified ? <CertifiedBadge label="Certified" /> : null}
					{distance ? (
						<Text style={[t.typography.caption, { color: t.colors.muted }]}>
							{distance}
						</Text>
					) : null}
				</View>
			</View>
		</View>
	);
}

const styles = StyleSheet.create({
	body: { gap: 10, padding: 16 },
	card: { borderWidth: 2, overflow: "hidden", width: "100%" },
	imageFill: { height: "100%", width: "100%" },
	imageWrap: {
		borderBottomWidth: StyleSheet.hairlineWidth,
		height: 280,
		width: "100%",
	},
	meta: { alignItems: "center", flexDirection: "row", gap: 12 },
	placeholder: { alignItems: "center", justifyContent: "center" },
});
