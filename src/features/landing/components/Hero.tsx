import { View, Text, Image, StyleSheet } from 'react-native';
import { useTheme } from '@/theme/ThemeProvider';
import { brandLogo } from '@/theme/assets';

/** Brand badge + headline over the daisy background. */
export function Hero() {
  const t = useTheme();
  return (
    <View style={styles.wrap}>
      <Image
        source={brandLogo}
        style={styles.logo}
        resizeMode="contain"
        accessibilityLabel="The Southern Shmooze"
      />
      <Text style={[t.typography.display, styles.headline]}>
        Atlanta&apos;s Community for Finding Trusted Local Businesses
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', paddingHorizontal: 24, paddingTop: 16, paddingBottom: 40, gap: 16 },
  logo: { width: 200, height: 200 },
  headline: { textAlign: 'center', fontSize: 34, lineHeight: 38 },
});
