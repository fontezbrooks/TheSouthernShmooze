import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import { CardBadge } from "@/components/ui/CardBadge";
import { CertifiedBadge } from "@/components/ui/CertifiedBadge";
import { Icon } from "@/components/ui/Icon";
import { useTheme } from "@/theme/ThemeProvider";
import type { DirectoryBusiness } from "./providerTypes";

interface BusinessCardProps {
	business: DirectoryBusiness;
	onCallPress: (phone: string) => void;
	onCardPress: (sourceUid: string) => void;
}

const CARD_WIDTH = 168;
const LOGO_SIZE = 140;
const PIN_SIZE = 10;

// Press-in only fires after this delay, so starting a SCROLL on a card no
// longer depresses it — the FlatList claims the gesture first (SR4). Carried
// over from the PhysicalPressable this card used to sit on.
const PRESS_DELAY_MS = 120;

/**
 * A Certified Providers card on the 2026 brand tokens, modelled on the site's
 * registry card (report.md §8.5): white surface, gold hairline, a gold pin on
 * the top edge, the logo in a framed inset, soft card shadow. The whole card is
 * one tap target that opens the registry listing; the clay phone pill is a
 * separate nested tap that dials. No-logo businesses show a briefcase
 * placeholder.
 *
 * The legacy card pushed into a 4px hard-offset shadow via PhysicalPressable.
 * That motion belongs to the old design language; the brand's depth is a soft
 * blur, so press feedback is the same opacity dip the Home fork cards use.
 */
export function BusinessCard({
	business,
	onCallPress,
	onCardPress,
}: BusinessCardProps) {
	const t = useTheme();

	return (
		<Pressable
			accessibilityLabel={`${business.name} — open registry listing`}
			accessibilityRole="button"
			onPress={() => onCardPress(business.sourceUid)}
			style={({ pressed }) => [
				styles.card,
				t.brand.shadow.card,
				{
					backgroundColor: t.brand.colors.surface,
					borderColor: t.brand.colors.gold,
					borderRadius: t.brand.radii.md,
				},
				pressed && styles.pressed,
			]}
			unstable_pressDelay={PRESS_DELAY_MS}
		>
			{/* The site's gold pin — decorative, marks "this one is on the registry". */}
			<View
				pointerEvents="none"
				style={[styles.pin, { backgroundColor: t.brand.colors.gold }]}
			/>

			<View
				style={[
					styles.logoFrame,
					{
						borderColor: t.brand.colors.line,
						borderRadius: t.brand.radii.sm,
					},
				]}
			>
				{business.logoUrl ? (
					<Image
						resizeMode="cover"
						source={{ uri: business.logoUrl }}
						style={[styles.logoFill, { borderRadius: t.brand.radii.sm }]}
					/>
				) : (
					<View
						style={[
							styles.logoFill,
							styles.placeholder,
							{ backgroundColor: t.brand.colors.porchCream },
						]}
					>
						<Icon
							color={t.brand.colors.pine}
							name="briefcaseFilled"
							size={48}
						/>
					</View>
				)}
			</View>

			<View style={styles.body}>
				<View style={styles.copy}>
					<Text
						ellipsizeMode="tail"
						numberOfLines={2}
						style={[t.brand.typography.bodySemi, styles.name]}
					>
						{business.name}
					</Text>
					<Text
						ellipsizeMode="tail"
						numberOfLines={2}
						style={[t.brand.typography.caption, styles.tagline]}
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
						style={({ pressed }) => [
							styles.phoneBtn,
							{
								backgroundColor: t.brand.colors.clay,
								borderRadius: t.brand.radii.pill,
							},
							pressed && styles.pressed,
						]}
					>
						<Icon color={t.brand.colors.bg} name="phoneFilled" size={12} />
						<Text style={[t.brand.typography.button, styles.phoneLabel]}>
							{business.phoneDisplay}
						</Text>
					</Pressable>
				) : null}
			</View>
		</Pressable>
	);
}

const styles = StyleSheet.create({
	body: { gap: 8, paddingHorizontal: 12, paddingVertical: 12 },
	card: {
		borderWidth: 1,
		// Top padding clears the pin; the logo frame inset starts below it.
		paddingTop: 14,
		width: CARD_WIDTH,
	},
	chips: { alignItems: "center", flexDirection: "row", gap: 6 },
	copy: { gap: 2 },
	logoFill: { height: "100%", width: "100%" },
	logoFrame: {
		alignSelf: "center",
		borderWidth: StyleSheet.hairlineWidth,
		height: LOGO_SIZE,
		overflow: "hidden",
		width: LOGO_SIZE,
	},
	// Reserve two lines of name + two of tagline so every card is the same
	// height regardless of copy length (14/18 × 2 = 36; caption 12/18 × 2 = 36).
	name: { fontSize: 14, lineHeight: 18, minHeight: 36 },
	phoneBtn: {
		alignItems: "center",
		flexDirection: "row",
		gap: 6,
		height: 32,
		justifyContent: "center",
		overflow: "hidden",
		paddingHorizontal: 12,
		width: "100%",
	},
	phoneLabel: { fontSize: 13, lineHeight: 16 },
	// Centred on the top edge, half outside the card like a push-pin.
	pin: {
		alignSelf: "center",
		borderRadius: PIN_SIZE / 2,
		height: PIN_SIZE,
		position: "absolute",
		top: -(PIN_SIZE / 2),
		width: PIN_SIZE,
	},
	placeholder: { alignItems: "center", justifyContent: "center" },
	pressed: { opacity: 0.92 },
	tagline: { minHeight: 36 },
});
