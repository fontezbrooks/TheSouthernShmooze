import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import { CardBadge } from "@/components/ui/CardBadge";
import { CertifiedBadge } from "@/components/ui/CertifiedBadge";
import { Icon } from "@/components/ui/Icon";
import { PhysicalPressable } from "@/components/ui/PhysicalPressable";
import { useTheme } from "@/theme/ThemeProvider";
import type { DirectoryBusiness } from "./providerTypes";

interface BusinessCardProps {
	business: DirectoryBusiness;
	onCallPress: (phone: string) => void;
	onCardPress: (sourceUid: string) => void;
}

const CARD_WIDTH = 168; // 164 image + 2px border each side
const IMAGE_SIZE = 164;

/**
 * A Certified Providers card. The whole card is a physical-press tap target that
 * opens the web directory listing; the rust phone button is a separate nested tap
 * that dials. No-logo businesses show a briefcase placeholder.
 */
export function BusinessCard({
	business,
	onCallPress,
	onCardPress,
}: BusinessCardProps) {
	const t = useTheme();

	return (
		<PhysicalPressable
			accessibilityLabel={`${business.name} — open registry listing`}
			fullWidth={false}
			onPress={() => onCardPress(business.sourceUid)}
			radius={t.radii.card}
			shadowColor={t.colors.rustDark}
			style={[
				styles.card,
				{
					backgroundColor: t.colors.surface,
					borderColor: t.colors.rustDark,
					borderRadius: t.radii.card,
				},
			]}
		>
			<View
				style={[
					styles.imageWrap,
					{ borderBottomColor: t.colors.imageHairline },
				]}
			>
				{business.logoUrl ? (
					<Image
						resizeMode="cover"
						source={{ uri: business.logoUrl }}
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
						<Icon color={t.colors.rustDark} name="briefcaseFilled" size={63} />
					</View>
				)}
			</View>

			<View style={styles.body}>
				<View style={styles.copy}>
					<Text
						ellipsizeMode="tail"
						numberOfLines={2}
						style={[t.typography.cardTitle, styles.name]}
					>
						{business.name}
					</Text>
					<Text
						ellipsizeMode="tail"
						numberOfLines={2}
						style={[t.typography.caption, styles.tagline]}
					>
						{business.tagline}
					</Text>
				</View>

				<View style={styles.chips}>
					<CertifiedBadge label="Certified" />
					{business.recommended ? <CardBadge icon="thumbsUp" /> : null}
					{business.hasCoupon ? <CardBadge icon="discount" /> : null}
				</View>

				{business.phoneDisplay && business.phone ? (
					<Pressable
						accessibilityLabel={`Call ${business.name}`}
						accessibilityRole="button"
						onPress={() => onCallPress(business.phone as string)}
						style={[styles.phoneBtn, { backgroundColor: t.colors.rust }]}
					>
						<Icon color={t.colors.white} name="phoneFilled" size={12} />
						<Text style={[t.typography.captionSemi, { color: t.colors.white }]}>
							{business.phoneDisplay}
						</Text>
					</Pressable>
				) : null}
			</View>
		</PhysicalPressable>
	);
}

const styles = StyleSheet.create({
	body: {
		gap: 8,
		padding: 12,
	},
	card: {
		borderWidth: 2,
		overflow: "hidden",
		width: CARD_WIDTH,
	},
	chips: { alignItems: "center", flexDirection: "row", gap: 6 },
	copy: { gap: 2 },
	imageFill: { height: "100%", width: "100%" },
	imageWrap: {
		borderBottomWidth: StyleSheet.hairlineWidth,
		height: IMAGE_SIZE,
		width: "100%",
	},
	// Reserve a fixed name + description height so every card is the same size,
	// regardless of name/description length (caption lh 18 → 2 lines = 36). Descriptions
	// are capped at 2 lines + ellipsis so short copy doesn't leave a gap before the badge.
	name: { minHeight: 36 },
	phoneBtn: {
		alignItems: "center",
		borderRadius: 9999,
		flexDirection: "row",
		gap: 6,
		height: 32,
		justifyContent: "center",
		overflow: "hidden",
		paddingHorizontal: 12,
		width: "100%",
	},
	placeholder: { alignItems: "center", justifyContent: "center" },
	tagline: { minHeight: 36 },
});
