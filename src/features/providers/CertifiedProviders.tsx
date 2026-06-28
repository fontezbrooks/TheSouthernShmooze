import {
  View,
  Text,
  Pressable,
  ScrollView,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import { useRouter } from "expo-router";
import { useTheme } from "@/theme/ThemeProvider";
import { Icon } from "@/components/ui/Icon";
import { StrokedHeading } from "@/components/ui/StrokedHeading";
import { BusinessCard } from "./BusinessCard";
import { useProviders } from "./useProviders";

interface CertifiedProvidersProps {
  onCallPress: (phone: string) => void;
}

/** Home section: header + horizontal row of provider cards + "See More". */
export function CertifiedProviders({ onCallPress }: CertifiedProvidersProps) {
  const t = useTheme();
  const router = useRouter();
  const { pinned, loading, error } = useProviders();
  const cards = pinned;

  const openBiz = (sourceUid: string) => router.push(`/business/${sourceUid}`);

  return (
    <View style={styles.section}>
      <StrokedHeading variant="displayXS">Certified Providers</StrokedHeading>

      {loading ? (
        <ActivityIndicator color={t.colors.rust} style={styles.loading} />
      ) : cards.length === 0 ? (
        <Text style={[t.typography.body, { color: t.colors.muted }]}>
          {error ?? "No providers to show yet."}
        </Text>
      ) : (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.row}
        >
          {cards.map((b) => (
            <BusinessCard
              key={b.id}
              business={b}
              onCallPress={onCallPress}
              onCardPress={openBiz}
            />
          ))}

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="See more providers in the directory"
            onPress={() => router.push("/directory")}
            style={[
              styles.seeMore,
              {
                backgroundColor: t.colors.rust,
                borderColor: t.colors.rustDark,
                borderRadius: t.radii.card,
              },
            ]}
          >
            <Text style={[t.typography.seeMore, { color: t.colors.bg }]}>
              See More
            </Text>
            <Icon name="arrowRight" size={18} color={t.colors.bg} />
          </Pressable>
        </ScrollView>
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
  loading: { alignSelf: "flex-start", marginVertical: 12 },
  // paddingBottom/Right clear the cards' hard shadow (offset 4,4) so the
  // horizontal ScrollView doesn't clip it.
  row: { gap: 16, paddingRight: 16, paddingBottom: 12 },
  seeMore: {
    width: 120,
    borderWidth: 2,
    padding: 24,
    justifyContent: "center",
    alignItems: "flex-start",
    gap: 8,
  },
});
