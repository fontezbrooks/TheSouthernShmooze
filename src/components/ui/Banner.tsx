import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '@/theme/ThemeProvider';
import { Button, type ButtonTone } from './Button';
import type { IconName } from './Icon';

interface BannerProps {
  title: string;
  subtitle?: string;
  /** rust = "Let us help you plan", mustard = "Ask the community". */
  tone: 'rust' | 'mustard';
  cta: { label: string; icon?: IconName; onPress: () => void };
}

/** Rounded promo banner with a pill CTA — the Figma "Banner" component. */
export function Banner({ title, subtitle, tone, cta }: BannerProps) {
  const t = useTheme();
  const isRust = tone === 'rust';
  const bg = isRust ? t.colors.rust : t.colors.mustard;
  const fg = isRust ? t.colors.white : t.colors.black;
  const ctaTone: ButtonTone = isRust ? 'rust' : 'black';

  return (
    <View style={[styles.wrap, { backgroundColor: bg, borderColor: t.colors.rustDark, borderRadius: t.radii.card }]}>
      <View style={styles.copy}>
        <Text style={[t.typography.displayS, { color: fg }]}>{title}</Text>
        {subtitle ? <Text style={[t.typography.body, { color: fg }]}>{subtitle}</Text> : null}
      </View>
      <Button label={cta.label} icon={cta.icon} variant="pill" tone={ctaTone} onPress={cta.onPress} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    width: '100%',
    padding: 24,
    gap: 16,
    borderWidth: 2,
    alignItems: 'flex-start',
  },
  copy: { gap: 4, width: '100%' },
});
