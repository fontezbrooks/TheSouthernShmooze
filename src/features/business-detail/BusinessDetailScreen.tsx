import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
	ActivityIndicator,
	Alert,
	Image,
	Pressable,
	ScrollView,
	StyleSheet,
	Text,
	View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { AppHeader } from "@/components/ui/AppHeader";
import { Button } from "@/components/ui/Button";
import { CertifiedBadge } from "@/components/ui/CertifiedBadge";
import { Icon, type IconName } from "@/components/ui/Icon";
import { openLink } from "@/lib/openLink";
import { useTheme } from "@/theme/ThemeProvider";
import { businessDetailRepository } from "./businessDetailRepository";
import type { BusinessDetail, DetailPhone } from "./businessDetailTypes";
import { LinkButton } from "./LinkButton";

interface DetailState {
	detail: BusinessDetail | null;
	error: string | null;
	loading: boolean;
}

/** Raw MW social key → glyph (P6). `gsos` is wired but dormant — no upstream data yet. */
const SOCIAL_ICONS: Record<string, IconName> = {
	bbb: "brandBbb",
	fbk: "facebook",
	goo: "brandGoogleBusiness",
	gsos: "brandGaSos",
	igm: "instagram",
	ylp: "brandYelp",
};

const LOGO_SIZE = 72;

/**
 * Business-detail screen (July 2026 round P1–P9; restyled to the 2026 brand
 * in E2b): plain Magnolia background, square logo beside the Fraunces name +
 * badges, address on top, then links / gallery / phones / description
 * separated by `line` dividers, with a sticky call bar at the bottom.
 * Renders only the data the profile actually has.
 */
