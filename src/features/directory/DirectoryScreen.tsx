import { useCallback, useRef, useState } from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  Pressable,
  ActivityIndicator,
  InteractionManager,
  StyleSheet,
} from "react-native";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "@/theme/ThemeProvider";
import { Icon } from "@/components/ui/Icon";
import { PhysicalPressable } from "@/components/ui/PhysicalPressable";
import { CategoryChips } from "@/features/providers/CategoryChips";
import { openLink } from "@/lib/openLink";
import { LINKS } from "@/lib/links";
import { SearchBar } from "./SearchBar";
import { BusinessCardHorizontal } from "./BusinessCardHorizontal";
import { SearchEmptyState } from "./SearchEmptyState";
import { useDirectorySearch } from "./useDirectorySearch";

/**
 * Directory tab — search bar pinned at the top (no app header), category chips
 * under it, and the certified-first list. The search bar filters via the
 * `directory_search` RPC and walks browse → results → no-results in place. A
 * back chevron appears when the user arrived from another screen (`?from=`);
 * the heart button is the pinned entry into Find Your Perfect Local Match.
 */
export function DirectoryScreen() {
  const t = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const s = useDirectorySearch();
  const { setQuery } = s;
  const inputRef = useRef<TextInput | null>(null);
  const { focus, from, q } = useLocalSearchParams<{
    focus?: string;
    from?: string;
    q?: string;
  }>();

  const [showBack, setShowBack] = useState(false);
  const pendingFocus = useRef(false);

  // Consume arrival params (Home search → ?focus=1&from=home; end-of-deck →
  // ?q=…), then clear them — tab params persist across visits, so a stale param
  // would re-trigger on the next plain tab press. The focus WORK lives in the
  // stable effect below: this effect re-runs when the params clear, and a
  // cleanup here would cancel the pending focus task mid-transition (the
  // original "second tap to type" bug).
  useFocusEffect(
    useCallback(() => {
      if (!focus && !from && !q) return;
      if (focus) pendingFocus.current = true;
      if (from) setShowBack(true);
      if (typeof q === "string" && q.length > 0) setQuery(q);
      router.setParams({ focus: undefined, from: undefined, q: undefined });
    }, [focus, from, q, router, setQuery]),
  );

  // Focus after the tab/push transition settles, retrying on the next frame if
  // the first shot landed before the input was ready. Stable callback: the
  // cleanup cancels only on a real blur, never on a param-clearing re-render.
  useFocusEffect(
    useCallback(() => {
      if (!pendingFocus.current) return;
      pendingFocus.current = false;
      const task = InteractionManager.runAfterInteractions(() => {
        inputRef.current?.focus();
        requestAnimationFrame(() => {
          if (!inputRef.current?.isFocused()) inputRef.current?.focus();
        });
      });
      return () => task.cancel();
    }, []),
  );

  // The back chevron is per-visit: leaving the tab clears it.
  useFocusEffect(useCallback(() => () => setShowBack(false), []));

  const openDetail = (sourceUid: string) =>
    router.push(`/business/${sourceUid}`);

  return (
    // Registry tab wears the rebrand: plain Magnolia base (design.md §E2).
    <View style={[styles.flex, { backgroundColor: t.brand.colors.bg }]}>
      <View style={[styles.searchWrap, { paddingTop: insets.top + 8 }]}>
        <View style={styles.searchRow}>
          {showBack ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Back"
              onPress={() => router.back()}
              hitSlop={12}
            >
              <Icon name="chevronLeft" size={28} color={t.brand.colors.clay} />
            </Pressable>
          ) : null}
          <View style={styles.searchBarFlex}>
            <SearchBar
              inputRef={inputRef}
              value={s.query}
              onChangeText={s.setQuery}
              onFocus={() => s.setFocused(true)}
              onBlur={() => s.setFocused(false)}
            />
          </View>
          {/* Pinned Find Your Perfect Local Match entry (D1) — interim Feather
              heart glyph per design §8. */}
          <PhysicalPressable
            onPress={() => router.push("/swipe")}
            accessibilityLabel="Find Your Perfect Local Match"
            radius={24}
            fullWidth={false}
            style={[
              styles.matchBtn,
              {
                backgroundColor: t.brand.colors.clay,
                borderColor: t.brand.colors.clayDark,
              },
            ]}
          >
            <Icon name="heart" size={22} color={t.colors.white} />
          </PhysicalPressable>
        </View>
        <CategoryChips selected={s.query} onSelect={setQuery} />
      </View>

      {s.loading ? (
        <ActivityIndicator
          style={styles.center}
          color={t.brand.colors.clay}
          accessibilityLabel="Loading registry"
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
              <ActivityIndicator
                color={t.brand.colors.clay}
                style={styles.footer}
              />
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
    paddingBottom: 8,
    gap: 12,
  },
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  searchBarFlex: { flex: 1 },
  matchBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  center: { marginTop: 48 },
  list: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 44, gap: 16 },
  footer: { paddingVertical: 24 },
  error: { textAlign: "center", paddingVertical: 24 },
});
