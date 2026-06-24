import { View, StyleSheet, type ViewProps } from 'react-native';
import { useTheme } from '@/theme/ThemeProvider';

/** White surface card with token radius + hairline border. */
export function Card({ style, ...rest }: ViewProps) {
  const t = useTheme();
  return (
    <View
      style={[
        styles.base,
        { backgroundColor: t.colors.surface, borderRadius: t.radii.card, borderColor: t.colors.line },
        style,
      ]}
      {...rest}
    />
  );
}

const styles = StyleSheet.create({
  base: {
    padding: 16,
    borderWidth: 1,
    gap: 6,
  },
});
