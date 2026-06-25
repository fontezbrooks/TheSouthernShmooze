import { View, Text, Pressable, ScrollView, ActivityIndicator, StyleSheet } from 'react-native';
import { useTheme } from '@/theme/ThemeProvider';
import { Icon } from '@/components/ui/Icon';
import { BusinessCard } from './BusinessCard';
import { useProviders } from './useProviders';

interface CertifiedProvidersProps {
  onCallPress: (phone: string) => void;
}

/** Home section: header + horizontal row of provider cards + "See More". */
export function CertifiedProviders({ onCallPress }: CertifiedProvidersProps) {
  const t = useTheme();
  const { pinned, more, loading, loadingMore, hasMore, error, loadMore } = useProviders();
  const cards = [...pinned, ...more];

  return (
    <View style={styles.section}>
      <View style={styles.header}>
        <Text style={[t.typography.displayXS, styles.headerText]}>Certified Providers</Text>
        <Icon name="arrowRight" size={18} color={t.colors.text} />
      </View>

      {loading ? (
        <ActivityIndicator color={t.colors.rust} style={styles.loading} />
      ) : cards.length === 0 ? (
        <Text style={[t.typography.body, { color: t.colors.muted }]}>
          {error ?? 'No providers to show yet.'}
        </Text>
      ) : (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.row}
        >
          {cards.map((b) => (
            <BusinessCard key={b.id} business={b} onCallPress={onCallPress} />
          ))}

          {hasMore ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="See more providers"
              onPress={loadMore}
              disabled={loadingMore}
              style={[
                styles.seeMore,
                { backgroundColor: t.colors.mustard, borderColor: t.colors.rustDark, borderRadius: t.radii.card },
              ]}
            >
              {loadingMore ? (
                <ActivityIndicator color={t.colors.text} />
              ) : (
                <>
                  <Text style={t.typography.seeMore}>See More</Text>
                  <Icon name="arrowRight" size={18} color={t.colors.text} />
                </>
              )}
            </Pressable>
          ) : null}
        </ScrollView>
      )}

      {error && cards.length > 0 ? (
        <Text style={[t.typography.caption, { color: t.colors.rust }]} accessibilityLiveRegion="polite">
          {error}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  section: { gap: 12 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  headerText: { flexShrink: 1 },
  loading: { alignSelf: 'flex-start', marginVertical: 12 },
  row: { gap: 8, paddingRight: 16 },
  seeMore: {
    width: 120,
    borderWidth: 2,
    padding: 24,
    justifyContent: 'center',
    alignItems: 'flex-start',
    gap: 8,
  },
});
