import { StyleSheet, Text } from "react-native";
import type { SharedValue } from "react-native-reanimated";
import Animated, {
	Extrapolation,
	interpolate,
	useAnimatedStyle,
} from "react-native-reanimated";
import { useTheme } from "@/theme/ThemeProvider";

/**
 * MATCH/PASS cues that fade in with the drag. `progress` is the deck engine's
 * drag position as a fraction of the swipe threshold (0 centered, ±1 at the
 * commit point) — full opacity exactly where the swipe would commit.
 */
export function SwipeStamps({ progress }: { progress: SharedValue<number> }) {
	const t = useTheme();

	const matchCue = useAnimatedStyle(() => ({
		opacity: interpolate(progress.value, [0, 1], [0, 1], Extrapolation.CLAMP),
	}));

	const passCue = useAnimatedStyle(() => ({
		opacity: interpolate(progress.value, [-1, 0], [1, 0], Extrapolation.CLAMP),
	}));

	return (
		<>
			<Animated.View
				pointerEvents="none"
				style={[
					styles.stamp,
					styles.stampRight,
					{ borderColor: t.brand.colors.clay },
					matchCue,
				]}
			>
				<Text style={[styles.stampText, { color: t.brand.colors.clay }]}>
					MATCH
				</Text>
			</Animated.View>
			<Animated.View
				pointerEvents="none"
				style={[
					styles.stamp,
					styles.stampLeft,
					{ borderColor: t.brand.colors.text },
					passCue,
				]}
			>
				<Text style={[styles.stampText, { color: t.brand.colors.text }]}>
					PASS
				</Text>
			</Animated.View>
		</>
	);
}

const styles = StyleSheet.create({
	stamp: {
		backgroundColor: "rgba(255,255,255,0.85)",
		borderRadius: 8,
		borderWidth: 4,
		paddingHorizontal: 12,
		paddingVertical: 6,
		position: "absolute",
		top: 24,
	},
	stampLeft: { left: 20, transform: [{ rotate: "-12deg" }] },
	stampRight: { right: 20, transform: [{ rotate: "12deg" }] },
	stampText: {
		fontFamily: "PublicSans_700Bold",
		fontSize: 28,
		letterSpacing: 1,
	},
});
