import { StyleSheet, Text, View } from "react-native";
import { Button } from "@/components/ui/Button";
import { openLink } from "@/lib/openLink";
import { useTheme } from "@/theme/ThemeProvider";
import { type FitVerdict, HELP_URL } from "./wizardApi";

interface FitResultProps {
	businessName: string;
	joinUrl: string;
	onStartOver: () => void;
	verdict: FitVerdict;
}

/**
 * Instant fit decision (site parity, design.md §E5). Verified and
 * unverified are both a pass and hand off to the site's /join welcome page
 * (Q5: membership is link-out only). "Not yet" is the single rejection and
 * routes to the how-we-can-help page instead of a dead end.
 */
export function FitResult({
	verdict,
	businessName,
	joinUrl,
	onStartOver,
}: FitResultProps) {
	const t = useTheme();
	const name = verdict.place?.name || businessName || "neighbor";
	const pass = verdict.outcome !== "not-yet";

	let eyebrow: string;
	let headline: string;
	let summary: string;
	if (verdict.outcome === "verified") {
		eyebrow = "You're certified";
		headline = `You're in, ${name}.`;
		summary = `You cleared the bar on the only two things we check: ${verdict.rating?.toFixed(1)} stars across ${verdict.reviewCount} Google reviews, and you serve metro Atlanta.`;
	} else if (verdict.outcome === "unverified") {
		eyebrow = "You're in";
		headline = `You're in, ${name}.`;
		summary = verdict.offline
			? "You're approved. We couldn't reach Google just now to pull your rating, so we'll fill that in automatically once it lands. Nothing on your end."
			: "You're approved. We couldn't find enough Google reviews to show a star rating yet — that's not a strike against you, plenty of good operators are just early. Your rating appears on your profile the moment Google has one.";
	} else {
		eyebrow = "Not yet";
		headline = "Let's fix this first, then you're in.";
		summary =
			verdict.rating != null && verdict.reviewCount
				? `Your Google rating is ${verdict.rating.toFixed(1)} stars across ${verdict.reviewCount} reviews. The registry holds to 4.0, because that promise is the only reason homeowners trust it. That's fixable — and it's exactly what we help with.`
				: "Your Google reviews aren't where the registry's 4.0 bar needs them yet. That's fixable — and it's exactly what we help with.";
	}

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
				<Text style={[t.brand.typography.chip, { color: t.brand.colors.clay }]}>
					{eyebrow.toUpperCase()}
				</Text>
				<Text
					style={[t.brand.typography.displayM, { color: t.brand.colors.text }]}
				>
					{headline}
				</Text>
				<Text style={t.brand.typography.body}>{summary}</Text>
				{pass ? (
					// Native membership recommendation, price-free (design.md §E5:
					// level content in-app, checkout/pricing stays on the site — Q5).
					<View
						style={[
							styles.levelBlock,
							{
								borderTopColor: t.brand.colors.line,
							},
						]}
					>
						<Text
							style={[
								t.brand.typography.chip,
								{ color: t.brand.colors.textSoft },
							]}
						>
							OUR RECOMMENDED MEMBERSHIP LEVEL
						</Text>
						<Text
							style={[
								t.brand.typography.bodySemi,
								{ color: t.brand.colors.pine },
							]}
						>
							{verdict.recommendedLevel}
						</Text>
						<Text
							style={[
								t.brand.typography.caption,
								{ color: t.brand.colors.textSoft },
							]}
						>
							Your welcome page walks through what every level includes — no
							card needed to look.
						</Text>
					</View>
				) : null}
			</View>
			{pass ? (
				<Button
					label="Continue to your welcome page"
					onPress={() => openLink(joinUrl)}
					variant="primary"
				/>
			) : (
				<Button
					label="See how we can help"
					onPress={() => openLink(HELP_URL)}
					variant="primary"
				/>
			)}
			<Button label="Start over" onPress={onStartOver} variant="wide" />
		</View>
	);
}

const styles = StyleSheet.create({
	card: {
		alignItems: "flex-start",
		borderWidth: StyleSheet.hairlineWidth,
		gap: 12,
		padding: 24,
	},
	levelBlock: {
		alignSelf: "stretch",
		borderTopWidth: StyleSheet.hairlineWidth,
		gap: 4,
		paddingTop: 12,
	},
	wrap: { gap: 16 },
});
