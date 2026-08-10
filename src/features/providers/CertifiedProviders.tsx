import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import { useRouter } from "expo-router";
import { useTheme } from "@/theme/ThemeProvider";
import { Button } from "@/components/ui/Button";
import { StrokedHeading } from "@/components/ui/StrokedHeading";
import { BusinessCard } from "./BusinessCard";
import { useProviders } from "./useProviders";

interface CertifiedProvidersProps {
  onCallPress: (phone: string) => void;
}

/**
 * Home section: header (+ "View all" pill) and a horizontal rail of provider
 * cards. The rail auto-appends the next PAGE_SIZE batch as the user nears the
 * end — no "See More" tile (July 2026 round, H6/H7). Layout and placement are
 * unchanged from the ScrollView version.
 */
export function CertifiedProviders({ onCallPress }: CertifiedProvidersProps) {
  const t = useTheme();
  const router = useRouter();
  const { pinned, more, loading, loadingMore, error, loadMore } =
    useProviders();
  const cards = [...pinned, ...more];

  const openBiz = (sourceUid: string) => router.push(`/business/${sourceUid}`);

  return (
    <View style={styles.section}>
      <View style={styles.headerRow}>
        <StrokedHeading variant="displayXS">Shmooze Certified</StrokedHeading>
        <Button
          label="View all"
          variant="pill"
          onPress={() => router.push("/directory")}
        />
      </View>

      {loading ? (
        <ActivityIndicator color={t.colors.rust} style={styles.loading} />
      ) : cards.length === 0 ? (
        <Text style={[t.typography.body, { color: t.colors.muted }]}>
          {error ?? "No providers to show yet."}
        </Text>
      ) : (
        <FlatList
          testID="providers-rail"
          horizontal
          data={cards}
          keyExtractor={(b) => b.id}
          renderItem={({ item }) => (
            <BusinessCard
              business={item}
              onCallPress={onCallPress}
              onCardPress={openBiz}
            />
          )}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.row}
          onEndReached={loadMore}
          onEndReachedThreshold={0.5}
          ListFooterComponent={
            loadingMore ? (
              <ActivityIndicator
                color={t.colors.rust}
                style={styles.footer}
                accessibilityLabel="Loading more providers"
              />
            ) : null
          }
        />
      )}

      {error && cards.length > 0 ? (
        <Text
          style={[t.typography.caption, { color: t.colors.rust }]}
          accessibilityLiveRegion="polite"
        >
          {error}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  section: { gap: 12 },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  loading: { alignSelf: "flex-start", marginVertical: 12 },
  // paddingBottom/Right clear the cards' hard shadow (offset 4,4) so the
  // horizontal list doesn't clip it.
  row: { gap: 16, paddingRight: 16, paddingBottom: 12 },
  footer: { alignSelf: "center", paddingHorizontal: 16 },
});
