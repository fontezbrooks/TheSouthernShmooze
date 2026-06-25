import { type ReactNode } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '@/theme/ThemeProvider';
import { Icon, type IconName } from '@/components/ui/Icon';

interface InputContainerProps {
  /** Leading icon (Figma input icon). */
  icon?: IconName;
  /** Trailing node (e.g. chevron for selects). */
  trailing?: ReactNode;
  error?: string;
  /** Vertical alignment — 'top' for multiline/labelled inputs. */
  align?: 'center' | 'top';
  minHeight?: number;
  children: ReactNode;
}

/**
 * The Figma "label-inside" input shell: white surface, neutral border (rust on
 * error), 4px radius, 58px min height, leading icon, optional trailing node,
 * with the inline error message rendered below.
 */
export function InputContainer({
  icon,
  trailing,
  error,
  align = 'center',
  minHeight = 58,
  children,
}: InputContainerProps) {
  const t = useTheme();
  return (
    <View style={styles.wrap}>
      <View
        style={[
          styles.box,
          {
            minHeight,
            backgroundColor: t.colors.surface,
            borderRadius: t.radii.input,
            borderColor: error ? t.colors.rust : t.colors.inputBorder,
            alignItems: align === 'top' ? 'flex-start' : 'center',
          },
        ]}
      >
        {icon ? <Icon name={icon} size={18} color={t.colors.muted} /> : null}
        <View style={styles.content}>{children}</View>
        {trailing}
      </View>
      {error ? (
        <Text accessibilityLiveRegion="polite" style={[t.typography.caption, { color: t.colors.rust }]}>
          {error}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 4, width: '100%' },
  box: {
    flexDirection: 'row',
    gap: 6,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  content: { flex: 1, justifyContent: 'center' },
});
