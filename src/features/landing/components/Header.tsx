import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/theme/ThemeProvider';
import { Button } from '@/components/ui/Button';
import { openLink } from '@/lib/openLink';
import { LINKS } from '../links';

const NAV = [
  { label: 'Membership', url: LINKS.membership },
  { label: 'Directory', url: LINKS.directory },
  { label: 'Resources', url: LINKS.resources },
] as const;

/** Top bar: wordmark + socials, then nav links + Browse Directory CTA. */
export function Header() {
  const t = useTheme();
  return (
    <View style={styles.wrap}>
      <View style={styles.topRow}>
        <Text style={[t.typography.h2, styles.wordmark]} numberOfLines={2}>
          The Southern Shmooze
        </Text>
        <View style={styles.socials}>
          <Pressable onPress={() => openLink(LINKS.facebook)} accessibilityLabel="Facebook group" hitSlop={8}>
            <Ionicons name="logo-facebook" size={22} color={t.colors.text} />
          </Pressable>
          <Pressable onPress={() => openLink(LINKS.email)} accessibilityLabel="Email us" hitSlop={8}>
            <Ionicons name="mail-outline" size={22} color={t.colors.text} />
          </Pressable>
        </View>
      </View>

      <View style={styles.navRow}>
        <View style={styles.navLinks}>
          {NAV.map((n) => (
            <Pressable key={n.label} onPress={() => openLink(n.url)} accessibilityRole="link" hitSlop={6}>
              <Text style={t.typography.label}>{n.label}</Text>
            </Pressable>
          ))}
        </View>
        <Button
          label="Browse Directory"
          variant="primary"
          onPress={() => openLink(LINKS.directory)}
          style={styles.cta}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { paddingHorizontal: 20, paddingTop: 12, gap: 12 },
  topRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  wordmark: { flex: 1, fontSize: 20, lineHeight: 24 },
  socials: { flexDirection: 'row', gap: 16, alignItems: 'center' },
  navRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 },
  navLinks: { flexDirection: 'row', gap: 16, flexWrap: 'wrap', alignItems: 'center' },
  cta: { paddingVertical: 10, paddingHorizontal: 16 },
});
