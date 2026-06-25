// Must be the first import — sets up gesture-handler's native bindings.
import "react-native-gesture-handler";
import { useEffect } from "react";
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
import { OpenSans_600SemiBold } from "@expo-google-fonts/open-sans";
import { ThemeProvider } from "@/theme/ThemeProvider";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    Shrikhand_400Regular,
    Bitter_400Regular,
    Bitter_600SemiBold,
    Bitter_800ExtraBold,
    OpenSans_600SemiBold,
  });

  useEffect(() => {
    if (loaded || error) {
      void SplashScreen.hideAsync();
    }
  }, [loaded, error]);

  // Gate render until fonts resolve (or fail) so headings never flash a fallback face.
  if (!loaded && !error) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <ThemeProvider>
          <Stack screenOptions={{ headerShown: false }} />
        </ThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
