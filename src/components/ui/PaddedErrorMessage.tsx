import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '@/theme/ThemeProvider';
import { Icon } from './Icon';

interface PaddedErrorMessageProps {
  message: string;
}

/**
 * Field error message in a padded cream box (Figma V3 32:4684) — gives the
 * warning + text breathing room beneath the input for readability. Red
 * triangle icon + black caption text on a Vanilla background.
 */
export function PaddedErrorMessage({ message }: PaddedErrorMessageProps) {
  const t = useTheme();
  return (
    <View
      accessibilityLiveRegion="polite"
      style={[styles.box, { backgroundColor: t.colors.bg, borderRadius: t.radii.input }]}
    >
      <Icon name="triangleWarning" size={12} color={t.colors.error} />
      <Text style={[t.typography.caption, { color: t.colors.black }]}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
});
