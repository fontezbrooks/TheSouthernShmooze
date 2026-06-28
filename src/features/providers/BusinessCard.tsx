import { View, Text, Image, Pressable, StyleSheet } from "react-native";
import { useTheme } from "@/theme/ThemeProvider";
import { Icon } from "@/components/ui/Icon";
import { Chip } from "@/components/ui/Chip";
import { PhysicalPressable } from "@/components/ui/PhysicalPressable";
import type { DirectoryBusiness } from "./providerTypes";

interface BusinessCardProps {
  business: DirectoryBusiness;
  onCallPress: (phone: string) => void;
  onCardPress: (sourceUid: string) => void;
}

const CARD_WIDTH = 168; // 164 image + 2px border each side
const IMAGE_SIZE = 164;

/**
 * A Certified Providers card. The whole card is a physical-press tap target that
 * opens the web directory listing; the rust phone button is a separate nested tap
 * that dials. No-logo businesses show a briefcase placeholder.
 */
export function BusinessCard({
  business,
  onCallPress,
  onCardPress,
}: BusinessCardProps) {
  const t = useTheme();

  return (
    <PhysicalPressable
      fullWidth={false}
      onPress={() => onCardPress(business.sourceUid)}
      accessibilityLabel={`${business.name} — open directory listing`}
      radius={t.radii.card}
      shadowColor={t.colors.rustDark}
      style={[
        styles.card,
        {
          backgroundColor: t.colors.surface,
          borderColor: t.colors.rustDark,
          borderRadius: t.radii.card,
        },
      ]}
    >
      <View
        style={[
          styles.imageWrap,
          { borderBottomColor: t.colors.imageHairline },
        ]}
      >
        {business.logoUrl ? (
          <Image
            source={{ uri: business.logoUrl }}
            style={styles.imageFill}
            resizeMode="cover"
          />
        ) : (
          <View
            style={[
              styles.imageFill,
              styles.placeholder,
              { backgroundColor: t.colors.bg },
            ]}
          >
            <Icon name="briefcaseFilled" size={63} color={t.colors.rustDark} />
          </View>
        )}
      </View>

      <View style={styles.body}>
        <View style={styles.copy}>
          <Text
            style={[t.typography.cardTitle, styles.name]}
            numberOfLines={2}
            ellipsizeMode="tail"
          >
            {business.name}
          </Text>
          <Text
            style={[t.typography.caption, styles.tagline]}
            numberOfLines={2}
            ellipsizeMode="tail"
          >
            {business.tagline}
          </Text>
        </View>

        <View style={styles.chips}>
          <Chip
            icon="starFilled"
            label="Certified"
            iconColor={t.colors.yellow}
          />
          {/* TODO(figma-round): re-skin this badge — `isCertified` is the certified star, not a "reviews" chip. */}
          {business.isCertified ? <Chip icon="thumbsUp" /> : null}
          {business.hasCoupon ? <Chip icon="tag" /> : null}
        </View>

        {business.phoneDisplay && business.phone ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Call ${business.name}`}
            onPress={() => onCallPress(business.phone as string)}
            style={[styles.phoneBtn, { backgroundColor: t.colors.rust }]}
          >
            <Icon name="phoneFilled" size={12} color={t.colors.white} />
            <Text style={[t.typography.captionSemi, { color: t.colors.white }]}>
              {business.phoneDisplay}
            </Text>
          </Pressable>
        ) : null}
      </View>
    </PhysicalPressable>
  );
}

const styles = StyleSheet.create({
  card: {
    width: CARD_WIDTH,
    borderWidth: 2,
    overflow: "hidden",
  },
  imageWrap: {
    width: "100%",
    height: IMAGE_SIZE,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  imageFill: { width: "100%", height: "100%" },
  placeholder: { alignItems: "center", justifyContent: "center" },
  body: {
    padding: 12,
    gap: 8,
  },
  copy: { gap: 2 },
  // Reserve a fixed name + description height so every card is the same size,
  // regardless of name/description length (caption lh 18 → 2 lines = 36). Descriptions
  // are capped at 2 lines + ellipsis so short copy doesn't leave a gap before the badge.
  name: { minHeight: 36 },
  tagline: { minHeight: 36 },
  chips: { flexDirection: "row", alignItems: "center", gap: 4 },
  phoneBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    height: 32,
    width: "100%",
    paddingHorizontal: 12,
    borderRadius: 9999,
    overflow: "hidden",
  },
});
