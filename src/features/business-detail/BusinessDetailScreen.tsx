import { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  Pressable,
  ScrollView,
  ActivityIndicator,
  ImageBackground,
  StyleSheet,
} from "react-native";
import { useRouter } from "expo-router";
import { useTheme } from "@/theme/ThemeProvider";
import { daisyBackground } from "@/theme/assets";
import { AppHeader } from "@/components/ui/AppHeader";
import { Icon } from "@/components/ui/Icon";
import { openLink } from "@/lib/openLink";
import { businessDetailRepository } from "./businessDetailRepository";
import type { BusinessDetail } from "./businessDetailTypes";

interface DetailState {
  loading: boolean;
  detail: BusinessDetail | null;
  error: string | null;
}

/**
 * Business-detail screen — PLACEHOLDER. Renders the ingested profile (about,
 * address, website, phones, socials, gallery) with existing components/tokens so
 * it matches the app, pending real design specs. Reached by tapping a directory
 * card; reads `directory_business_detail_view` by source_uid.
 */
export function BusinessDetailScreen({ uid }: { uid: string }) {
  const t = useTheme();
  const router = useRouter();
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

  return (
    <ImageBackground
      source={daisyBackground}
      resizeMode="repeat"
      style={[styles.flex, { backgroundColor: t.colors.bg }]}
    >
      <AppHeader showBack onBack={back} />
      {loading ? (
        <ActivityIndicator style={styles.center} color={t.colors.rust} />
      ) : !detail ? (
        <View style={styles.center}>
          <Text style={[t.typography.body, { color: t.colors.textSoft }]}>
            {error ?? "This business could not be found."}
          </Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.content}>
          {detail.logoUrl ? (
            <Image
              source={{ uri: detail.logoUrl }}
              style={styles.logo}
              resizeMode="cover"
            />
          ) : null}

          {/* Surface card so the body text is readable over the busy daisy background. */}
          <View
            style={[
              styles.card,
              {
                backgroundColor: t.colors.surface,
                borderColor: t.colors.rustDark,
              },
            ]}
          >
            <Text style={t.typography.displayXS}>{detail.name}</Text>

            {detail.isCertified ? (
              <View
                style={[
                  styles.certified,
                  { backgroundColor: t.colors.mustard },
                ]}
              >
                <Icon name="starFilled" size={12} color={t.colors.white} />
                <Text
                  style={[
                    t.typography.captionSemiXS,
                    { color: t.colors.white },
                  ]}
                >
                  Certified
                </Text>
              </View>
            ) : null}

            {detail.aboutText ? (
              <Text style={[t.typography.body, { color: t.colors.textSoft }]}>
                {detail.aboutText}
              </Text>
            ) : detail.tagline ? (
              <Text style={[t.typography.body, { color: t.colors.textSoft }]}>
                {detail.tagline}
              </Text>
            ) : null}

            {detail.address ? (
              <Text style={[t.typography.caption, { color: t.colors.muted }]}>
                {detail.address}
              </Text>
            ) : null}

            {detail.phones.map((p) => (
              <Pressable
                key={p.raw}
                accessibilityRole="button"
                accessibilityLabel={`Call ${detail.name}`}
                onPress={() => openLink(`tel:${p.raw}`)}
                style={[styles.action, { backgroundColor: t.colors.rust }]}
              >
                <Icon name="phoneFilled" size={14} color={t.colors.white} />
                <Text
                  style={[t.typography.captionSemi, { color: t.colors.white }]}
                >
                  {p.display}
                </Text>
              </Pressable>
            ))}

            {detail.website ? (
              <Pressable
                accessibilityRole="link"
                onPress={() => openLink(detail.website as string)}
                style={[styles.linkRow]}
              >
                <Text
                  style={[t.typography.captionSemi, { color: t.colors.rust }]}
                >
                  Visit website
                </Text>
              </Pressable>
            ) : null}

            {detail.socials.map((s) => (
              <Pressable
                key={`${s.key}:${s.url}`}
                accessibilityRole="link"
                onPress={() => openLink(s.url)}
                style={styles.linkRow}
              >
                <Text
                  style={[t.typography.captionSemi, { color: t.colors.rust }]}
                >
                  {s.key}
                </Text>
              </Pressable>
            ))}

            {detail.gallery.length > 0 ? (
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
            ) : null}
          </View>
        </ScrollView>
      )}
    </ImageBackground>
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
  content: { padding: 16, gap: 12, paddingBottom: 44 },
  card: { borderRadius: 24, borderWidth: 2, padding: 16, gap: 12 },
  logo: { width: "100%", height: 200, borderRadius: 16 },
  certified: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    gap: 2,
    height: 20,
    paddingHorizontal: 6,
    borderRadius: 9999,
  },
  action: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    height: 40,
    borderRadius: 9999,
  },
  linkRow: { paddingVertical: 4 },
  gallery: { gap: 8, paddingVertical: 4 },
  galleryImg: { width: 140, height: 140, borderRadius: 12 },
});
