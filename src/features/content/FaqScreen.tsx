import { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  ImageBackground,
  Pressable,
  StyleSheet,
} from "react-native";
import { useRouter } from "expo-router";
import { useTheme } from "@/theme/ThemeProvider";
import { daisyBackground } from "@/theme/assets";
import { AppHeader } from "@/components/ui/AppHeader";
import { StrokedHeading } from "@/components/ui/StrokedHeading";
import { Icon } from "@/components/ui/Icon";
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
      source={daisyBackground}
      resizeMode="repeat"
      style={styles.flex}
    >
      <AppHeader
        showBack
        onBack={() =>
          router.canGoBack() ? router.back() : router.replace("/")
        }
      />
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <StrokedHeading variant="displayL">FAQ</StrokedHeading>

        <View style={styles.tabs} accessibilityRole="tablist">
          {AUDIENCES.map((a) => {
            const selected = audience === a.key;
            return (
              <Pressable
                key={a.key}
                accessibilityRole="tab"
                accessibilityState={{ selected }}
                accessibilityLabel={a.label}
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
                accessibilityRole="button"
                accessibilityState={{ expanded: open }}
                accessibilityLabel={topic.topic}
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
                  name={open ? "chevronDown" : "chevronLeft"}
                  size={18}
                  color={t.brand.colors.clay}
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
  flex: { flex: 1 },
  content: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 44,
    gap: 12,
  },
  tabs: { flexDirection: "row", gap: 8, marginBottom: 4 },
  // flex: 1 + centered, wrappable labels: intrinsic widths overflow a
  // 320pt viewport, worse at accessibility font sizes (review: PR #35).
  tab: {
    flex: 1,
    minHeight: 44,
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  tabLabel: { textAlign: "center" },
  topicCard: {
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 16,
  },
  topicHead: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    gap: 8,
  },
  topicTitle: { flex: 1 },
  qa: {
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingVertical: 12,
    gap: 4,
  },
});
