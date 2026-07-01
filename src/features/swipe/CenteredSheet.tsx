import { type ReactNode, useEffect } from "react";
import {
  Modal,
  View,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
} from "react-native";
import {
  Gesture,
  GestureDetector,
  GestureHandlerRootView,
} from "react-native-gesture-handler";
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { useTheme } from "@/theme/ThemeProvider";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);
const DISMISS_DRAG = 110;
const SPRING = { damping: 18, stiffness: 190, mass: 0.8 } as const;

interface CenteredSheetProps {
  visible: boolean;
  onClose: () => void;
  children: ReactNode;
}

/**
 * A centered modal card that flies in (fade + scale) and dismisses via the grabber
 * swipe-down (downward-only, attached to the grabber alone so it never steals touches
 * from inputs/buttons), a backdrop tap, or the caller's own controls. Shared by the
 * lead-capture and filters sheets.
 */
export function CenteredSheet({ visible, onClose, children }: CenteredSheetProps) {
  const t = useTheme();
  const progress = useSharedValue(0);
  const dragY = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      dragY.value = 0;
      progress.value = withSpring(1, SPRING);
    } else {
      progress.value = 0;
      dragY.value = 0;
    }
  }, [visible, progress, dragY]);

  const swipeDown = Gesture.Pan()
    .activeOffsetY(8)
    .failOffsetX([-16, 16])
    .onUpdate((e) => {
      dragY.value = Math.max(0, e.translationY);
    })
    .onEnd((e) => {
      if (e.translationY > DISMISS_DRAG) runOnJS(onClose)();
      else dragY.value = withSpring(0, SPRING);
    });

  const cardStyle = useAnimatedStyle(() => ({
    opacity: progress.value,
    transform: [
      { translateY: dragY.value + (1 - progress.value) * 24 },
      { scale: 0.9 + 0.1 * progress.value },
    ],
  }));

  const backdropStyle = useAnimatedStyle(() => ({
    opacity: progress.value * 0.5,
  }));

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <GestureHandlerRootView style={styles.root}>
        <AnimatedPressable
          accessibilityLabel="Dismiss"
          onPress={onClose}
          style={[styles.backdrop, backdropStyle]}
        />
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={styles.centerWrap}
          pointerEvents="box-none"
        >
          <Animated.View
            style={[styles.card, { backgroundColor: t.colors.bg }, cardStyle]}
          >
            {/* Only the grabber is draggable — inputs/buttons keep their touches. */}
            <GestureDetector gesture={swipeDown}>
              <View style={styles.grabberZone}>
                <View
                  style={[
                    styles.grabber,
                    { backgroundColor: t.colors.inputBorder },
                  ]}
                />
              </View>
            </GestureDetector>
            {children}
          </Animated.View>
        </KeyboardAvoidingView>
      </GestureHandlerRootView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  backdrop: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "#000",
  },
  centerWrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
  },
  card: {
    width: "100%",
    maxWidth: 440,
    maxHeight: "88%",
    borderRadius: 24,
    overflow: "hidden",
  },
  grabberZone: { paddingTop: 12, paddingBottom: 8, alignItems: "center" },
  grabber: { width: 40, height: 4, borderRadius: 2 },
});
