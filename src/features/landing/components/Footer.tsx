import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useTheme } from '@/theme/ThemeProvider';
import { openLink } from '@/lib/openLink';
import { LINKS } from '../links';

/** Copyright + contact email. */
export function Footer() {
  const t = useTheme();
  return (
    <View style={styles.wrap}>
      <Text style={[t.typography.caption, styles.center]}>
        © 2026 The Southern Shmooze. All Rights Reserved.
      </Text>
      <Pressable onPress={() => openLink(LINKS.email)} accessibilityRole="link" hitSlop={6}>
        <Text style={[t.typography.caption, { color: t.colors.secondary }]}>
          hello@thesouthernshmooze.com
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { paddingVertical: 28, paddingHorizontal: 24, gap: 6, alignItems: 'center' },
  center: { textAlign: 'center' },
});
