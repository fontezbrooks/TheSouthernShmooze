import {
  View,
  Text,
  Image,
  FlatList,
  Pressable,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useTheme } from "@/theme/ThemeProvider";
import { Icon } from "@/components/ui/Icon";
import { useSwipeSession } from "./SwipeSessionProvider";
import { useMatches } from "./useMatches";
import type { SwipeMatch } from "./swipeTypes";

const STATUS_LABEL: Record<SwipeMatch["status"], string> = {
  sent: "Sent",
  confirmed: "Confirmed",
  closed: "Closed",
};

/** The Seeker's sent leads + live status (Sent → Confirmed). */
export function MatchesScreen() {
  const t = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { sessionToken } = useSwipeSession();
  const { matches, loading, error, refresh } = useMatches(sessionToken);

  const statusColor = (status: SwipeMatch["status"]) =>
    status === "confirmed" ? t.colors.rust : t.colors.muted;

  return (
    <View
      style={[
        styles.flex,
        { backgroundColor: t.colors.bg, paddingTop: insets.top },
      ]}
    >
      <View style={styles.header}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Back"
          onPress={() => router.back()}
          hitSlop={12}
          style={styles.backBtn}
        >
          <Text style={[t.typography.bodySemibold, { color: t.colors.rust }]}>
            ‹ Back
          </Text>
        </Pressable>
        <Text style={t.typography.displayXS}>Your matches</Text>
        <View style={styles.spacer} />
      </View>

      {loading && matches.length === 0 ? (
        <ActivityIndicator style={styles.center} color={t.colors.rust} />
      ) : (
        <FlatList
          data={matches}
          // A Seeker can have leads to the same business under different tasks, so
          // businessUid alone isn't unique — pair it with the per-lead timestamp.
          keyExtractor={(m) => `${m.businessUid}-${m.createdAt}`}
          onRefresh={refresh}
          refreshing={loading}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <Text
              style={[
                t.typography.body,
                styles.empty,
                { color: t.colors.muted },
              ]}
            >
              {error ?? "No matches yet — swipe right to send your first lead."}
            </Text>
          }
          renderItem={({ item }) => (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`${item.name} — open profile`}
              onPress={() => router.push(`/business/${item.businessUid}`)}
              style={({ pressed }) => [
                styles.row,
                {
                  backgroundColor: t.colors.surface,
                  borderColor: t.colors.inputBorder,
                  borderRadius: t.radii.card,
                  opacity: pressed ? 0.85 : 1,
                },
              ]}
            >
              {item.logoUrl ? (
                <Image source={{ uri: item.logoUrl }} style={styles.logo} />
              ) : (
                <View
                  style={[
                    styles.logo,
                    styles.placeholder,
                    { backgroundColor: t.colors.bg },
                  ]}
                >
                  <Icon
                    name="briefcaseFilled"
                    size={28}
                    color={t.colors.rustDark}
                  />
                </View>
              )}
              <View style={styles.rowBody}>
                <Text style={t.typography.bodySemibold} numberOfLines={1}>
                  {item.name}
                </Text>
                <Text style={[t.typography.caption, { color: t.colors.muted }]}>
                  {item.confidence}% match
                </Text>
              </View>
              <Text
                style={[
                  t.typography.captionSemi,
                  { color: statusColor(item.status) },
                ]}
              >
                {STATUS_LABEL[item.status]}
              </Text>
            </Pressable>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  center: { marginTop: 48 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  spacer: { width: 48 },
  backBtn: { paddingVertical: 6, paddingRight: 12 },
  list: { padding: 16, gap: 12, flexGrow: 1 },
  empty: { textAlign: "center", marginTop: 48 },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 12,
    borderWidth: 1,
  },
  logo: { width: 48, height: 48, borderRadius: 8 },
  placeholder: { alignItems: "center", justifyContent: "center" },
  rowBody: { flex: 1, gap: 2 },
});
