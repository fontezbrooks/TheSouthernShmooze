import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useTheme } from '@/theme/ThemeProvider';
import { Card } from '@/components/ui/Card';
import { openLink } from '@/lib/openLink';
import { LINKS } from '../links';

interface InfoCardData {
  step: string;
  title: string;
  body: string;
  url?: string;
}

const CARDS: InfoCardData[] = [
  {
    step: '1',
    title: 'Ask the Community!',
    body: 'Post your project in our Facebook group and get recommendations from neighbors.',
    url: LINKS.facebook,
  },
  {
    step: '2',
    title: 'Browse the Directory',
    body: 'Search vetted local businesses across Atlanta by category.',
    url: LINKS.directory,
  },
  {
    step: '3',
    title: 'Let Us Help!',
    body: 'Fill out the contact form below and we’ll match you with a trusted pro.',
  },
];

/** Three "ways to get help" cards (stacked on phones). */
export function InfoCardRow() {
  const t = useTheme();
  return (
    <View style={styles.wrap}>
      {CARDS.map((c) => {
        const inner = (
          <Card style={styles.card}>
            <Text style={[t.typography.label, { color: t.colors.accent }]}>{c.step})</Text>
            <Text style={t.typography.bodyBold}>{c.title}</Text>
            <Text style={t.typography.body}>{c.body}</Text>
          </Card>
        );
        return c.url ? (
          <Pressable key={c.step} onPress={() => openLink(c.url!)} accessibilityRole="button">
            {inner}
          </Pressable>
        ) : (
          <View key={c.step}>{inner}</View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 14, paddingHorizontal: 24 },
  card: { gap: 6 },
});
