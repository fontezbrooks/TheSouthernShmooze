import type { ExpoConfig, ConfigContext } from "expo/config";

/**
 * Expo app configuration.
 *
 * Supabase credentials are read from the environment and exposed via `extra`.
 * They are the public anon URL/key (insert-only RLS), safe to ship in the client,
 * but kept out of source via `.env` (see `.env.example`). Presence is validated at
 * runtime in `src/lib/supabase.ts`.
 */
export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: "The Southern Shmooze",
  owner: "carlhiggins",
  slug: "thesouthernshmooze",
  scheme: "shmooze",
  version: "1.0.0",
  orientation: "portrait",
  userInterfaceStyle: "light",
  ios: {
    supportsTablet: true,
    bundleIdentifier: "com.thesouthernshmooze.app",
    infoPlist: {
      ITSAppUsesNonExemptEncryption: false,
    },
  },
  android: {
    package: "com.thesouthernshmooze.app",
  },
  web: {
    bundler: "metro",
    output: "static",
  },
  plugins: [
    "expo-router",
    "expo-font",
    [
      "expo-splash-screen",
      {
        // Native launch screen — matches the in-app AnimatedSplash's first frame
        // (mascot on Vanilla cream) so the OS splash → JS splash handoff is seamless.
        image: "./assets/splash.png",
        backgroundColor: "#FFF8EA",
        imageWidth: 220,
      },
    ],
    "@react-native-community/datetimepicker",
    "expo-web-browser",
  ],
  experiments: {
    typedRoutes: true,
  },
  extra: {
    supabaseUrl:
      process.env.EXPO_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL ?? "",
    supabaseAnonKey:
      process.env.EXPO_PUBLIC_SUPABASE_KEY ??
      process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ??
      process.env.SUPABASE_ANON_KEY ??
      "",
    eas: {
      projectId: "d0d1c671-c2a2-4691-8e6f-943b06100833",
    },
  },
});
