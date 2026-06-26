import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '@/theme/ThemeProvider';
import { Icon, type IconName } from './Icon';
import type { ButtonTone } from './Button';

interface PillProps {
  label: string;
  tone?: ButtonTone;
  icon?: IconName;
  iconPosition?: 'leading' | 'trailing';
}

/**
 * Presentational "Button S" pill (cream fill, 32h, border + hard shadow per
 * `tone`) WITHOUT a touch handler. Used inside `Banner`, where the whole banner
 * surface is the single tap target — a nested Pressable would double-fire.
 */
export function Pill({ label, tone = 'rust', icon, iconPosition = 'trailing' }: PillProps) {
  const t = useTheme();
  const toneColor = tone === 'rust' ? t.colors.rust : tone === 'black' ? t.colors.black : t.colors.text;
  const bordered = tone !== 'none';
  const borderColor = tone === 'black' ? t.colors.black : t.colors.rustDark;
  const shadowStyle = tone === 'black' ? t.shadow.hardBlack : t.shadow.hard;
  const iconNode = icon ? <Icon name={icon} size={12} color={toneColor} /> : null;

  return (
    <View
      style={[
        styles.pill,
        {
          backgroundColor: t.colors.bg,
          borderRadius: t.radii.button,
          borderWidth: bordered ? 2 : 0,
          borderColor: bordered ? borderColor : 'transparent',
        },
        bordered && shadowStyle,
      ]}
    >
      {icon && iconPosition === 'leading' ? iconNode : null}
      <Text style={[t.typography.captionSemi, { color: toneColor }]}>{label}</Text>
      {icon && iconPosition === 'trailing' ? iconNode : null}
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    height: 32,
    paddingHorizontal: 12,
    alignSelf: 'flex-start',
  },
});
