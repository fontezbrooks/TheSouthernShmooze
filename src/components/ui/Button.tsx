import { Pressable, Text, StyleSheet, type StyleProp, type ViewStyle } from 'react-native';
import { useTheme } from '@/theme/ThemeProvider';

export type ButtonVariant = 'primary' | 'secondary' | 'link';

interface ButtonProps {
  label: string;
  onPress?: () => void;
  variant?: ButtonVariant;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
}

/** Pill button matching the site: black primary, outlined secondary, blue link. */
export function Button({ label, onPress, variant = 'primary', disabled = false, style }: ButtonProps) {
  const t = useTheme();

  const palette: Record<ButtonVariant, { bg: string; fg: string; border?: string }> = {
    primary: { bg: t.colors.text, fg: t.colors.surface },
    secondary: { bg: t.colors.surface, fg: t.colors.text, border: t.colors.text },
    link: { bg: 'transparent', fg: t.colors.secondary },
  };
  const v = palette[variant];

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.base,
        {
          backgroundColor: v.bg,
          borderRadius: t.radii.pill,
          borderWidth: v.border ? 2 : 0,
          borderColor: v.border ?? 'transparent',
          opacity: disabled ? 0.5 : pressed ? 0.85 : 1,
        },
        style,
      ]}
    >
      <Text style={[t.typography.button, { color: v.fg }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    paddingVertical: 16,
    paddingHorizontal: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
