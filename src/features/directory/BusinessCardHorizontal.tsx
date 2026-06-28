import { View, Text, Image, StyleSheet } from "react-native";
import { useTheme } from "@/theme/ThemeProvider";
import { Icon, type IconName } from "@/components/ui/Icon";
import { PhysicalPressable } from "@/components/ui/PhysicalPressable";
import type { DirectoryBusiness } from "@/features/providers/providerTypes";

interface BusinessCardHorizontalProps {
  business: DirectoryBusiness;
  onPress: (sourceUid: string) => void;
}

const LOGO_SIZE = 104;

/** Outlined 20×20 indicator chip (reviews / discount) — Figma horizontal-card style. */
function IndicatorChip({ icon }: { icon: IconName }) {
  const t = useTheme();
  return (
    <View style={[styles.indicator, { borderColor: t.colors.rustDark }]}>
      <Icon name={icon} size={12} color={t.colors.rustDark} />
    </View>
  );
}

/**
 * Horizontal directory list card (Figma node 40:7337): square logo at left, a
 * solid "Certified" pill, name + 2-line tagline, and reviews/discount indicator
 * chips. No phone button. The whole card pushes into its shadow and opens the
 * business-detail screen. No-logo businesses show a briefcase placeholder.
 */
export function BusinessCardHorizontal({
  business,
  onPress,
}: BusinessCardHorizontalProps) {
  const t = useTheme();
  const hasIndicators = business.recommended || business.hasCoupon;

  return (
    <PhysicalPressable
      onPress={() => onPress(business.sourceUid)}
      accessibilityLabel={`${business.name} — view details`}
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
      {business.logoUrl ? (
        <Image
          source={{ uri: business.logoUrl }}
          style={styles.logo}
          resizeMode="cover"
        />
      ) : (
        <View style={[styles.logo, styles.placeholder, { backgroundColor: t.colors.bg }]}>
          <Icon name="briefcaseFilled" size={40} color={t.colors.rustDark} />
        </View>
      )}

      <View style={styles.body}>
        {business.isCertified ? (
          <View style={[styles.certified, { backgroundColor: t.colors.mustard }]}>
            <Icon name="starFilled" size={12} color={t.colors.white} />
            <Text style={[t.typography.captionSemiXS, { color: t.colors.white }]}>
              Certified
            </Text>
          </View>
        ) : null}

        <View style={styles.copy}>
          <Text style={t.typography.cardTitle} numberOfLines={2}>
            {business.name}
          </Text>
          <Text
            style={[t.typography.caption, { color: t.colors.textSoft }]}
            numberOfLines={2}
            ellipsizeMode="tail"
          >
            {business.tagline}
          </Text>
        </View>

        {hasIndicators ? (
          <View style={styles.chipRow}>
            {business.recommended ? <IndicatorChip icon="thumbsUp" /> : null}
            {business.hasCoupon ? <IndicatorChip icon="tag" /> : null}
          </View>
        ) : null}
      </View>
    </PhysicalPressable>
  );
}

const styles = StyleSheet.create({
  card: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 2,
    overflow: "hidden",
  },
  logo: { width: LOGO_SIZE, height: LOGO_SIZE },
  placeholder: { alignItems: "center", justifyContent: "center" },
  body: {
    flex: 1,
    justifyContent: "center",
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  copy: { gap: 2 },
  certified: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    gap: 2,
    height: 20,
    paddingHorizontal: 6,
    borderRadius: 9999,
  },
  chipRow: { flexDirection: "row", gap: 4 },
  indicator: {
    width: 20,
    height: 20,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderRadius: 9999,
  },
});
