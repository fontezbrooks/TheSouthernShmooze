import { useEffect, useState } from "react";
import {
  Modal,
  View,
  Text,
  TextInput,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  ActivityIndicator,
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
import { Button } from "@/components/ui/Button";
import { swipeRepository, type SwipeRepository } from "./swipeRepository";
import type { SeekerContact } from "./swipeTypes";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);
/** Drag distance past which a downward swipe dismisses the sheet. */
const DISMISS_DRAG = 120;
const SPRING = { damping: 18, stiffness: 190, mass: 0.8 } as const;

interface ContactVerifyModalProps {
  visible: boolean;
  sessionToken: string;
  onClose: () => void;
  onVerified: (contact: SeekerContact) => void;
  repo?: SwipeRepository;
}

/**
 * First-swipe gate (no account): capture name + email, email an OTP, confirm it. Only on
 * success does a lead get sent. A centered card that flies in (fade + scale) and can be
 * dismissed by swiping down, tapping the backdrop, or Cancel.
 */
export function ContactVerifyModal({
  visible,
  sessionToken,
  onClose,
  onVerified,
  repo = swipeRepository,
}: ContactVerifyModalProps) {
  const t = useTheme();
  const [step, setStep] = useState<"capture" | "code">("capture");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 0 → 1 entrance progress; dragY tracks a downward dismiss drag.
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

  const reset = () => {
    setStep("capture");
    setCode("");
    setError(null);
    setBusy(false);
  };

  const close = () => {
    reset();
    onClose();
  };

  const swipeDown = Gesture.Pan()
    .onUpdate((e) => {
      dragY.value = Math.max(0, e.translationY);
    })
    .onEnd((e) => {
      if (e.translationY > DISMISS_DRAG) {
        runOnJS(close)();
      } else {
        dragY.value = withSpring(0, SPRING);
      }
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

  const sendCode = async () => {
    setBusy(true);
    setError(null);
    const res = await repo.requestVerification(sessionToken, {
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim() || null,
    });
    setBusy(false);
    if (res.ok) setStep("code");
    else setError(res.error);
  };

  const verify = async () => {
    setBusy(true);
    setError(null);
    const res = await repo.confirmVerification(sessionToken, code.trim());
    setBusy(false);
    if (res.ok) {
      onVerified({
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim() || null,
        verified: true,
      });
      reset();
    } else {
      setError(res.error);
    }
  };

  const input = (
    value: string,
    onChangeText: (v: string) => void,
    placeholder: string,
    extra?: object,
  ) => (
    <TextInput
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      placeholderTextColor={t.colors.muted}
      style={[
        styles.input,
        t.typography.body,
        {
          borderColor: t.colors.inputBorder,
          borderRadius: t.radii.input,
          backgroundColor: t.colors.surface,
        },
      ]}
      {...extra}
    />
  );

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      statusBarTranslucent
      onRequestClose={close}
    >
      <GestureHandlerRootView style={styles.root}>
        <AnimatedPressable
          accessibilityLabel="Dismiss"
          onPress={close}
          style={[styles.backdrop, backdropStyle]}
        />
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={styles.centerWrap}
          pointerEvents="box-none"
        >
          <GestureDetector gesture={swipeDown}>
            <Animated.View
              style={[styles.card, { backgroundColor: t.colors.bg }, cardStyle]}
            >
              <View
                style={[
                  styles.grabber,
                  { backgroundColor: t.colors.inputBorder },
                ]}
              />
              <Text style={t.typography.displayXS}>
                {step === "capture"
                  ? "Confirm your contact"
                  : "Enter your code"}
              </Text>
              <Text style={[t.typography.caption, { color: t.colors.muted }]}>
                {step === "capture"
                  ? "We verify your email once so providers reach a real person."
                  : `We emailed a 6-digit code to ${email.trim()}.`}
              </Text>

              {step === "capture" ? (
                <>
                  {input(name, setName, "Your name")}
                  {input(email, setEmail, "Email", {
                    autoCapitalize: "none",
                    keyboardType: "email-address",
                  })}
                  {input(phone, setPhone, "Phone (optional)", {
                    keyboardType: "phone-pad",
                  })}
                </>
              ) : (
                input(code, setCode, "6-digit code", {
                  keyboardType: "number-pad",
                  maxLength: 6,
                })
              )}

              {error ? (
                <Text style={[t.typography.caption, { color: t.colors.error }]}>
                  {error}
                </Text>
              ) : null}

              {busy ? (
                <ActivityIndicator color={t.colors.rust} />
              ) : step === "capture" ? (
                <Button
                  label="Send code"
                  variant="primary"
                  disabled={!name.trim() || !email.trim()}
                  onPress={sendCode}
                />
              ) : (
                <Button
                  label="Verify"
                  variant="primary"
                  disabled={code.trim().length < 6}
                  onPress={verify}
                />
              )}

              <Button
                label="Cancel"
                variant="pill"
                tone="black"
                onPress={close}
              />
            </Animated.View>
          </GestureDetector>
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
    padding: 20,
  },
  card: {
    width: "100%",
    maxWidth: 420,
    padding: 20,
    gap: 12,
    borderRadius: 24,
  },
  grabber: {
    alignSelf: "center",
    width: 40,
    height: 4,
    borderRadius: 2,
    marginBottom: 4,
  },
  input: { borderWidth: 1, paddingHorizontal: 12, height: 48 },
});
