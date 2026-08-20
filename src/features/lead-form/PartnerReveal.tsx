import { useEffect, useState } from "react";
import { ActivityIndicator, Image, StyleSheet, Text, View } from "react-native";
import { Button } from "@/components/ui/Button";
import { providerRepository } from "@/features/providers/providerRepository";
import type { DirectoryBusiness } from "@/features/providers/providerTypes";
import { useAnalytics } from "@/lib/analytics/useAnalytics";
import { openLink } from "@/lib/openLink";
import { useTheme } from "@/theme/ThemeProvider";

interface PartnerRevealProps {
	onBackHome: () => void;
	/** Clears the completed flow so another request can start (tab-preserved screens re-render success otherwise). */
	onSubmitAnother: () => void;
}

/**
 * Concierge confirmation with the preferred-partner reveal (FR-4.3, site
 * parity: "Your Shmooze preferred partners"). Interim partner rule per
 * design.md §E3: the pinned/certified providers stand in until the
 * conciergeRotation data lands at-launch (L4). Best-effort: if the fetch
 * fails, the confirmation copy still stands on its own.
 */
export function PartnerReveal({
	onBackHome,
	onSubmitAnother,
}: PartnerRevealProps) {
	const t = useTheme();
	const { track } = useAnalytics();
	const [loading, setLoading] = useState(true);
	const [partner, setPartner] = useState<DirectoryBusiness | null>(null);

	useEffect(() => {
		let alive = true;
		(async () => {
			const res = await providerRepository.fetchPinned();
			if (!alive) {
				return;
			}
			setPartner(res.ok ? (res.data[0] ?? null) : null);
			setLoading(false);
		})();
		return () => {
			alive = false;
		};
	}, []);

	return (
		<View accessibilityLiveRegion="polite" style={styles.wrap}>
			<View
				style={[
					styles.card,
					t.brand.shadow.card,
					{
						backgroundColor: t.brand.colors.surface,
						borderColor: t.brand.colors.line,
						borderRadius: t.brand.radii.lg,
					},
				]}
			>
				<Text
					style={[t.brand.typography.displayM, { color: t.brand.colors.text }]}
				>
					We&apos;re on it.
				</Text>
				<Text style={t.brand.typography.body}>
					We&apos;ve received your request. Your Shmooze preferred partner will
					reach out to you shortly — keep an eye on your phone and email.
				</Text>

				{loading ? (
					<ActivityIndicator color={t.brand.colors.clay} />
				) : partner ? (
					<View
						style={[styles.partnerRow, { borderTopColor: t.brand.colors.line }]}
					>
						{partner.logoUrl ? (
							<Image
								resizeMode="cover"
								source={{ uri: partner.logoUrl }}
								style={[styles.logo, { borderColor: t.brand.colors.line }]}
							/>
						) : null}
						<View style={styles.partnerCol}>
							<Text
								style={[
									t.brand.typography.chip,
									{ color: t.brand.colors.textSoft },
								]}
							>
								Your Shmooze preferred partner
							</Text>
							<Text
								style={[
									t.brand.typography.bodySemi,
									{ color: t.brand.colors.text },
								]}
							>
								{partner.name}
							</Text>
							{partner.phoneDisplay && partner.phone ? (
								<Text
									accessibilityLabel={`Call ${partner.name} at ${partner.phoneDisplay}`}
									accessibilityRole="link"
									onPress={() => {
										track("partner_call_button_clicked", {
											call_placement_source: "find_my_pro_completion",
											pro_business_id: partner.sourceUid,
										});
										openLink(`tel:${partner.phone}`);
									}}
									style={[
										t.brand.typography.caption,
										{ color: t.brand.colors.clay },
									]}
								>
									Prefer to reach out now? {partner.phoneDisplay}
								</Text>
							) : null}
						</View>
					</View>
				) : null}
			</View>
			<Button label="Back Home" onPress={onBackHome} variant="primary" />
			<Button
				label="Submit Another Request"
				onPress={onSubmitAnother}
				variant="wide"
			/>
		</View>
	);
}

const styles = StyleSheet.create({
	card: {
		alignItems: "flex-start",
		borderWidth: StyleSheet.hairlineWidth,
		gap: 16,
		padding: 24,
	},
	logo: {
		borderRadius: 16,
		borderWidth: StyleSheet.hairlineWidth,
		height: 56,
		width: 56,
	},
	partnerCol: { flex: 1, gap: 2 },
	partnerRow: {
		alignItems: "center",
		alignSelf: "stretch",
		borderTopWidth: StyleSheet.hairlineWidth,
		flexDirection: "row",
		gap: 12,
		paddingTop: 16,
	},
	wrap: { gap: 16 },
});
