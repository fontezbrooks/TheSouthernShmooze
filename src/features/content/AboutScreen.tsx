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
import { openLink } from "@/lib/openLink";
import { ABOUT_STORY, PRESS_ITEMS, COMMUNITY_LINKS } from "./aboutContent";

/**
 * About + press + community links (design.md §E6, site /about parity).
 * All destinations are external link-outs via openLink.
 */
export function AboutScreen() {
  const t = useTheme();
  const router = useRouter();

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
            key={item.url}
            accessibilityRole="link"
            accessibilityLabel={`${item.outlet}: ${item.title}`}
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
            <Icon name="arrowRight" size={18} color={t.brand.colors.clay} />
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
            key={link.label}
            accessibilityRole="link"
            accessibilityLabel={link.label}
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
            <Icon name="arrowRight" size={18} color={t.brand.colors.clay} />
          </Pressable>
        ))}
      </ScrollView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  headingBlock: { gap: 4 },
  content: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 44,
    gap: 12,
  },
  card: {
    borderWidth: StyleSheet.hairlineWidth,
    padding: 20,
    gap: 14,
  },
  storyBlock: { gap: 4 },
  linkRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderWidth: StyleSheet.hairlineWidth,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  linkCol: { flex: 1, gap: 2 },
});
