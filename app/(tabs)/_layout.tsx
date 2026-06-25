import { View, Text, Pressable, StyleSheet } from "react-native";
import { Tabs } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "@/theme/ThemeProvider";
import { Icon } from "@/components/ui/Icon";

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

/** Custom bottom tab bar matching the Figma NavBar (cream, rust hairline, home indicator). */
function AppTabBar({ state, navigation }: TabBarProps) {
  const t = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.bar,
        {
          backgroundColor: t.colors.bg,
          borderTopColor: t.colors.rust,
          paddingBottom: Math.max(insets.bottom, 8),
        },
      ]}
    >
      <View style={styles.row}>
        {state.routes.map((route, index) => {
          const focused = state.index === index;
          const onPress = () => {
            const event = navigation.emit({
              type: "tabPress",
              target: route.key,
              canPreventDefault: true,
            });
            if (!focused && !event.defaultPrevented)
              navigation.navigate(route.name);
          };
          return (
            <Pressable
              key={route.key}
              accessibilityRole="button"
              accessibilityState={focused ? { selected: true } : {}}
              accessibilityLabel="Home"
              onPress={onPress}
              style={styles.item}
            >
              <Icon
                name="house"
                size={24}
                color={focused ? t.colors.rust : t.colors.muted}
              />
              <Text
                style={[
                  t.typography.tab,
                  { color: focused ? t.colors.rust : t.colors.muted },
                ]}
              >
                Home
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
    justifyContent: "center",
    paddingHorizontal: 16,
  },
  item: {
    alignItems: "center",
    gap: 4,
    width: 45,
  },
});
