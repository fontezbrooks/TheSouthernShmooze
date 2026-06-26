import { View, Text, Image, StyleSheet, type ImageSourcePropType } from 'react-native';
import { useTheme } from '@/theme/ThemeProvider';
import { PhysicalPressable } from './PhysicalPressable';

interface BannerProps {
  title: string;
  subtitle?: string;
  /** Banner photo (Figma V3). */
  image: ImageSourcePropType;
  /** imageTop = photo across the top (Home help banner); imageLeft = photo beside the copy (community banner). */
  layout: 'imageTop' | 'imageLeft';
  /** CTA is visual only — the whole banner is the tap target. */
  cta: { label: string };
  onPress: () => void;
}

/** Dark solid CTA (Figma V3 banner button — #602A00, white label). Presentational. */
function BannerCta({ label, fullWidth }: { label: string; fullWidth?: boolean }) {
  const t = useTheme();
  return (
    <View
      style={[
        styles.cta,
        fullWidth && styles.ctaFull,
        { backgroundColor: t.colors.rustDark, borderRadius: t.radii.button },
      ]}
    >
      <Text style={[t.typography.captionSemi, { color: t.colors.white }]}>{label}</Text>
    </View>
  );
}

/**
 * Rust promo banner with a photo — the Figma V3 "Banner". The ENTIRE surface
 * (incl. the dark CTA) is one physical-press tap target. `imageTop` stacks the
 * photo above the copy with a full-width button; `imageLeft` places the photo to
 * the left with the copy + a hug-width button on the right.
 */
export function Banner({ title, subtitle, image, layout, cta, onPress }: BannerProps) {
  const t = useTheme();
  const isTop = layout === 'imageTop';

  const copy = (
    <View style={styles.copy}>
      <Text style={[t.typography.displayS, { color: t.colors.bg }]}>{title}</Text>
      {subtitle ? <Text style={[t.typography.body, { color: t.colors.white }]}>{subtitle}</Text> : null}
    </View>
  );

  return (
    <PhysicalPressable
      onPress={onPress}
      accessibilityLabel={title}
      radius={t.radii.card}
      shadowColor={t.colors.rustDark}
      style={[
        isTop ? styles.wrapTop : styles.wrapLeft,
        { backgroundColor: t.colors.rust, borderColor: t.colors.rustDark, borderRadius: t.radii.card },
      ]}
    >
      {isTop ? (
        <>
          <Image source={image} resizeMode="cover" style={styles.imageTop} />
          {copy}
          <BannerCta label={cta.label} fullWidth />
        </>
      ) : (
        <>
          <Image source={image} resizeMode="cover" style={styles.imageLeft} />
          <View style={styles.rightCol}>
            {copy}
            <BannerCta label={cta.label} />
          </View>
        </>
      )}
    </PhysicalPressable>
  );
}

const styles = StyleSheet.create({
  wrapTop: {
    width: '100%',
    padding: 24,
    gap: 16,
    borderWidth: 2,
    alignItems: 'flex-start',
  },
  wrapLeft: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    paddingLeft: 16,
    paddingRight: 24,
    paddingVertical: 24,
    borderWidth: 2,
  },
  rightCol: { flex: 1, gap: 16, alignItems: 'flex-start' },
  copy: { gap: 4, width: '100%' },
  imageTop: { width: '100%', height: 124, borderRadius: 8 },
  imageLeft: { width: 88, height: 169 },
  cta: {
    height: 32,
    paddingHorizontal: 12,
    paddingVertical: 8,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'flex-start',
  },
  ctaFull: { width: '100%', alignSelf: 'stretch' },
});
