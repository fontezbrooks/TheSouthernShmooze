import * as SplashScreen from "expo-splash-screen";
import { useCallback } from "react";
import { Image, StyleSheet, useWindowDimensions } from "react-native";
import Animated, {
	runOnJS,
	useAnimatedStyle,
	useSharedValue,
	withDelay,
	withSequence,
	withTiming,
} from "react-native-reanimated";
import { daisyBackground, splashLogo } from "@/theme/assets";
import { useTheme } from "@/theme/ThemeProvider";
// Lives under src/ (not assets/) so the EAS uploader bundles it — see the
// nav icons note in app/(tabs)/_layout.tsx.
import AdsLogo from "./ads-logo.svg";

interface AnimatedSplashProps {
	/** Called once the splash has played and faded out. */
	onFinish: () => void;
}

/**
 * In-app animated splash. Its FIRST painted frame — mascot centered on Vanilla
 * cream — is identical to the native launch screen (`assets/splash.png` via the
 * expo-splash-screen config), so the OS-splash → JS-splash handoff is seamless
 * (no white flash / placeholder). From that matched frame it blooms the daisy
 * pattern in behind the mascot, gives the mascot a subtle pop, then fades out to
 * reveal the app.
 *
 * The native splash is hidden on this component's first layout (not on font load)
 * so the JS splash is guaranteed to be painted before the native one disappears.
 */
export function AnimatedSplash({ onFinish }: AnimatedSplashProps) {
	const t = useTheme();
	const { width, height } = useWindowDimensions();

	// Initial values ARE the matched first frame: daisy hidden, mascot at rest.
	const daisyOpacity = useSharedValue(0);
	const daisyScale = useSharedValue(1.15);
	const logoScale = useSharedValue(1);
	const containerOpacity = useSharedValue(1);

	const startAnimation = useCallback(() => {
		// Daisy pattern blooms in behind the mascot.
		daisyOpacity.value = withDelay(120, withTiming(1, { duration: 520 }));
		daisyScale.value = withDelay(120, withTiming(1, { duration: 650 }));

		// Mascot gives a gentle pop, then settles.
		logoScale.value = withSequence(
			withTiming(1.05, { duration: 320 }),
			withTiming(1, { duration: 300 })
		);

		// Hold, then fade the whole overlay out and hand off to the app.
		containerOpacity.value = withDelay(
			980,
			withTiming(0, { duration: 320 }, (finished) => {
				if (finished) {
					runOnJS(onFinish)();
				}
			})
		);
	}, [containerOpacity, daisyOpacity, daisyScale, logoScale]);

	// Hide the native splash once we've painted, then start the timeline.
	const onLayout = useCallback(() => {
		void SplashScreen.hideAsync();
		startAnimation();
	}, [startAnimation]);

	const containerStyle = useAnimatedStyle(() => ({
		opacity: containerOpacity.value,
	}));
	const daisyStyle = useAnimatedStyle(() => ({
		opacity: daisyOpacity.value,
		transform: [{ scale: daisyScale.value }],
	}));
	const logoStyle = useAnimatedStyle(() => ({
		transform: [{ scale: logoScale.value }],
	}));
	// Opacity only — reusing daisyStyle would also apply its 1.15→1 zoom.
	const adsStyle = useAnimatedStyle(() => ({ opacity: daisyOpacity.value }));

	const logoSize = Math.min(width * 0.6, 240);

	return (
		<Animated.View
			onLayout={onLayout}
			pointerEvents="none"
			style={[
				StyleSheet.absoluteFill,
				styles.container,
				{ backgroundColor: t.colors.bg },
				containerStyle,
			]}
		>
			<Animated.Image
				resizeMode="cover"
				source={daisyBackground}
				style={[StyleSheet.absoluteFill, { height, width }, daisyStyle]}
			/>
			<Animated.View style={[styles.logoWrap, logoStyle]}>
				<Image
					resizeMode="contain"
					source={splashLogo}
					style={{ height: logoSize, width: logoSize }}
				/>
			</Animated.View>
			{/* App Daddy credit — white-fill SVG, so it sits on a dark rust pill for
          legibility over the cream/daisy background. Fades in with the daisy
          bloom, and is ABSOLUTE-positioned below the mascot: in the flex flow
          its (transparent) footprint would push the mascot ~38pt above the
          native splash position on the first frame (review: PR #37). */}
			<Animated.View
				style={[
					styles.adsWrap,
					{
						backgroundColor: t.colors.rustDark,
						borderRadius: t.brand.radii.pill,
						top: height / 2 + logoSize / 2 + 20,
					},
					adsStyle,
				]}
			>
				<AdsLogo height={40} width={128} />
			</Animated.View>
		</Animated.View>
	);
}

const styles = StyleSheet.create({
	adsWrap: {
		alignItems: "center",
		alignSelf: "center",
		justifyContent: "center",
		paddingHorizontal: 16,
		paddingVertical: 8,
		position: "absolute",
	},
	container: {
		alignItems: "center",
		justifyContent: "center",
		zIndex: 100,
	},
	logoWrap: {
		alignItems: "center",
		justifyContent: "center",
	},
});
