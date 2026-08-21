import Feather from "@expo/vector-icons/Feather";
import { type Href, Tabs, useRouter } from "expo-router";
import type { ComponentType } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import HeartHandIcon from "@/components/ui/icons/heart-hand.svg";
// Nav icons live under src/ (not assets/) so they aren't caught by the broad
// `assets/*` gitignore — EAS's uploader doesn't honor a nested re-include, which
// dropped them from the cloud build context. See `mem:build-status`.
import HomeIcon from "@/components/ui/icons/home-05.svg";
import PhoneCallIcon from "@/components/ui/icons/phone-call-01.svg";
import UsersIcon from "@/components/ui/icons/users-03.svg";
import { LINKS } from "@/lib/links";
import { openLink } from "@/lib/openLink";
import { useTheme } from "@/theme/ThemeProvider";

type SvgIcon = ComponentType<{
	width?: number;
	height?: number;
	color?: string;
}>;

/** Interim Match tab glyph (approved, design §8): Feather heart adapted to the SvgIcon contract. */
function MatchTabIcon({
	width = 24,
	color,
}: {
	width?: number;
	height?: number;
	color?: string;
}) {
	return <Feather color={color} name="heart" size={width} />;
}

/**
 * The 5 nav destinations (Figma NavBar). `route` items navigate to a registered
 * tab screen; `link` items open an external URL (Community → Facebook group)
 * without navigating; `push` items push a stack screen over the tabs (Match →
 * the swipe deck). Newsletter moved from the tab bar to a Home block.
 */
type TabItem =
	| { key: string; label: string; icon: SvgIcon; kind: "route" }
	| { key: string; label: string; icon: SvgIcon; kind: "link"; href: string }
	| { key: string; label: string; icon: SvgIcon; kind: "push"; href: Href };

const TABS: TabItem[] = [
	{ icon: HomeIcon, key: "index", kind: "route", label: "Home" },
	{ icon: PhoneCallIcon, key: "directory", kind: "route", label: "Registry" },
	{ icon: HeartHandIcon, key: "concierge", kind: "route", label: "Concierge" },
	{
		href: LINKS.facebook,
		icon: UsersIcon,
		key: "community",
		kind: "link",
		label: "Community",
	},
	{
		href: "/swipe",
		icon: MatchTabIcon,
		key: "match",
		kind: "push",
		label: "Match",
	},
];

/**
 * Minimal structural subset of react-navigation's BottomTabBarProps — typed
 * locally because expo-router v56 vendors react-navigation (no standalone pkg).
 */
interface TabBarProps {
	navigation: {
		emit: (e: {
			type: "tabPress";
			target: string;
			canPreventDefault: true;
		}) => { defaultPrevented: boolean };
		navigate: (name: string) => void;
	};
	state: { index: number; routes: { key: string; name: string }[] };
}

/**
 * Custom 5-tab bar on `t.brand` (magnolia, warm hairline, clay active tint).
 * Route tabs navigate; link tabs open external URLs; push tabs stack a screen.
 */
function AppTabBar({ state, navigation }: TabBarProps) {
	const t = useTheme();
	const router = useRouter();
	const insets = useSafeAreaInsets();
	const activeRoute = state.routes[state.index]?.name;

	return (
		<View
			style={[
				styles.bar,
				{
					backgroundColor: t.brand.colors.bg,
					borderTopColor: t.brand.colors.line,
					paddingBottom: Math.max(insets.bottom, 8),
				},
			]}
		>
			<View style={styles.row}>
				{TABS.map((tab) => {
					const focused = tab.kind === "route" && activeRoute === tab.key;
					const tint = focused ? t.brand.colors.clay : t.brand.colors.text;
					const onPress = () => {
						if (tab.kind === "link") {
							openLink(tab.href);
							return;
						}
						if (tab.kind === "push") {
							router.push(tab.href);
							return;
						}
						const route = state.routes.find((r) => r.name === tab.key);
						if (!route) {
							return;
						}
						const event = navigation.emit({
							canPreventDefault: true,
							target: route.key,
							type: "tabPress",
						});
						if (!(focused || event.defaultPrevented)) {
							navigation.navigate(tab.key);
						}
					};
					const IconCmp = tab.icon;
					return (
						<Pressable
							accessibilityLabel={tab.label}
							accessibilityRole="button"
							accessibilityState={focused ? { selected: true } : {}}
							key={tab.key}
							onPress={onPress}
							style={styles.item}
						>
							<IconCmp color={tint} height={24} width={24} />
							<Text style={[t.brand.typography.tab, { color: tint }]}>
								{tab.label}
							</Text>
						</Pressable>
					);
				})}
			</View>
		</View>
	);
}

export default function TabsLayout() {
	return (
		<Tabs
			screenOptions={{ headerShown: false }}
			tabBar={(props) => <AppTabBar {...props} />}
		>
			<Tabs.Screen name="index" options={{ title: "Home" }} />
			<Tabs.Screen name="directory" options={{ title: "Registry" }} />
			<Tabs.Screen name="concierge" options={{ title: "Concierge" }} />
		</Tabs>
	);
}

const styles = StyleSheet.create({
	bar: {
		borderTopWidth: StyleSheet.hairlineWidth,
		paddingTop: 7,
	},
	item: {
		alignItems: "center",
		flex: 1,
		gap: 4,
	},
	row: {
		flexDirection: "row",
		justifyContent: "space-between",
		paddingHorizontal: 16,
	},
});
