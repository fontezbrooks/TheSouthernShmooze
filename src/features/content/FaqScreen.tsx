import { useRouter } from "expo-router";
import { useState } from "react";
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
import { daisyBackground } from "@/theme/assets";
import { useTheme } from "@/theme/ThemeProvider";
import { FAQ_CONTENT, type FaqAudience } from "./faqContent";

const AUDIENCES: readonly { key: FaqAudience; label: string }[] = [
	{ key: "homeowners", label: "For Homeowners" },
	{ key: "contractors", label: "For Contractors" },
];

/**
 * Dual-audience FAQ (design.md §E6, site /faq parity): two tabs, five
 * collapsible topics each. One topic open at a time per audience keeps
 * the page scannable on a phone.
 */
export function FaqScreen() {
	const t = useTheme();
	const router = useRouter();
	const [audience, setAudience] = useState<FaqAudience>("homeowners");
	const [openTopic, setOpenTopic] = useState<string | null>(null);

	const selectAudience = (a: FaqAudience) => {
		setAudience(a);
		setOpenTopic(null);
	};

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
				surface="legacy"
			/>
			<ScrollView
				contentContainerStyle={styles.content}
				keyboardShouldPersistTaps="handled"
			>
				<StrokedHeading variant="displayL">FAQ</StrokedHeading>

				<View accessibilityRole="tablist" style={styles.tabs}>
					{AUDIENCES.map((a) => {
						const selected = audience === a.key;
						return (
							<Pressable
								accessibilityLabel={a.label}
								accessibilityRole="tab"
								accessibilityState={{ selected }}
								key={a.key}
								onPress={() => selectAudience(a.key)}
								style={[
									styles.tab,
									{
										backgroundColor: selected
											? t.brand.colors.clay
											: t.brand.colors.surface,
										borderColor: selected
											? t.brand.colors.clayDark
											: t.brand.colors.line,
										borderRadius: t.brand.radii.pill,
									},
								]}
							>
								<Text
									style={[
										t.brand.typography.bodySemi,
										styles.tabLabel,
										{
											color: selected ? t.colors.white : t.brand.colors.text,
										},
									]}
								>
									{a.label}
								</Text>
							</Pressable>
						);
					})}
				</View>

				{FAQ_CONTENT[audience].map((topic) => {
					const open = openTopic === topic.topic;
					return (
						<View
							key={`${audience}-${topic.topic}`}
							style={[
								styles.topicCard,
								t.brand.shadow.card,
								{
									backgroundColor: t.brand.colors.surface,
									borderColor: t.brand.colors.line,
									borderRadius: t.brand.radii.md,
								},
							]}
						>
							<Pressable
								accessibilityLabel={topic.topic}
								accessibilityRole="button"
								accessibilityState={{ expanded: open }}
								onPress={() => setOpenTopic(open ? null : topic.topic)}
								style={styles.topicHead}
							>
								<Text
									style={[
										t.brand.typography.bodySemi,
										styles.topicTitle,
										{ color: t.brand.colors.text },
									]}
								>
									{topic.topic}
								</Text>
								<Icon
									color={t.brand.colors.clay}
									name={open ? "chevronDown" : "chevronLeft"}
									size={18}
								/>
							</Pressable>
							{open
								? topic.qs.map((entry) => (
										<View
											key={entry.q}
											style={[
												styles.qa,
												{ borderTopColor: t.brand.colors.line },
											]}
										>
											<Text
												style={[
													t.brand.typography.bodySemi,
													{ color: t.brand.colors.pine },
												]}
											>
												{entry.q}
											</Text>
											<Text
												style={[
													t.brand.typography.body,
													{ color: t.brand.colors.textSoft },
												]}
											>
												{entry.a}
											</Text>
										</View>
									))
								: null}
						</View>
					);
				})}
			</ScrollView>
		</ImageBackground>
	);
}

const styles = StyleSheet.create({
	content: {
		gap: 12,
		paddingBottom: 44,
		paddingHorizontal: 16,
		paddingTop: 16,
	},
	flex: { flex: 1 },
	qa: {
		borderTopWidth: StyleSheet.hairlineWidth,
		gap: 4,
		paddingVertical: 12,
	},
	// flex: 1 + centered, wrappable labels: intrinsic widths overflow a
	// 320pt viewport, worse at accessibility font sizes (review: PR #35).
	tab: {
		alignItems: "center",
		borderWidth: 1,
		flex: 1,
		justifyContent: "center",
		minHeight: 44,
		paddingHorizontal: 8,
		paddingVertical: 8,
	},
	tabLabel: { textAlign: "center" },
	tabs: { flexDirection: "row", gap: 8, marginBottom: 4 },
	topicCard: {
		borderWidth: StyleSheet.hairlineWidth,
		paddingHorizontal: 16,
	},
	topicHead: {
		alignItems: "center",
		flexDirection: "row",
		gap: 8,
		paddingVertical: 14,
	},
	topicTitle: { flex: 1 },
});
