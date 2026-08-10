import { View, Text, Image, Pressable, StyleSheet } from "react-native";
import { useTheme } from "@/theme/ThemeProvider";
import { Icon } from "@/components/ui/Icon";
import { CardBadge } from "@/components/ui/CardBadge";
import { CertifiedBadge } from "@/components/ui/CertifiedBadge";
import type { DirectoryBusiness } from "@/features/providers/providerTypes";

interface BusinessCardHorizontalProps {
  business: DirectoryBusiness;
  onPress: (sourceUid: string) => void;
}

const LOGO_SIZE = 104;

/**
 * Horizontal directory list card (Figma node 40:7337). Flat layout — no card
 * border/background/shadow; only the square logo carries an 8px radius + hairline.
 * Body stacks reviews/discount badges (top), name + 2-line tagline, and the
 * "Shmooze Certified" pill (bottom). The whole row opens the business-detail
 * screen. No-logo businesses show a briefcase placeholder.
 */
export function BusinessCardHorizontal({
  business,
  onPress,
}: BusinessCardHorizontalProps) {
  const t = useTheme();
  const hasBadges = business.recommended || business.hasCoupon;

  return (
    <Pressable
      onPress={() => onPress(business.sourceUid)}
      accessibilityRole="button"
      accessibilityLabel={`${business.name} — view details`}
      style={({ pressed }) => [styles.card, { opacity: pressed ? 0.7 : 1 }]}
    >
      {business.logoUrl ? (
        <Image
          source={{ uri: business.logoUrl }}
          style={[styles.logo, { borderColor: t.brand.colors.line }]}
          resizeMode="cover"
        />
      ) : (
        <View
          style={[
            styles.logo,
            styles.placeholder,
            {
              borderColor: t.brand.colors.line,
              backgroundColor: t.brand.colors.porchCream,
            },
          ]}
        >
          <Icon name="briefcaseFilled" size={40} color={t.brand.colors.pine} />
        </View>
      )}

      <View style={styles.body}>
        {hasBadges ? (
          <View style={styles.badgeRow}>
            {business.recommended ? <CardBadge icon="thumbsUp" /> : null}
            {business.hasCoupon ? <CardBadge icon="discount" /> : null}
          </View>
        ) : null}

        <View style={styles.copy}>
          <Text
            style={[
              t.typography.cardTitle,
              { fontFamily: t.brand.fonts.bodyBold, color: t.brand.colors.text },
            ]}
            numberOfLines={2}
          >
            {business.name}
          </Text>
          <Text
            style={[
              t.brand.typography.caption,
              { color: t.brand.colors.textSoft },
            ]}
            numberOfLines={2}
            ellipsizeMode="tail"
          >
            {business.tagline}
          </Text>
        </View>

        {business.isCertified ? <CertifiedBadge /> : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    width: "100%",
    height: LOGO_SIZE,
    flexDirection: "row",
    alignItems: "center",
  },
  logo: {
    width: LOGO_SIZE,
    height: LOGO_SIZE,
    borderRadius: 8,
    borderWidth: StyleSheet.hairlineWidth,
  },
  placeholder: { alignItems: "center", justifyContent: "center" },
  body: {
    flex: 1,
    justifyContent: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  badgeRow: { flexDirection: "row", gap: 4 },
  copy: { gap: 2 },
});
