import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import { CardBadge } from "@/components/ui/CardBadge";
import { CertifiedBadge } from "@/components/ui/CertifiedBadge";
import { Icon } from "@/components/ui/Icon";
import type { DirectoryBusiness } from "@/features/providers/providerTypes";
import { useTheme } from "@/theme/ThemeProvider";

interface BusinessCardHorizontalProps {
	business: DirectoryBusiness;
	onPress: (sourceUid: string) => void;
}

const LOGO_SIZE = 104;

/**
 * Horizontal directory list card (Figma node 40:7337). Flat layout — no card
 * border/background/shadow; only the square logo carries an 8px radius + hairline.
 * Body stacks reviews/discount badges (top), name + 2-line tagline, and the
 * "Shmooze Certified" pill (bottom). The whole row opens the business-detail
 * screen. No-logo businesses show a briefcase placeholder.
 */
export function BusinessCardHorizontal({
	business,
	onPress,
}: BusinessCardHorizontalProps) {
	const t = useTheme();
	const hasBadges = business.recommended || business.hasCoupon;

	return (
		<Pressable
			accessibilityLabel={`${business.name} — view details`}
			accessibilityRole="button"
			onPress={() => onPress(business.sourceUid)}
			style={({ pressed }) => [styles.card, { opacity: pressed ? 0.7 : 1 }]}
		>
			{business.logoUrl ? (
				<Image
					resizeMode="cover"
					source={{ uri: business.logoUrl }}
					style={[styles.logo, { borderColor: t.brand.colors.line }]}
				/>
			) : (
				<View
					style={[
						styles.logo,
						styles.placeholder,
						{
							backgroundColor: t.brand.colors.porchCream,
							borderColor: t.brand.colors.line,
						},
					]}
				>
					<Icon color={t.brand.colors.pine} name="briefcaseFilled" size={40} />
				</View>
			)}

			<View style={styles.body}>
				{hasBadges ? (
					<View style={styles.badgeRow}>
						{business.recommended ? <CardBadge icon="thumbsUp" /> : null}
						{business.hasCoupon ? <CardBadge icon="discount" /> : null}
					</View>
				) : null}

				<View style={styles.copy}>
					<Text
						numberOfLines={2}
						style={[
							t.typography.cardTitle,
							{
								color: t.brand.colors.text,
								fontFamily: t.brand.fonts.bodyBold,
							},
						]}
					>
						{business.name}
					</Text>
					<Text
						ellipsizeMode="tail"
						numberOfLines={2}
						style={[
							t.brand.typography.caption,
							{ color: t.brand.colors.textSoft },
						]}
					>
						{business.tagline}
					</Text>
				</View>

				{business.isCertified ? <CertifiedBadge /> : null}
			</View>
		</Pressable>
	);
}

const styles = StyleSheet.create({
	badgeRow: { flexDirection: "row", gap: 4 },
	body: {
		flex: 1,
		gap: 6,
		justifyContent: "center",
		paddingHorizontal: 12,
		paddingVertical: 8,
	},
	card: {
		alignItems: "center",
		flexDirection: "row",
		height: LOGO_SIZE,
		width: "100%",
	},
	copy: { gap: 2 },
	logo: {
		borderRadius: 8,
		borderWidth: StyleSheet.hairlineWidth,
		height: LOGO_SIZE,
		width: LOGO_SIZE,
	},
	placeholder: { alignItems: "center", justifyContent: "center" },
});
