import { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import { useRouter } from "expo-router";
import { useTheme } from "@/theme/ThemeProvider";
import { Button } from "@/components/ui/Button";
import { CertifiedBadge } from "@/components/ui/CertifiedBadge";
import { openLink } from "@/lib/openLink";
import { businessDetailRepository } from "@/features/business-detail/businessDetailRepository";
import type { BusinessDetail } from "@/features/business-detail/businessDetailTypes";
import { CenteredSheet } from "./CenteredSheet";

interface ProfileQuickViewProps {
  visible: boolean;
  sourceUid: string | null;
  onClose: () => void;
}

/**
 * Profile quick view (S8): a condensed peek at a provider from the deck —
 * logo, name, certified badge, tagline, address, call, and a jump to the full
 * profile. Data via the same repository as the full detail screen.
 */
export function ProfileQuickView({
  visible,
  sourceUid,
  onClose,
}: ProfileQuickViewProps) {
  const t = useTheme();
  const router = useRouter();
  const [detail, setDetail] = useState<BusinessDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!visible || !sourceUid) return;
    let alive = true;
    (async () => {
      setLoading(true);
      setError(null);
      setDetail(null);
      const res = await businessDetailRepository.fetchByUid(sourceUid);
      if (!alive) return;
      if (res.ok) setDetail(res.data);
      else setError(res.error);
      setLoading(false);
    })();
    return () => {
      alive = false;
    };
  }, [visible, sourceUid]);

  const openFullProfile = () => {
    onClose();
    if (sourceUid) router.push(`/business/${sourceUid}`);
  };

  return (
    <CenteredSheet visible={visible} onClose={onClose}>
      <View style={styles.body}>
        {loading ? (
          <ActivityIndicator color={t.colors.rust} style={styles.spinner} />
        ) : error ? (
          <Text style={[t.typography.body, { color: t.colors.error }]}>
            {error}
          </Text>
        ) : detail ? (
          <>
            <View style={styles.headerRow}>
              {detail.logoUrl ? (
                <Image
                  source={{ uri: detail.logoUrl }}
                  style={[styles.logo, { borderColor: t.colors.rustDark }]}
                  resizeMode="cover"
                />
              ) : null}
              <View style={styles.headerCol}>
                <Text style={t.typography.displayXS}>{detail.name}</Text>
                {detail.isCertified ? <CertifiedBadge /> : null}
              </View>
            </View>

            {detail.tagline ? (
              <Text style={[t.typography.body, { color: t.colors.textSoft }]}>
                {detail.tagline}
              </Text>
            ) : null}
            {detail.address ? (
              <Text
                style={[t.typography.captionSemi, { color: t.colors.muted }]}
              >
                {detail.address}
              </Text>
            ) : null}

            <View style={styles.actions}>
              {detail.phones[0] ? (
                <Button
                  label={`Call ${detail.phones[0].display}`}
                  variant="outline"
                  onPress={() => openLink(`tel:${detail.phones[0].raw}`)}
                />
              ) : null}
              <Button
                label="View full profile"
                variant="solid"
                onPress={openFullProfile}
              />
            </View>
          </>
        ) : null}
      </View>
    </CenteredSheet>
  );
}

const styles = StyleSheet.create({
  body: { padding: 16, paddingTop: 4, gap: 12 },
  spinner: { paddingVertical: 32 },
  headerRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  headerCol: { flex: 1, gap: 6 },
  logo: { width: 64, height: 64, borderRadius: 12, borderWidth: 1 },
  actions: { gap: 12, marginTop: 4 },
});
