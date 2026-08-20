import type { ConfigContext, ExpoConfig } from "expo/config";

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
	android: {
		package: "com.thesouthernshmooze.app",
	},
	experiments: {
		typedRoutes: true,
	},
	extra: {
		eas: {
			projectId: "d0d1c671-c2a2-4691-8e6f-943b06100833",
		},
		supabaseAnonKey:
			process.env.EXPO_PUBLIC_SUPABASE_KEY ??
			process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ??
			process.env.SUPABASE_ANON_KEY ??
			"",
		supabaseUrl:
			process.env.EXPO_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL ?? "",
	},
	icon: "./assets/icon.png",
	ios: {
		bundleIdentifier: "com.thesouthernshmooze.app",
		infoPlist: {
			ITSAppUsesNonExemptEncryption: false,
		},
		supportsTablet: true,
	},
	name: "The Southern Shmooze",
	orientation: "portrait",
	owner: "carlhiggins",
	plugins: [
		"expo-router",
		"expo-font",
		[
			"expo-splash-screen",
			{
				backgroundColor: "#FFF8EA",
				// Native launch screen — matches the in-app AnimatedSplash's first frame
				// (mascot on Vanilla cream) so the OS splash → JS splash handoff is seamless.
				image: "./assets/splash.png",
				imageWidth: 220,
			},
		],
		"@react-native-community/datetimepicker",
		"expo-web-browser",
	],
	scheme: "shmooze",
	slug: "thesouthernshmooze",
	userInterfaceStyle: "light",
	version: "1.0.0",
	web: {
		bundler: "metro",
		output: "static",
	},
});
