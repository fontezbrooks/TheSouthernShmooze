import { Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useTheme } from '@/theme/ThemeProvider';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

/**
 * Phase 0 sandbox screen — verifies fonts, tokens, and UI primitives render (Checkpoint C0).
 * Replaced by the real LandingScreen in Phase 3.
 */
export default function Index() {
  const t = useTheme();
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: t.colors.bg }}>
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={t.typography.display}>The Southern Shmooze</Text>
        <Text style={t.typography.body}>Phase 0 — design system online.</Text>

        <Card>
          <Text style={t.typography.bodyBold}>Card primitive</Text>
          <Text style={t.typography.body}>White surface, token radius + hairline.</Text>
        </Card>

        <Button label="Submit" variant="primary" />
        <Button label="Browse Directory" variant="secondary" />
        <Button label="Learn more" variant="link" />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: 24,
    gap: 16,
  },
});
