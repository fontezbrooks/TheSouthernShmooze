import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '@/theme/ThemeProvider';
import { Icon, type IconName } from './Icon';

interface ChipProps {
  icon: IconName;
  /** When set → padded labeled pill (e.g. "Certified"). When omitted → 24×24 icon-only pill. */
  label?: string;
  iconColor?: string;
  iconSize?: number;
}

/**
 * Cream rounded chip on the provider card. Labeled form ("Certified") shows a
 * 12px icon + 10px rust label; icon-only form (reviews/discount) is a 24×24 pill
 * with a 16px glyph. Presentational only.
 */
export function Chip({ icon, label, iconColor, iconSize }: ChipProps) {
  const t = useTheme();
  const labeled = label !== undefined;

  return (
    <View style={[styles.base, labeled ? styles.labeled : styles.iconOnly, { backgroundColor: t.colors.bg }]}>
      <Icon name={icon} size={iconSize ?? (labeled ? 12 : 16)} color={iconColor} />
      {labeled ? (
        <Text style={[t.typography.captionSemiXS, { color: t.colors.rust }]}>{label}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 9999,
  },
  labeled: { height: 24, paddingHorizontal: 6, paddingVertical: 4, gap: 2 },
  iconOnly: { width: 24, height: 24, padding: 4 },
});
