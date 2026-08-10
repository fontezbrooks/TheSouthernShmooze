import { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  Pressable,
  ScrollView,
  ActivityIndicator,
  Alert,
  StyleSheet,
} from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "@/theme/ThemeProvider";
import { AppHeader } from "@/components/ui/AppHeader";
import { Button } from "@/components/ui/Button";
import { CertifiedBadge } from "@/components/ui/CertifiedBadge";
import { Icon, type IconName } from "@/components/ui/Icon";
import { openLink } from "@/lib/openLink";
import { businessDetailRepository } from "./businessDetailRepository";
import { LinkButton } from "./LinkButton";
import type { BusinessDetail, DetailPhone } from "./businessDetailTypes";

interface DetailState {
  loading: boolean;
  detail: BusinessDetail | null;
  error: string | null;
}

/** Raw MW social key → glyph (P6). `gsos` is wired but dormant — no upstream data yet. */
const SOCIAL_ICONS: Record<string, IconName> = {
  bbb: "brandBbb",
  ylp: "brandYelp",
  goo: "brandGoogleBusiness",
  gsos: "brandGaSos",
  fbk: "facebook",
  igm: "instagram",
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
    loading: true,
    detail: null,
    error: null,
  });

  useEffect(() => {
    let alive = true;
    (async () => {
      const res = await businessDetailRepository.fetchByUid(uid);
      if (!alive) return;
      setState(
        res.ok
          ? { loading: false, detail: res.data, error: null }
          : { loading: false, detail: null, error: res.error },
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
    if (!detail || !primaryPhone) return;
    if (detail.phones.length === 1) {
      openLink(`tel:${primaryPhone.raw}`);
      return;
    }
    // Multi-phone (P4): simple picker — one button per number.
    Alert.alert(`Call ${detail.name}`, undefined, [
      ...detail.phones.map((p) => ({
        text: p.display,
        onPress: () => openLink(`tel:${p.raw}`),
      })),
      { text: "Cancel", style: "cancel" as const },
    ]);
  };

  const divider = (
    <View
      style={[styles.divider, { backgroundColor: t.brand.colors.line }]}
    />
  );

  return (
    // Rebrand (design.md §E2b): plain Magnolia base.
    <View style={[styles.flex, { backgroundColor: t.brand.colors.bg }]}>
      <AppHeader showBack onBack={back} />
      {loading ? (
        <ActivityIndicator style={styles.center} color={t.brand.colors.clay} />
      ) : !detail ? (
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
      ) : (
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
                  source={{ uri: detail.logoUrl }}
                  style={[styles.logo, { borderColor: t.brand.colors.line }]}
                  resizeMode="cover"
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
                      key={`${l.key}:${l.url}`}
                      icon={SOCIAL_ICONS[l.key] ?? "globe"}
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
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.gallery}
                >
                  {detail.gallery.map((uri) => (
                    <Image
                      key={uri}
                      source={{ uri }}
                      style={styles.galleryImg}
                      resizeMode="cover"
                    />
                  ))}
                </ScrollView>
              </>
            ) : null}

            {/* Phones list + P8: description at the bottom. */}
            {detail.phones.length > 0 || description ? divider : null}
            {detail.phones.map((p) => (
              <Pressable
                key={p.raw}
                accessibilityRole="button"
                accessibilityLabel={`Call ${detail.name} at ${p.display}`}
                onPress={() => openLink(`tel:${p.raw}`)}
                style={styles.phoneRow}
              >
                <Icon name="phone" size={16} color={t.brand.colors.clay} />
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
                label={`Call ${primaryPhone.display}`}
                variant="primary"
                icon="phoneFilled"
                iconPosition="leading"
                onPress={onCallPress}
              />
            </View>
          ) : null}
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  content: { padding: 16, gap: 12 },
  headerRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  headerCol: { flex: 1, gap: 6 },
  // 16 = brand radius "md" (static sheet can't read the theme).
  logo: {
    width: LOGO_SIZE,
    height: LOGO_SIZE,
    borderRadius: 16,
    borderWidth: 1,
  },
  divider: { height: StyleSheet.hairlineWidth, alignSelf: "stretch" },
  linksWrap: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  gallery: { gap: 12, paddingVertical: 4, paddingRight: 8 },
  galleryImg: { width: 180, height: 180, borderRadius: 16 },
  phoneRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 4,
  },
  callBar: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 16,
    paddingTop: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
});
