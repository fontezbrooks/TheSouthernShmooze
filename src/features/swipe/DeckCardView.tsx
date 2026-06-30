import { View, Text, Image, StyleSheet } from "react-native";
import { useTheme } from "@/theme/ThemeProvider";
import { Icon } from "@/components/ui/Icon";
import { CertifiedBadge } from "@/components/ui/CertifiedBadge";
import { ConfidenceBadge } from "./ConfidenceBadge";
import type { DeckCard } from "./swipeTypes";

/** The face of a swipe card: logo, name, tagline, confidence, distance, badges. */
export function DeckCardView({ card }: { card: DeckCard }) {
  const t = useTheme();
  const distance =
    card.distanceKm == null ? null : `${card.distanceKm.toFixed(1)} km away`;

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: t.colors.surface,
          borderColor: t.colors.rustDark,
          borderRadius: t.radii.card,
        },
        t.shadow.hard,
      ]}
    >
      <View
        style={[styles.imageWrap, { borderBottomColor: t.colors.imageHairline }]}
      >
        {card.logoUrl ? (
          <Image
            source={{ uri: card.logoUrl }}
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
            <Icon name="briefcaseFilled" size={96} color={t.colors.rustDark} />
          </View>
        )}
      </View>

      <View style={styles.body}>
        <ConfidenceBadge confidence={card.confidence} isFeatured={card.isFeatured} />
        <Text style={t.typography.displayXS} numberOfLines={2}>
          {card.name}
        </Text>
        {card.tagline ? (
          <Text style={t.typography.body} numberOfLines={3}>
            {card.tagline}
          </Text>
        ) : null}
        <View style={styles.meta}>
          {card.isCertified ? <CertifiedBadge label="Certified" /> : null}
          {distance ? (
            <Text style={[t.typography.caption, { color: t.colors.muted }]}>
              {distance}
            </Text>
          ) : null}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { width: "100%", borderWidth: 2, overflow: "hidden" },
  imageWrap: {
    width: "100%",
    height: 280,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  imageFill: { width: "100%", height: "100%" },
  placeholder: { alignItems: "center", justifyContent: "center" },
  body: { padding: 16, gap: 10 },
  meta: { flexDirection: "row", alignItems: "center", gap: 12 },
});
