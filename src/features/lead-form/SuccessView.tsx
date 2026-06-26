import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '@/theme/ThemeProvider';
import { Button } from '@/components/ui/Button';

interface SuccessViewProps {
  onBackHome: () => void;
  onSubmitAnother: () => void;
}

/**
 * Concierge form confirmation (Figma V3 32:5304) — a white card thank-you
 * message followed by "Back Home" (primary) and "Submit Another Request" (wide).
 */
export function SuccessView({ onBackHome, onSubmitAnother }: SuccessViewProps) {
  const t = useTheme();
  return (
    <View style={styles.wrap} accessibilityLiveRegion="polite">
      <View
        style={[
          styles.card,
          { backgroundColor: t.colors.surface, borderColor: t.colors.rustDark, borderRadius: t.radii.card },
          t.shadow.hard,
        ]}
      >
        <Text style={[t.typography.displayS, { color: t.colors.text }]}>Thanks for reaching out!</Text>
        <Text style={t.typography.body}>
          We&apos;ll get back to you soon with a personalized recommendation based on your needs.
        </Text>
      </View>
      <Button label="Back Home" variant="primary" tone="rust" onPress={onBackHome} />
      <Button label="Submit Another Request" variant="wide" onPress={onSubmitAnother} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 16 },
  card: {
    borderWidth: 2,
    padding: 24,
    gap: 16,
    alignItems: 'flex-start',
  },
});
