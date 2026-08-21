import { useRouter } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { AppHeader } from "@/components/ui/AppHeader";
import { Icon } from "@/components/ui/Icon";
import { openLink } from "@/lib/openLink";
import { useTheme } from "@/theme/ThemeProvider";
import { ABOUT_STORY, COMMUNITY_LINKS, PRESS_ITEMS } from "./aboutContent";

/**
 * About + press + community links (design.md §E6, site /about parity) on
 * the 2026 brand tokens. All destinations are external link-outs via openLink.
 */
export function AboutScreen() {
	const t = useTheme();
	const router = useRouter();

	return (
		<View style={[styles.flex, { backgroundColor: t.brand.colors.bg }]}>
			<AppHeader
				onBack={() =>
					router.canGoBack() ? router.back() : router.replace("/")
				}
				showBack
			/>
			<ScrollView contentContainerStyle={styles.content}>
				<View style={styles.headingBlock}>
					<Text
						style={[t.brand.typography.accent, { color: t.brand.colors.clay }]}
					>
						Our story
					</Text>
					<Text accessibilityRole="header" style={t.brand.typography.displayXL}>
						The Shmooze
					</Text>
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
		</View>
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
	headingBlock: { gap: 2, marginBottom: 4 },
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
