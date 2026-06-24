import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '@/theme/ThemeProvider';

/** "Welcome" heading + the service intro line. */
export function WelcomeIntro() {
  const t = useTheme();
  return (
    <View style={styles.wrap}>
      <Text style={[t.typography.h2, styles.center]}>Welcome to The Southern Shmooze</Text>
      <Text style={[t.typography.body, styles.center]}>
        Need a painter, plumber, roofer, contractor, landscaper, electrician, HVAC professional,
        cleaner or other trusted local professional?
      </Text>
      <Text style={[t.typography.body, styles.center]}>
        Choose the option that works best for you — all three are completely free for Atlanta
        homeowners.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 12, paddingHorizontal: 24, paddingTop: 8 },
  center: { textAlign: 'center' },
});
