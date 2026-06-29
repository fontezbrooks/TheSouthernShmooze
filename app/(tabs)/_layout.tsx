import type { ComponentType } from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { Tabs } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "@/theme/ThemeProvider";
import { openLink } from "@/lib/openLink";
import { LINKS } from "@/lib/links";
// Nav icons live under src/ (not assets/) so they aren't caught by the broad
// `assets/*` gitignore — EAS's uploader doesn't honor a nested re-include, which
// dropped them from the cloud build context. See `mem:build-status`.
import HomeIcon from "@/components/ui/icons/home-05.svg";
import PhoneCallIcon from "@/components/ui/icons/phone-call-01.svg";
import HeartHandIcon from "@/components/ui/icons/heart-hand.svg";
import UsersIcon from "@/components/ui/icons/users-03.svg";
import SocialSpreadIcon from "@/components/ui/icons/socialSpread.svg";

type SvgIcon = ComponentType<{
  width?: number;
  height?: number;
  color?: string;
}>;

/**
 * The 5 nav destinations (Figma NavBar). `route` items navigate to a registered
 * tab screen; `link` items open an external URL (Community → Facebook group,
 * Newsletter → Substack) without navigating — the same destinations as the
 * Home/Community banners, reached a different way.
 */
type TabItem =
  | { key: string; label: string; icon: SvgIcon; kind: "route" }
  | { key: string; label: string; icon: SvgIcon; kind: "link"; href: string };

const TABS: TabItem[] = [
  { key: "index", label: "Home", icon: HomeIcon, kind: "route" },
  { key: "directory", label: "Directory", icon: PhoneCallIcon, kind: "route" },
  { key: "concierge", label: "Concierge", icon: HeartHandIcon, kind: "route" },
  {
    key: "community",
    label: "Community",
    icon: UsersIcon,
    kind: "link",
    href: LINKS.facebook,
  },
  {
    key: "newsletter",
    label: "Newsletter",
    icon: SocialSpreadIcon,
    kind: "link",
    href: LINKS.newsletter,
  },
];

/**
 * Minimal structural subset of react-navigation's BottomTabBarProps — typed
 * locally because expo-router v56 vendors react-navigation (no standalone pkg).
 */
interface TabBarProps {
  state: { index: number; routes: { key: string; name: string }[] };
  navigation: {
    emit: (e: {
      type: "tabPress";
      target: string;
      canPreventDefault: true;
    }) => { defaultPrevented: boolean };
    navigate: (name: string) => void;
  };
}

/** Custom 5-tab bar (cream, rust hairline). Route tabs navigate; link tabs open external URLs. */
function AppTabBar({ state, navigation }: TabBarProps) {
  const t = useTheme();
  const insets = useSafeAreaInsets();
  const activeRoute = state.routes[state.index]?.name;

  return (
    <View
      style={[
        styles.bar,
        {
          backgroundColor: t.colors.bg,
          borderTopColor: t.colors.divider,
          paddingBottom: Math.max(insets.bottom, 8),
        },
      ]}
    >
      <View style={styles.row}>
        {TABS.map((tab) => {
          const focused = tab.kind === "route" && activeRoute === tab.key;
          const tint = focused ? t.colors.rust : t.colors.neutral800;
          const onPress = () => {
            if (tab.kind === "link") {
              openLink(tab.href);
              return;
            }
            const route = state.routes.find((r) => r.name === tab.key);
            if (!route) return;
            const event = navigation.emit({
              type: "tabPress",
              target: route.key,
              canPreventDefault: true,
            });
            if (!focused && !event.defaultPrevented)
              navigation.navigate(tab.key);
          };
          const IconCmp = tab.icon;
          return (
            <Pressable
              key={tab.key}
              accessibilityRole="button"
              accessibilityState={focused ? { selected: true } : {}}
              accessibilityLabel={tab.label}
              onPress={onPress}
              style={styles.item}
            >
              <IconCmp width={24} height={24} color={tint} />
              <Text style={[t.typography.tab, { color: tint }]}>
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
      <Tabs.Screen name="directory" options={{ title: "Directory" }} />
      <Tabs.Screen name="concierge" options={{ title: "Concierge" }} />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  bar: {
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingTop: 7,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 16,
  },
  item: {
    alignItems: "center",
    gap: 4,
    flex: 1,
  },
});
