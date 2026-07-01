import { useCallback, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import { useTheme } from "@/theme/ThemeProvider";
import { AppHeader } from "@/components/ui/AppHeader";
import { Button } from "@/components/ui/Button";
import { openLink } from "@/lib/openLink";
import { LINKS } from "@/lib/links";
import { SearchBar } from "./SearchBar";
import { BusinessCardHorizontal } from "./BusinessCardHorizontal";
import { SearchEmptyState } from "./SearchEmptyState";
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
    // No daisy background on the directory tab — plain Vanilla per RC2 (40:7272).
    <View style={[styles.flex, { backgroundColor: t.colors.bg }]}>
      <AppHeader />
      <View style={styles.searchWrap}>
        <SearchBar
          inputRef={inputRef}
          value={s.query}
          onChangeText={s.setQuery}
          onFocus={() => s.setFocused(true)}
          onBlur={() => s.setFocused(false)}
        />
        <Button
          label="Try The Shmoozer!"
          variant="solid"
          onPress={() => router.push("/swipe")}
          style={styles.shmoozerCta}
        />
      </View>

      {s.loading ? (
        <ActivityIndicator
          style={styles.center}
          color={t.colors.rust}
          accessibilityLabel="Loading directory"
        />
      ) : s.mode === "no-results" ? (
        <SearchEmptyState onAskCommunity={() => openLink(LINKS.facebook)} />
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
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  searchWrap: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 8,
    gap: 8,
  },
  shmoozerCta: { alignSelf: "stretch" },
  center: { marginTop: 48 },
  list: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 44, gap: 16 },
  footer: { paddingVertical: 24 },
  error: { textAlign: "center", paddingVertical: 24 },
});
