import type { ReactNode } from 'react';
import { View, Text, Image, StyleSheet, type ImageSourcePropType } from 'react-native';
import { useTheme } from '@/theme/ThemeProvider';
import { PhysicalPressable } from './PhysicalPressable';

interface BannerProps {
  title: string;
  subtitle?: string;
  /** Banner photo (Figma V3). Omit for text-first blocks (Newsletter — approved, design §8). */
  image?: ImageSourcePropType;
  /** Component image (e.g. a transformer-imported SVG) rendered in the image slot instead of `image`. */
  imageNode?: ReactNode;
  /**
   * imageTop = photo across the top (Concierge top card); imageLeft = photo
   * beside the copy (community); titleRow = logo + title share the top row,
   * subtitle and a full-width CTA span below (Match block, SR3).
   */
  layout: 'imageTop' | 'imageLeft' | 'titleRow';
  /** Figma 85:3127 centers the top-card "Concierge" title. Default left. */
  titleAlign?: 'left' | 'center';
  /** CTA is visual only — the whole banner is the tap target. */
  cta: { label: string };
  /** lg = taller CTA with the full-size button label (community banner, H9). Default md. */
  ctaSize?: 'md' | 'lg';
  /** Per-usage title leading override (community banner uses a tighter value). */
  titleLineHeight?: number;
  onPress: () => void;
}

/** Dark solid CTA (Figma V3 banner button — #602A00, white label). Presentational. */
function BannerCta({
  label,
  fullWidth,
  size = 'md',
}: {
  label: string;
  fullWidth?: boolean;
  size?: 'md' | 'lg';
}) {
  const t = useTheme();
  const isLg = size === 'lg';
  return (
    <View
      style={[
        styles.cta,
        isLg && styles.ctaLg,
        fullWidth && styles.ctaFull,
        { backgroundColor: t.colors.rustDark, borderRadius: t.radii.button },
      ]}
    >
      <Text
        style={[
          isLg ? t.typography.bodySemibold : t.typography.captionSemi,
          { color: t.colors.white },
        ]}
      >
        {label}
      </Text>
    </View>
  );
}

/**
 * Rust promo banner with a photo — the Figma V3 "Banner". The ENTIRE surface
 * (incl. the dark CTA) is one physical-press tap target. `imageTop` stacks the
 * photo above the copy with a full-width button; `imageLeft` places the photo to
 * the left with the copy + a hug-width button on the right.
 */
export function Banner({
  title,
  subtitle,
  image,
  imageNode,
  layout,
  titleAlign = 'left',
  cta,
  ctaSize = 'md',
  titleLineHeight,
  onPress,
}: BannerProps) {
  const t = useTheme();
  const isTop = layout === 'imageTop';
  const isTitleRow = layout === 'titleRow';

  const titleNode = (
    <Text
      style={[
        t.typography.displayS,
        { color: t.colors.bg },
        titleAlign === 'center' && styles.titleCenter,
        titleLineHeight != null && { lineHeight: titleLineHeight },
      ]}
    >
      {title}
    </Text>
  );
  const subtitleNode = subtitle ? (
    <Text style={[t.typography.body, { color: t.colors.white }]}>{subtitle}</Text>
  ) : null;
  const imageSlot =
    imageNode ??
    (image ? (
      <Image
        source={image}
        resizeMode="cover"
        style={isTop ? styles.imageTop : styles.imageLeft}
      />
    ) : null);

  return (
    <PhysicalPressable
      onPress={onPress}
      accessibilityLabel={title}
      radius={t.radii.card}
      shadowColor={t.colors.rustDark}
      style={[
        isTop || isTitleRow ? styles.wrapTop : styles.wrapLeft,
        { backgroundColor: t.colors.rust, borderColor: t.colors.rustDark, borderRadius: t.radii.card },
      ]}
    >
      {isTop ? (
        // Figma 85:3127 (amendment A1): title → image → helper text → CTA.
        <>
          {titleNode}
          {imageSlot}
          {subtitleNode}
          <BannerCta label={cta.label} size={ctaSize} fullWidth />
        </>
      ) : isTitleRow ? (
        // SR3 grid: [logo | title] row → helper text → full-width CTA.
        <>
          <View style={styles.titleRow}>
            {imageSlot}
            <View style={styles.titleRowText}>{titleNode}</View>
          </View>
          {subtitleNode}
          <BannerCta label={cta.label} size={ctaSize} fullWidth />
        </>
      ) : (
        <>
          {imageSlot}
          <View style={styles.rightCol}>
            <View style={styles.copy}>
              {titleNode}
              {subtitleNode}
            </View>
            <BannerCta label={cta.label} size={ctaSize} />
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
  titleCenter: { textAlign: 'center', alignSelf: 'stretch' },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    alignSelf: 'stretch',
  },
  titleRowText: { flex: 1 },
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
  ctaLg: { height: 44, paddingHorizontal: 16 },
  ctaFull: { width: '100%', alignSelf: 'stretch' },
});