export function BusinessDetailScreen({ uid }: { uid: string }) {
	const t = useTheme();
	const router = useRouter();
	const insets = useSafeAreaInsets();
	const [state, setState] = useState<DetailState>({
		detail: null,
		error: null,
		loading: true,
	});

	useEffect(() => {
		let alive = true;
		(async () => {
			const res = await businessDetailRepository.fetchByUid(uid);
			if (!alive) {
				return;
			}
			setState(
				res.ok
					? { detail: res.data, error: null, loading: false }
					: { detail: null, error: res.error, loading: false }
			);
		})();
		return () => {
			alive = false;
		};
	}, [uid]);

	const back = () =>
		router.canGoBack() ? router.back() : router.replace("/directory");

	const { loading, detail, error } = state;

	const links = detail
		? [
				...(detail.website
					? [{ key: "website", label: "Website", url: detail.website }]
					: []),
				...detail.socials,
			]
		: [];

	const primaryPhone: DetailPhone | null = detail?.phones[0] ?? null;
	const description = detail ? (detail.aboutText ?? detail.tagline) : null;

	const onCallPress = () => {
		if (!(detail && primaryPhone)) {
			return;
		}
		if (detail.phones.length === 1) {
			openLink(`tel:${primaryPhone.raw}`);
			return;
		}
		// Multi-phone (P4): simple picker — one button per number.
		Alert.alert(`Call ${detail.name}`, undefined, [
			...detail.phones.map((p) => ({
				onPress: () => openLink(`tel:${p.raw}`),
				text: p.display,
			})),
			{ style: "cancel" as const, text: "Cancel" },
		]);
	};

	const divider = (
		<View style={[styles.divider, { backgroundColor: t.brand.colors.line }]} />
	);

	return (
		// Rebrand (design.md §E2b): plain Magnolia base.
		<View style={[styles.flex, { backgroundColor: t.brand.colors.bg }]}>
			<AppHeader onBack={back} showBack />
			{loading ? (
				<ActivityIndicator color={t.brand.colors.clay} style={styles.center} />
			) : detail ? (
				<>
					<ScrollView
						contentContainerStyle={[
							styles.content,
							// Clear the sticky call bar (P4).
							{ paddingBottom: primaryPhone ? 120 + insets.bottom : 44 },
						]}
					>
						{/* P1 + P3: square logo beside the name + badges. */}
						<View style={styles.headerRow}>
							{detail.logoUrl ? (
								<Image
									resizeMode="cover"
									source={{ uri: detail.logoUrl }}
									style={[styles.logo, { borderColor: t.brand.colors.line }]}
								/>
							) : null}
							<View style={styles.headerCol}>
								<Text style={t.brand.typography.displayM}>{detail.name}</Text>
								{detail.isCertified ? <CertifiedBadge /> : null}
							</View>
						</View>

						{/* P5: address at the top. */}
						{detail.address ? (
							<Text
								style={[
									t.brand.typography.caption,
									{ color: t.brand.colors.textSoft },
								]}
							>
								{detail.address}
							</Text>
						) : null}

						{/* P6: links — render only what exists. */}
						{links.length > 0 ? (
							<>
								{divider}
								<Text
									style={[
										t.brand.typography.chip,
										{ color: t.brand.colors.textSoft },
									]}
								>
									Links
								</Text>
								<View style={styles.linksWrap}>
									{links.map((l) => (
										<LinkButton
											icon={SOCIAL_ICONS[l.key] ?? "globe"}
											key={`${l.key}:${l.url}`}
											label={l.label}
											onPress={() => openLink(l.url)}
										/>
									))}
								</View>
							</>
						) : null}

						{/* P7: gallery, moved up, larger cards. */}
						{detail.gallery.length > 0 ? (
							<>
								{divider}
								<Text
									style={[
										t.brand.typography.chip,
										{ color: t.brand.colors.textSoft },
									]}
								>
									Photos
								</Text>
								<ScrollView
									contentContainerStyle={styles.gallery}
									horizontal
									showsHorizontalScrollIndicator={false}
								>
									{detail.gallery.map((uri) => (
										<Image
											key={uri}
											resizeMode="cover"
											source={{ uri }}
											style={styles.galleryImg}
										/>
									))}
								</ScrollView>
							</>
						) : null}

						{/* Phones list + P8: description at the bottom. */}
						{detail.phones.length > 0 || description ? divider : null}
						{detail.phones.map((p) => (
							<Pressable
								accessibilityLabel={`Call ${detail.name} at ${p.display}`}
								accessibilityRole="button"
								key={p.raw}
								onPress={() => openLink(`tel:${p.raw}`)}
								style={styles.phoneRow}
							>
								<Icon color={t.brand.colors.clay} name="phone" size={16} />
								<Text
									style={[
										t.brand.typography.caption,
										{ color: t.brand.colors.clay },
									]}
								>
									{p.display}
								</Text>
							</Pressable>
						))}
						{description ? (
							<Text
								style={[
									t.brand.typography.body,
									{ color: t.brand.colors.textSoft },
								]}
							>
								{description}
							</Text>
						) : null}
					</ScrollView>

					{/* P4: sticky call bar — hidden when the profile has no phone. */}
					{primaryPhone ? (
						<View
							style={[
								styles.callBar,
								{
									backgroundColor: t.brand.colors.bg,
									borderTopColor: t.brand.colors.line,
									paddingBottom: insets.bottom + 12,
								},
							]}
						>
							<Button
								icon="phoneFilled"
								iconPosition="leading"
								label={`Call ${primaryPhone.display}`}
								onPress={onCallPress}
								variant="primary"
							/>
						</View>
					) : null}
				</>
			) : (
				<View style={styles.center}>
					<Text
						style={[
							t.brand.typography.body,
							{ color: t.brand.colors.textSoft },
						]}
					>
						{error ?? "This business could not be found."}
					</Text>
				</View>
			)}
		</View>
	);
}

const styles = StyleSheet.create({
	callBar: {
		borderTopWidth: StyleSheet.hairlineWidth,
		bottom: 0,
		left: 0,
		paddingHorizontal: 16,
		paddingTop: 12,
		position: "absolute",
		right: 0,
	},
	center: {
		alignItems: "center",
		flex: 1,
		justifyContent: "center",
		padding: 24,
	},
	content: { gap: 12, padding: 16 },
	divider: { alignSelf: "stretch", height: StyleSheet.hairlineWidth },
	flex: { flex: 1 },
	gallery: { gap: 12, paddingRight: 8, paddingVertical: 4 },
	galleryImg: { borderRadius: 16, height: 180, width: 180 },
	headerCol: { flex: 1, gap: 6 },
	headerRow: { alignItems: "center", flexDirection: "row", gap: 12 },
	linksWrap: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
	// 16 = brand radius "md" (static sheet can't read the theme).
	logo: {
		borderRadius: 16,
		borderWidth: StyleSheet.hairlineWidth,
		height: LOGO_SIZE,
		width: LOGO_SIZE,
	},
	phoneRow: {
		alignItems: "center",
		flexDirection: "row",
		gap: 8,
		paddingVertical: 4,
	},
});
