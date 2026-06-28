import { useCallback, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  ActivityIndicator,
  ImageBackground,
  StyleSheet,
} from "react-native";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import { useTheme } from "@/theme/ThemeProvider";
import { daisyBackground, bannerCommunity } from "@/theme/assets";
import { AppHeader } from "@/components/ui/AppHeader";
import { Banner } from "@/components/ui/Banner";
import { StrokedHeading } from "@/components/ui/StrokedHeading";
import { openLink } from "@/lib/openLink";
import { LINKS } from "@/lib/links";
import { SearchBar } from "./SearchBar";
import { BusinessCardHorizontal } from "./BusinessCardHorizontal";
import { useDirectorySearch } from "./useDirectorySearch";

/**
 * Directory tab — browse all certified-first businesses by default; the search
 * bar filters via the `directory_search` RPC and walks browse → results →
 * no-results in place. Tapping a card opens the business-detail screen.
 */
export function DirectoryScreen() {
  const t = useTheme();
  const router = useRouter();
  const s = useDirectorySearch();
  const inputRef = useRef<TextInput | null>(null);
  const { focus } = useLocalSearchParams<{ focus?: string }>();

  // Arriving from the Home search bar (?focus=1): focus the input so the user can
  // type immediately. `useFocusEffect` (not bare autoFocus) because the tab screen
  // stays mounted, so it must re-fire on every visit. Clear the param after.
  useFocusEffect(
    useCallback(() => {
      if (!focus) return;
      const handle = setTimeout(() => inputRef.current?.focus(), 50);
      router.setParams({ focus: undefined });
      return () => clearTimeout(handle);
    }, [focus, router]),
  );

  const openDetail = (sourceUid: string) =>
    router.push(`/business/${sourceUid}`);

  return (
    <ImageBackground
      source={daisyBackground}
      resizeMode="repeat"
      style={[styles.flex, { backgroundColor: t.colors.bg }]}
    >
      <AppHeader />
      <View style={styles.searchWrap}>
        <SearchBar
          inputRef={inputRef}
          value={s.query}
          onChangeText={s.setQuery}
          onFocus={() => s.setFocused(true)}
          onBlur={() => s.setFocused(false)}
        />
      </View>

      {s.loading ? (
        <ActivityIndicator
          style={styles.center}
          color={t.colors.rust}
          accessibilityLabel="Loading directory"
        />
      ) : s.mode === "no-results" ? (
        <View style={styles.noResults}>
          {/* #FEF8E8 stroke (like the home headers) keeps it legible over the daisy bg. */}
          <StrokedHeading variant="displayXS">No results</StrokedHeading>
          <View
            style={[styles.captionChip, { backgroundColor: t.colors.surface }]}
          >
            <Text style={[t.typography.caption, { color: t.colors.textSoft }]}>
              Please try your search again
            </Text>
          </View>
          <Banner
            layout="imageLeft"
            image={bannerCommunity}
            title="Ask the community"
            subtitle="Get recommendations and connect with locals."
            cta={{ label: "Join the Facebook Group" }}
            onPress={() => openLink(LINKS.facebook)}
          />
        </View>
      ) : (
        <FlatList
          data={s.items}
          keyExtractor={(b) => b.id}
          renderItem={({ item }) => (
            <BusinessCardHorizontal business={item} onPress={openDetail} />
          )}
          contentContainerStyle={styles.list}
          keyboardShouldPersistTaps="handled"
          ListFooterComponent={
            s.searching && s.items.length === 0 ? (
              <ActivityIndicator color={t.colors.rust} style={styles.footer} />
            ) : s.error ? (
              <Text
                style={[
                  t.typography.caption,
                  styles.error,
                  { color: t.colors.error },
                ]}
              >
                {s.error}
              </Text>
            ) : null
          }
        />
      )}
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  searchWrap: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 8 },
  center: { marginTop: 48 },
  list: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 44, gap: 16 },
  footer: { paddingVertical: 24 },
  error: { textAlign: "center", paddingVertical: 24 },
  noResults: {
    paddingHorizontal: 16,
    paddingTop: 48,
    gap: 8,
    alignItems: "center",
  },
  // Cream chip so the secondary line stays readable over the busy background.
  captionChip: {
    alignSelf: "center",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 9999,
    marginBottom: 24,
  },
});
