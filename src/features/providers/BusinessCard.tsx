import { View, Text, Image, Pressable, StyleSheet } from 'react-native';
import { useTheme } from '@/theme/ThemeProvider';
import { Icon } from '@/components/ui/Icon';
import type { DirectoryBusiness } from './providerTypes';

interface BusinessCardProps {
  business: DirectoryBusiness;
  onCallPress: (phone: string) => void;
}

const CARD_WIDTH = 180;
const IMAGE_SIZE = CARD_WIDTH - 16; // image inset roughly matches Figma 164 in a ~180 card

/** A Certified Providers card — logo, star, name, tagline, phone row. */
export function BusinessCard({ business, onCallPress }: BusinessCardProps) {
  const t = useTheme();
  return (
    <View
      style={[
        styles.card,
        { backgroundColor: t.colors.surface, borderColor: t.colors.rustDark, borderRadius: t.radii.card },
      ]}
    >
      {business.logoUrl ? (
        <Image source={{ uri: business.logoUrl }} style={styles.image} resizeMode="cover" />
      ) : (
        <View style={[styles.image, { backgroundColor: t.colors.bg }]} />
      )}
      <View style={styles.body}>
        <View style={styles.copy}>
          <Icon name="starFilled" size={20} color={t.colors.pumpkin} />
          <Text style={t.typography.cardTitle}>{business.name}</Text>
          {business.tagline ? (
            <Text style={t.typography.caption} numberOfLines={3} ellipsizeMode="tail">
              {business.tagline}
            </Text>
          ) : null}
        </View>
        {business.phoneDisplay && business.phone ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Call ${business.name}`}
            hitSlop={8}
            onPress={() => onCallPress(business.phone as string)}
            style={styles.phoneRow}
          >
            <Icon name="phoneFilled" size={14} color={t.colors.text} />
            <Text style={t.typography.captionSemi}>{business.phoneDisplay}</Text>
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: CARD_WIDTH,
    borderWidth: 2,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: IMAGE_SIZE,
  },
  body: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 16,
    gap: 8,
  },
  copy: { gap: 2 },
  phoneRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
});
