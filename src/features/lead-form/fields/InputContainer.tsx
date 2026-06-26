import { type ReactNode } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '@/theme/ThemeProvider';
import { Icon, type IconName } from '@/components/ui/Icon';

interface InputContainerProps {
  /** Persistent inside-label (Figma "Label Inside") — always visible, incl. while typing. */
  label: string;
  /** Leading icon, sits on the value row beside the input text. */
  icon?: IconName;
  /** Trailing node (e.g. chevron for selects), vertically centered. */
  trailing?: ReactNode;
  /** Focused (text input focused / picker open) → 2px black border. */
  focused?: boolean;
  /** Error message → 2px red border + bottom message row. */
  error?: string;
  /** Disabled → muted + non-interactive look. */
  disabled?: boolean;
  /** Renders a right-aligned "Optional" hint row above the box. */
  optional?: boolean;
  /** Vertical alignment — 'top' for multiline. */
  align?: 'center' | 'top';
  minHeight?: number;
  children: ReactNode;
}

/**
 * The Figma "Label Inside" input shell (component set 8:5814). Drives the full
 * field state machine: a persistent inside-label, focus (2px black border),
 * error (2px red border + warning-triangle message), disabled, and an optional
 * "Optional" hint row. The leading icon and value share the row below the label.
 */
export function InputContainer({
  label,
  icon,
  trailing,
  focused = false,
  error,
  disabled = false,
  optional = false,
  align = 'center',
  minHeight = 58,
  children,
}: InputContainerProps) {
  const t = useTheme();

  // Border resolution (priority): error → focused → default.
  const border = error
    ? { borderWidth: 2, borderColor: t.colors.error }
    : focused
      ? { borderWidth: 2, borderColor: t.colors.black }
      : { borderWidth: 1, borderColor: t.colors.inputBorder };

  return (
    <View style={styles.wrap}>
      {optional ? (
        <View style={styles.optionalRow}>
          <Text style={[t.typography.caption, { color: t.colors.muted }]}>Optional</Text>
        </View>
      ) : null}

      <View
        style={[
          styles.box,
          border,
          {
            minHeight,
            backgroundColor: t.colors.surface,
            borderRadius: t.radii.input,
            alignItems: align === 'top' ? 'flex-start' : 'center',
            opacity: disabled ? 0.5 : 1,
          },
        ]}
      >
        <View style={styles.leftContent}>
          <Text style={[t.typography.captionSemi, { color: t.colors.muted }]} numberOfLines={1}>
            {label}
          </Text>
          <View style={[styles.valueRow, align === 'top' && styles.valueRowTop]}>
            {icon ? <Icon name={icon} size={18} color={t.colors.muted} /> : null}
            <View style={styles.content}>{children}</View>
          </View>
        </View>
        {trailing}
      </View>

      {error ? (
        <View style={styles.errorRow} accessibilityLiveRegion="polite">
          <Icon name="triangleWarning" size={12} color={t.colors.error} />
          <Text style={[t.typography.caption, { color: t.colors.black }]}>{error}</Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 4, width: '100%' },
  optionalRow: { width: '100%', flexDirection: 'row', justifyContent: 'flex-end' },
  box: {
    flexDirection: 'row',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  leftContent: { flex: 1, justifyContent: 'center', gap: 2 },
  valueRow: { flexDirection: 'row', alignItems: 'center', gap: 6, width: '100%' },
  valueRowTop: { alignItems: 'flex-start' },
  content: { flex: 1, justifyContent: 'center' },
  errorRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
});
