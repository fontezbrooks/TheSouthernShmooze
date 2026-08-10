import { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import { useTheme } from "@/theme/ThemeProvider";
import { Button } from "@/components/ui/Button";
import { openLink } from "@/lib/openLink";
import { providerRepository } from "@/features/providers/providerRepository";
import type { DirectoryBusiness } from "@/features/providers/providerTypes";

interface PartnerRevealProps {
  onBackHome: () => void;
  /** Clears the completed flow so another request can start (tab-preserved screens re-render success otherwise). */
  onSubmitAnother: () => void;
}

/**
 * Concierge confirmation with the preferred-partner reveal (FR-4.3, site
 * parity: "Your Shmooze preferred partners"). Interim partner rule per
 * design.md §E3: the pinned/certified providers stand in until the
 * conciergeRotation data lands at-launch (L4). Best-effort: if the fetch
 * fails, the confirmation copy still stands on its own.
 */
export function PartnerReveal({
  onBackHome,
  onSubmitAnother,
}: PartnerRevealProps) {
  const t = useTheme();
  const [loading, setLoading] = useState(true);
  const [partner, setPartner] = useState<DirectoryBusiness | null>(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      const res = await providerRepository.fetchPinned();
      if (!alive) return;
      setPartner(res.ok ? (res.data[0] ?? null) : null);
      setLoading(false);
    })();
    return () => {
      alive = false;
    };
  }, []);

  return (
    <View style={styles.wrap} accessibilityLiveRegion="polite">
      <View
        style={[
          styles.card,
          t.brand.shadow.card,
          {
            backgroundColor: t.brand.colors.surface,
            borderColor: t.brand.colors.line,
            borderRadius: t.brand.radii.lg,
          },
        ]}
      >
        <Text
          style={[t.brand.typography.displayM, { color: t.brand.colors.text }]}
        >
          We&apos;re on it.
        </Text>
        <Text style={t.brand.typography.body}>
          We&apos;ve received your request. Your Shmooze preferred partner will
          reach out to you shortly — keep an eye on your phone and email.
        </Text>

        {loading ? (
          <ActivityIndicator color={t.brand.colors.clay} />
        ) : partner ? (
          <View
            style={[styles.partnerRow, { borderTopColor: t.brand.colors.line }]}
          >
            {partner.logoUrl ? (
              <Image
                source={{ uri: partner.logoUrl }}
                style={[styles.logo, { borderColor: t.brand.colors.line }]}
                resizeMode="cover"
              />
            ) : null}
            <View style={styles.partnerCol}>
              <Text
                style={[
                  t.brand.typography.chip,
                  { color: t.brand.colors.textSoft },
                ]}
              >
                Your Shmooze preferred partner
              </Text>
              <Text
                style={[
                  t.brand.typography.bodySemi,
                  { color: t.brand.colors.text },
                ]}
              >
                {partner.name}
              </Text>
              {partner.phoneDisplay && partner.phone ? (
                <Text
                  style={[
                    t.brand.typography.caption,
                    { color: t.brand.colors.clay },
                  ]}
                  accessibilityRole="link"
                  accessibilityLabel={`Call ${partner.name} at ${partner.phoneDisplay}`}
                  onPress={() => openLink(`tel:${partner.phone}`)}
                >
                  Prefer to reach out now? {partner.phoneDisplay}
                </Text>
              ) : null}
            </View>
          </View>
        ) : null}
      </View>
      <Button label="Back Home" variant="primary" onPress={onBackHome} />
      <Button
        label="Submit Another Request"
        variant="wide"
        onPress={onSubmitAnother}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 16 },
  card: {
    borderWidth: StyleSheet.hairlineWidth,
    padding: 24,
    gap: 16,
    alignItems: "flex-start",
  },
  partnerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingTop: 16,
    borderTopWidth: StyleSheet.hairlineWidth,
    alignSelf: "stretch",
  },
  partnerCol: { flex: 1, gap: 2 },
  logo: {
    width: 56,
    height: 56,
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
  },
});
