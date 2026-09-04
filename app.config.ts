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
		posthogHost: process.env.EXPO_PUBLIC_POSTHOG_HOST ?? "",
		posthogKey: process.env.EXPO_PUBLIC_POSTHOG_KEY ?? "",
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
		/**
		 * Apple cross-reads this against the App Store Connect privacy label, so
		 * it must match `claudedocs/analytics/privacy-label.md`. Everything here
		 * is first-party: `NSPrivacyTracking` stays false because no advertising
		 * identifier is ever requested, which is what keeps the App Tracking
		 * Transparency prompt off the screen. Expo MERGES this with the API-type
		 * reasons its plugins generate, so those are not repeated here.
		 */
		privacyManifests: {
			/**
			 * Required-reason APIs. These were present in the generated project
			 * before this config existed, but a `prebuild --clean` starts from an
			 * empty manifest and the merge only preserves what it finds — so they
			 * are declared here rather than left to chance. Omitting them draws
			 * an ITMS-91053 notice on upload.
			 */
			NSPrivacyAccessedAPITypes: [
				{
					NSPrivacyAccessedAPIType: "NSPrivacyAccessedAPICategoryUserDefaults",
					NSPrivacyAccessedAPITypeReasons: ["CA92.1"],
				},
				{
					NSPrivacyAccessedAPIType: "NSPrivacyAccessedAPICategoryFileTimestamp",
					NSPrivacyAccessedAPITypeReasons: ["C617.1"],
				},
				{
					NSPrivacyAccessedAPIType:
						"NSPrivacyAccessedAPICategorySystemBootTime",
					NSPrivacyAccessedAPITypeReasons: ["35F9.1"],
				},
			],
			NSPrivacyCollectedDataTypes: [
				// Typed into the concierge, swipe-match, and contractor forms;
				// becomes the analytics identity after a submit (audience.ts).
				{
					NSPrivacyCollectedDataType: "NSPrivacyCollectedDataTypeEmailAddress",
					NSPrivacyCollectedDataTypeLinked: true,
					NSPrivacyCollectedDataTypePurposes: [
						"NSPrivacyCollectedDataTypePurposeAppFunctionality",
						"NSPrivacyCollectedDataTypePurposeAnalytics",
					],
					NSPrivacyCollectedDataTypeTracking: false,
				},
				{
					NSPrivacyCollectedDataType: "NSPrivacyCollectedDataTypeName",
					NSPrivacyCollectedDataTypeLinked: true,
					NSPrivacyCollectedDataTypePurposes: [
						"NSPrivacyCollectedDataTypePurposeAppFunctionality",
					],
					NSPrivacyCollectedDataTypeTracking: false,
				},
				{
					NSPrivacyCollectedDataType: "NSPrivacyCollectedDataTypePhoneNumber",
					NSPrivacyCollectedDataTypeLinked: true,
					NSPrivacyCollectedDataTypePurposes: [
						"NSPrivacyCollectedDataTypePurposeAppFunctionality",
					],
					NSPrivacyCollectedDataTypeTracking: false,
				},
				// The address of the Google listing a contractor applicant picks.
				{
					NSPrivacyCollectedDataType:
						"NSPrivacyCollectedDataTypePhysicalAddress",
					NSPrivacyCollectedDataTypeLinked: true,
					NSPrivacyCollectedDataTypePurposes: [
						"NSPrivacyCollectedDataTypePurposeAppFunctionality",
					],
					NSPrivacyCollectedDataTypeTracking: false,
				},
				// The user-typed ZIP. Never sensed — analytics only ever sees the
				// 3-digit prefix (zipPrefix() in src/lib/analytics/events.ts).
				{
					NSPrivacyCollectedDataType:
						"NSPrivacyCollectedDataTypeCoarseLocation",
					NSPrivacyCollectedDataTypeLinked: true,
					NSPrivacyCollectedDataTypePurposes: [
						"NSPrivacyCollectedDataTypePurposeAppFunctionality",
					],
					NSPrivacyCollectedDataTypeTracking: false,
				},
				{
					NSPrivacyCollectedDataType: "NSPrivacyCollectedDataTypeUserID",
					NSPrivacyCollectedDataTypeLinked: true,
					NSPrivacyCollectedDataTypePurposes: [
						"NSPrivacyCollectedDataTypePurposeAnalytics",
					],
					NSPrivacyCollectedDataTypeTracking: false,
				},
				// PostHog's installation id — not IDFA.
				{
					NSPrivacyCollectedDataType: "NSPrivacyCollectedDataTypeDeviceID",
					NSPrivacyCollectedDataTypeLinked: true,
					NSPrivacyCollectedDataTypePurposes: [
						"NSPrivacyCollectedDataTypePurposeAnalytics",
					],
					NSPrivacyCollectedDataTypeTracking: false,
				},
				// Free-form text the user writes: swipe project details and the
				// optional concierge job notes, both persisted with the lead.
				{
					NSPrivacyCollectedDataType:
						"NSPrivacyCollectedDataTypeOtherUserContent",
					NSPrivacyCollectedDataTypeLinked: true,
					NSPrivacyCollectedDataTypePurposes: [
						"NSPrivacyCollectedDataTypePurposeAppFunctionality",
					],
					NSPrivacyCollectedDataTypeTracking: false,
				},
				{
					NSPrivacyCollectedDataType:
						"NSPrivacyCollectedDataTypeProductInteraction",
					NSPrivacyCollectedDataTypeLinked: true,
					NSPrivacyCollectedDataTypePurposes: [
						"NSPrivacyCollectedDataTypePurposeAnalytics",
					],
					NSPrivacyCollectedDataTypeTracking: false,
				},
			],
			NSPrivacyTracking: false,
		},
		// iPhone-only for 1.0: the iPad layout has never been verified, and
		// tablet support would require its own screenshot set and review pass.
		supportsTablet: false,
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
				backgroundColor: "#FFFDF8",
				// Native launch screen — matches the in-app AnimatedSplash's first frame
				// (mascot on brand magnolia) so the OS splash → JS splash handoff is
				// seamless. splash.png = splash-logo.png composited over #FFFDF8.
				image: "./assets/splash.png",
				imageWidth: 220,
			},
		],
		"@react-native-community/datetimepicker",
		"expo-web-browser",
		"expo-localization",
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
