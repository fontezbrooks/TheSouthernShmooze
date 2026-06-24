import { ScrollView, ImageBackground, View, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useTheme } from '@/theme/ThemeProvider';
import { daisyBackground } from '@/theme/assets';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { WavyDivider } from './components/WavyDivider';
import { WelcomeIntro } from './components/WelcomeIntro';
import { InfoCardRow } from './components/InfoCardRow';
import { LeadFormSection } from './components/LeadFormSection';
import { Footer } from './components/Footer';

/** Full landing screen — a 1:1 replica of the shmoozeatl.com home page. */
export function LandingScreen() {
  const t = useTheme();
  return (
    <SafeAreaView edges={['top']} style={[styles.flex, { backgroundColor: t.colors.bg }]}>
      <StatusBar style="dark" />
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={styles.scroll}>
          {/*
            Hero block. The daisy ImageBackground is the slot the Phase 4 Skia
            generative overlay composites into (above the image, below content).
          */}
          <ImageBackground source={daisyBackground} resizeMode="repeat" style={styles.hero}>
            <Header />
            <Hero />
          </ImageBackground>

          <WavyDivider color={t.colors.surface} />

          <View style={[styles.content, { backgroundColor: t.colors.surface }]}>
            <WelcomeIntro />
            <InfoCardRow />
            <LeadFormSection />
          </View>

          <Footer />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  scroll: { paddingBottom: 24 },
  hero: { paddingBottom: 8 },
  content: { paddingTop: 8, paddingBottom: 32, gap: 28 },
});
