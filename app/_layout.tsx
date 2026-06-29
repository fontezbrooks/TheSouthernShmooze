// Must be the first import — sets up gesture-handler's native bindings.
import "react-native-gesture-handler";
import { useState } from "react";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { useFonts, Shrikhand_400Regular } from "@expo-google-fonts/shrikhand";
import {
  Bitter_400Regular,
  Bitter_600SemiBold,
  Bitter_800ExtraBold,
} from "@expo-google-fonts/bitter";
import { ThemeProvider } from "@/theme/ThemeProvider";
import { AnimatedSplash } from "@/features/splash/AnimatedSplash";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [splashDone, setSplashDone] = useState(false);
  const [loaded, error] = useFonts({
    Shrikhand_400Regular,
    Bitter_400Regular,
    Bitter_600SemiBold,
    Bitter_800ExtraBold,
  });

  // Gate render until fonts resolve (or fail) so headings never flash a fallback
  // face. The native splash stays up here (preventAutoHideAsync) and is hidden by
  // AnimatedSplash on its first layout, so there is no white gap between them.
  if (!loaded && !error) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <ThemeProvider>
          <Stack screenOptions={{ headerShown: false }} />
          {/* Animated splash overlays the app from first frame, then fades out. */}
          {!splashDone ? (
            <AnimatedSplash onFinish={() => setSplashDone(true)} />
          ) : null}
        </ThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
