import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '@/theme/ThemeProvider';
import { Pill } from './Pill';
import { PhysicalPressable } from './PhysicalPressable';
import type { ButtonTone } from './Button';
import type { IconName } from './Icon';

interface BannerProps {
  title: string;
  subtitle?: string;
  /** rust = "Let us help you plan", mustard = "Ask the community". */
  tone: 'rust' | 'mustard';
  /** CTA is visual only — the whole banner is the tap target. */
  cta: { label: string; icon?: IconName };
  onPress: () => void;
}

/**
 * Rounded promo banner — the Figma "Banner" component. The ENTIRE surface (incl.
 * the pill CTA) is one tap target with a physical-button press: it pushes into
 * its hard shadow on press. The inner pill is presentational so it doesn't
 * double-fire.
 */
export function Banner({ title, subtitle, tone, cta, onPress }: BannerProps) {
  const t = useTheme();
  const isRust = tone === 'rust';
  const bg = isRust ? t.colors.rust : t.colors.mustard;
  const fg = isRust ? t.colors.white : t.colors.black;
  const ctaTone: ButtonTone = isRust ? 'rust' : 'black';

  return (
    <PhysicalPressable
      onPress={onPress}
      accessibilityLabel={title}
      radius={t.radii.card}
      shadowColor={t.colors.rustDark}
      style={[styles.wrap, { backgroundColor: bg, borderColor: t.colors.rustDark, borderRadius: t.radii.card }]}
    >
      <View style={styles.copy}>
        <Text style={[t.typography.displayS, { color: fg }]}>{title}</Text>
        {subtitle ? <Text style={[t.typography.body, { color: fg }]}>{subtitle}</Text> : null}
      </View>
      <Pill label={cta.label} icon={cta.icon} tone={ctaTone} />
    </PhysicalPressable>
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
