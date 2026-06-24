import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '@/theme/ThemeProvider';
import { LeadForm } from '@/features/lead-form/LeadForm';

/** Section heading + the lead form. */
export function LeadFormSection() {
  const t = useTheme();
  return (
    <View style={styles.wrap}>
      <Text style={[t.typography.display, styles.heading]}>Let&apos;s Plan Something Awesome</Text>
      <LeadForm />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { paddingHorizontal: 24, paddingTop: 16, gap: 20 },
  heading: { textAlign: 'center', fontSize: 32, lineHeight: 36 },
});
