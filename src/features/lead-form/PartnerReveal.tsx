import { useEffect, useState } from "react";
import { ActivityIndicator, Image, StyleSheet, Text, View } from "react-native";
import { Button } from "@/components/ui/Button";
import { providerRepository } from "@/features/providers/providerRepository";
import type { DirectoryBusiness } from "@/features/providers/providerTypes";
import { useAnalytics } from "@/lib/analytics/useAnalytics";
import { openLink } from "@/lib/openLink";
import { useTheme } from "@/theme/ThemeProvider";

interface PartnerRevealProps {
	/** "Done" — the caller resets the flow THEN navigates, so the tab-preserved screen does not re-render success. */
	onDone: () => void;
	/** "See every certified pro in the directory". */
	onSeeDirectory: () => void;
}

/** Logo + name + tap-to-call for the matched preferred partner. */
function PartnerRow({
	partner,
	onCall,
}: {
	partner: DirectoryBusiness;
	onCall: (partner: DirectoryBusiness) => void;
}) {
	const t = useTheme();
	return (
		<View style={styles.partnerRow}>
			{partner.logoUrl ? (
				<Image
					resizeMode="cover"
					source={{ uri: partner.logoUrl }}
					style={[styles.logo, { borderColor: t.brand.colors.line }]}
				/>
			) : null}
			<View style={styles.partnerCol}>
				<Text
					style={[t.brand.typography.chip, { color: t.brand.colors.textSoft }]}
				>
					Your Shmooze preferred partner
				</Text>
				<Text
					style={[t.brand.typography.bodySemi, { color: t.brand.colors.text }]}
				>
					{partner.name}
				</Text>
				{partner.phoneDisplay && partner.phone ? (
					<Text
						accessibilityLabel={`Call ${partner.name} at ${partner.phoneDisplay}`}
						accessibilityRole="link"
						onPress={() => onCall(partner)}
						style={[t.brand.typography.caption, { color: t.brand.colors.clay }]}
					>
						Prefer to reach out now? {partner.phoneDisplay}
					</Text>
				) : null}
			</View>
		</View>
	);
}

/**
 * Concierge confirmation with the preferred-partner reveal (FR-4.3, site
 * parity: "Your Shmooze preferred partners"). Interim partner rule per
 * design.md §E3: the pinned/certified providers stand in until the
 * conciergeRotation data lands at-launch (L4). Best-effort: if the fetch
 * fails, the confirmation copy still stands on its own.
 */
export function PartnerReveal({ onDone, onSeeDirectory }: PartnerRevealProps) {
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

	const callPartner = (p: DirectoryBusiness) => {
		track("partner_call_button_clicked", {
			call_placement_source: "find_my_pro_completion",
			pro_business_id: p.sourceUid,
		});
		openLink(`tel:${p.phone}`);
	};

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
					reach out to you shortly. Keep an eye on your phone and email.
				</Text>

				<View
					style={[styles.partners, { borderTopColor: t.brand.colors.line }]}
				>
					<Text
						style={[
							t.brand.typography.bodySemi,
							{ color: t.brand.colors.text },
						]}
					>
						Prefer someone else?
					</Text>
					<Text style={t.brand.typography.body}>
						These are the Shmooze preferred partners for your project. One of
						them will be in contact with you shortly. Prefer to reach out now?
						Go right ahead.
					</Text>
				</View>

				{loading ? <ActivityIndicator color={t.brand.colors.clay} /> : null}
				{!loading && partner ? (
					<PartnerRow onCall={callPartner} partner={partner} />
				) : null}
			</View>
			<Text
				accessibilityRole="link"
				onPress={onSeeDirectory}
				style={[
					t.brand.typography.bodySemi,
					styles.directoryLink,
					{ color: t.brand.colors.clay },
				]}
			>
				See every certified pro in the directory
			</Text>
			<Button label="Done" onPress={onDone} variant="primary" />
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
	directoryLink: {
		alignSelf: "center",
		minHeight: 44,
		paddingHorizontal: 16,
		textAlign: "center",
		textAlignVertical: "center",
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
		flexDirection: "row",
		gap: 12,
	},
	partners: {
		alignSelf: "stretch",
		borderTopWidth: StyleSheet.hairlineWidth,
		gap: 4,
		paddingTop: 16,
	},
	wrap: { gap: 16 },
});
