import { useRouter } from "expo-router";
import {
	ImageBackground,
	Pressable,
	ScrollView,
	StyleSheet,
	Text,
	View,
} from "react-native";
import { AppHeader } from "@/components/ui/AppHeader";
import { Icon } from "@/components/ui/Icon";
import { StrokedHeading } from "@/components/ui/StrokedHeading";
import { openLink } from "@/lib/openLink";
import { daisyBackground } from "@/theme/assets";
import { useTheme } from "@/theme/ThemeProvider";
import { ABOUT_STORY, COMMUNITY_LINKS, PRESS_ITEMS } from "./aboutContent";

/**
 * About + press + community links (design.md §E6, site /about parity).
 * All destinations are external link-outs via openLink.
 */
export function AboutScreen() {
	const t = useTheme();
	const router = useRouter();

	return (
		<ImageBackground
			resizeMode="repeat"
			source={daisyBackground}
			style={styles.flex}
		>
			<AppHeader
				onBack={() =>
					router.canGoBack() ? router.back() : router.replace("/")
				}
				showBack
			/>
			<ScrollView contentContainerStyle={styles.content}>
				<View style={styles.headingBlock}>
					<Text style={t.typography.displayXS}>Our story</Text>
					<StrokedHeading variant="displayL">The Shmooze</StrokedHeading>
				</View>

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
					{ABOUT_STORY.map((block) => (
						<View key={block.body.slice(0, 32)} style={styles.storyBlock}>
							{block.heading ? (
								<Text
									style={[
										t.brand.typography.bodySemi,
										{ color: t.brand.colors.pine },
									]}
								>
									{block.heading}
								</Text>
							) : null}
							<Text
								style={[
									t.brand.typography.body,
									{ color: t.brand.colors.textSoft },
								]}
							>
								{block.body}
							</Text>
						</View>
					))}
				</View>

				<Text
					style={[t.brand.typography.bodySemi, { color: t.brand.colors.text }]}
				>
					In the press
				</Text>
				{PRESS_ITEMS.map((item) => (
					<Pressable
						accessibilityLabel={`${item.outlet}: ${item.title}`}
						accessibilityRole="link"
						key={item.url}
						onPress={() => openLink(item.url)}
						style={[
							styles.linkRow,
							t.brand.shadow.card,
							{
								backgroundColor: t.brand.colors.surface,
								borderColor: t.brand.colors.line,
								borderRadius: t.brand.radii.md,
							},
						]}
					>
						<View style={styles.linkCol}>
							<Text
								style={[
									t.brand.typography.chip,
									{ color: t.brand.colors.clay },
								]}
							>
								{item.outlet.toUpperCase()}
							</Text>
							<Text
								style={[
									t.brand.typography.body,
									{ color: t.brand.colors.text },
								]}
							>
								{item.title}
							</Text>
						</View>
						<Icon color={t.brand.colors.clay} name="arrowRight" size={18} />
					</Pressable>
				))}

				<Text
					style={[t.brand.typography.bodySemi, { color: t.brand.colors.text }]}
				>
					Join the community
				</Text>
				{/* Keyed by label: the meetup entry shares the Facebook group URL. */}
				{COMMUNITY_LINKS.map((link) => (
					<Pressable
						accessibilityLabel={link.label}
						accessibilityRole="link"
						key={link.label}
						onPress={() => openLink(link.url)}
						style={[
							styles.linkRow,
							t.brand.shadow.card,
							{
								backgroundColor: t.brand.colors.surface,
								borderColor: t.brand.colors.line,
								borderRadius: t.brand.radii.md,
							},
						]}
					>
						<View style={styles.linkCol}>
							<Text
								style={[
									t.brand.typography.bodySemi,
									{ color: t.brand.colors.text },
								]}
							>
								{link.label}
							</Text>
							<Text
								style={[
									t.brand.typography.caption,
									{ color: t.brand.colors.textSoft },
								]}
							>
								{link.description}
							</Text>
						</View>
						<Icon color={t.brand.colors.clay} name="arrowRight" size={18} />
					</Pressable>
				))}
			</ScrollView>
		</ImageBackground>
	);
}

const styles = StyleSheet.create({
	card: {
		borderWidth: StyleSheet.hairlineWidth,
		gap: 14,
		padding: 20,
	},
	content: {
		gap: 12,
		paddingBottom: 44,
		paddingHorizontal: 16,
		paddingTop: 16,
	},
	flex: { flex: 1 },
	headingBlock: { gap: 4 },
	linkCol: { flex: 1, gap: 2 },
	linkRow: {
		alignItems: "center",
		borderWidth: StyleSheet.hairlineWidth,
		flexDirection: "row",
		gap: 12,
		paddingHorizontal: 16,
		paddingVertical: 12,
	},
	storyBlock: { gap: 4 },
});
