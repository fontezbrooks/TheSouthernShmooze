import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, Image, StyleSheet, Text, View } from "react-native";
import { Button } from "@/components/ui/Button";
import { CertifiedBadge } from "@/components/ui/CertifiedBadge";
import { businessDetailRepository } from "@/features/business-detail/businessDetailRepository";
import type { BusinessDetail } from "@/features/business-detail/businessDetailTypes";
import { openLink } from "@/lib/openLink";
import { useTheme } from "@/theme/ThemeProvider";
import { CenteredSheet } from "./CenteredSheet";

interface ProfileQuickViewProps {
	onClose: () => void;
	sourceUid: string | null;
	visible: boolean;
}

/**
 * Profile quick view (S8): a condensed peek at a provider from the deck —
 * logo, name, certified badge, tagline, address, call, and a jump to the full
 * profile. Data via the same repository as the full detail screen.
 */
export function ProfileQuickView({
	visible,
	sourceUid,
	onClose,
}: ProfileQuickViewProps) {
	const t = useTheme();
	const router = useRouter();
	const [detail, setDetail] = useState<BusinessDetail | null>(null);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		if (!(visible && sourceUid)) {
			return;
		}
		let alive = true;
		(async () => {
			setLoading(true);
			setError(null);
			setDetail(null);
			const res = await businessDetailRepository.fetchByUid(sourceUid);
			if (!alive) {
				return;
			}
			if (res.ok) {
				setDetail(res.data);
			} else {
				setError(res.error);
			}
			setLoading(false);
		})();
		return () => {
			alive = false;
		};
	}, [visible, sourceUid]);

	const openFullProfile = () => {
		onClose();
		if (sourceUid) {
			router.push(`/business/${sourceUid}`);
		}
	};

	return (
		<CenteredSheet onClose={onClose} visible={visible}>
			<View style={styles.body}>
				{loading ? (
					<ActivityIndicator color={t.colors.rust} style={styles.spinner} />
				) : error ? (
					<Text style={[t.typography.body, { color: t.colors.error }]}>
						{error}
					</Text>
				) : detail ? (
					<>
						<View style={styles.headerRow}>
							{detail.logoUrl ? (
								<Image
									resizeMode="cover"
									source={{ uri: detail.logoUrl }}
									style={[styles.logo, { borderColor: t.colors.rustDark }]}
								/>
							) : null}
							<View style={styles.headerCol}>
								<Text style={t.typography.displayXS}>{detail.name}</Text>
								{detail.isCertified ? <CertifiedBadge /> : null}
							</View>
						</View>

						{detail.tagline ? (
							<Text style={[t.typography.body, { color: t.colors.textSoft }]}>
								{detail.tagline}
							</Text>
						) : null}
						{detail.address ? (
							<Text
								style={[t.typography.captionSemi, { color: t.colors.muted }]}
							>
								{detail.address}
							</Text>
						) : null}

						<View style={styles.actions}>
							{detail.phones[0] ? (
								<Button
									label={`Call ${detail.phones[0].display}`}
									onPress={() => openLink(`tel:${detail.phones[0].raw}`)}
									variant="outline"
								/>
							) : null}
							<Button
								label="View full profile"
								onPress={openFullProfile}
								variant="solid"
							/>
						</View>
					</>
				) : null}
			</View>
		</CenteredSheet>
	);
}

const styles = StyleSheet.create({
	actions: { gap: 12, marginTop: 4 },
	body: { gap: 12, padding: 16, paddingTop: 4 },
	headerCol: { flex: 1, gap: 6 },
	headerRow: { alignItems: "center", flexDirection: "row", gap: 12 },
	logo: { borderRadius: 12, borderWidth: 1, height: 64, width: 64 },
	spinner: { paddingVertical: 32 },
});
