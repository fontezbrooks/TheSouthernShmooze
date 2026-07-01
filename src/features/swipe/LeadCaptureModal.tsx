import { useEffect, useState } from "react";
import {
  Modal,
  View,
  Text,
  Pressable,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
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
import { TextField } from "@/features/lead-form/fields/TextField";
import { BudgetSelect } from "@/features/lead-form/fields/BudgetSelect";
import { swipeRepository, type SwipeRepository } from "./swipeRepository";
import {
  prefillFromTask,
  swipeContactSchema,
  type SwipeContactValues,
} from "./contactSchema";
import type { SeekerContact, SwipeTask } from "./swipeTypes";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);
const DISMISS_DRAG = 110;
const SPRING = { damping: 18, stiffness: 190, mass: 0.8 } as const;

interface LeadCaptureModalProps {
  visible: boolean;
  sessionToken: string;
  task: SwipeTask | null;
  taskId: string | null;
  /** Remembered contact (name/email/phone) to prefill for a returning Seeker. */
  contact: SeekerContact | null;
  onClose: () => void;
  onSubmitted: (contact: SeekerContact) => void;
  repo?: SwipeRepository;
}

/**
 * First-Match gate (no account, no OTP): a Concierge-style form — trimmed to contact +
 * budget + details and prefilled from the Shmoozer onboarding — saved once per session,
 * after which further right-swipes send instantly. A centered card that flies in (fade +
 * scale) and dismisses via the grabber swipe-down, the backdrop, or Cancel.
 */
export function LeadCaptureModal({
  visible,
  sessionToken,
  task,
  taskId,
  contact,
  onClose,
  onSubmitted,
  repo = swipeRepository,
}: LeadCaptureModalProps) {
  const t = useTheme();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<SwipeContactValues>({
    resolver: zodResolver(swipeContactSchema),
    defaultValues: prefillFromTask(task, contact),
    mode: "onTouched",
  });

  const progress = useSharedValue(0);
  const dragY = useSharedValue(0);

  // Re-prefill + replay the entrance each time the sheet opens.
  useEffect(() => {
    if (visible) {
      form.reset(prefillFromTask(task, contact));
      setError(null);
      dragY.value = 0;
      progress.value = withSpring(1, SPRING);
    } else {
      progress.value = 0;
      dragY.value = 0;
    }
    // form is stable from RHF; task + contact drive the prefill.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible, task, contact]);

  const close = () => {
    setError(null);
    onClose();
  };

  const swipeDown = Gesture.Pan()
    // Downward-only, and attached to the grabber alone — never steals input/button touches.
    .activeOffsetY(8)
    .failOffsetX([-16, 16])
    .onUpdate((e) => {
      dragY.value = Math.max(0, e.translationY);
    })
    .onEnd((e) => {
      if (e.translationY > DISMISS_DRAG) runOnJS(close)();
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

  const submit = form.handleSubmit(async (values) => {
    const fullName =
      `${values.firstName.trim()} ${values.lastName.trim()}`.trim();
    setBusy(true);
    setError(null);
    const res = await repo.saveContact(sessionToken, taskId, {
      name: fullName,
      email: values.email.trim(),
      phone: values.phone.trim() || null,
      budget: values.budget ?? null,
      details: values.projectDetails.trim() || null,
    });
    setBusy(false);
    if (res.ok) {
      onSubmitted({
        name: fullName,
        email: values.email.trim(),
        phone: values.phone.trim() || null,
        verified: true,
      });
    } else {
      setError(res.error);
    }
  });

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

            <ScrollView
              contentContainerStyle={styles.formContent}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              <Text style={t.typography.displayXS}>Send your details</Text>
              <Text style={[t.typography.caption, { color: t.colors.muted }]}>
                We share these with the pros you match — filled in once, then
                it’s one tap.
              </Text>

              <TextField
                control={form.control}
                name="firstName"
                label="First Name"
                required
                autoComplete="name"
              />
              <TextField
                control={form.control}
                name="lastName"
                label="Last Name"
                required
                autoComplete="name"
              />
              <TextField
                control={form.control}
                name="email"
                label="Email"
                icon="mail"
                required
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
              />
              <TextField
                control={form.control}
                name="phone"
                label="Phone"
                icon="phoneFilled"
                required
                keyboardType="phone-pad"
                autoComplete="tel"
              />
              <BudgetSelect
                control={form.control}
                name="budget"
                label="Budget"
              />
              <TextField
                control={form.control}
                name="projectDetails"
                label="Project Details"
                placeholder="Tell them what you're looking for…"
                required
                multiline
              />

              {error ? (
                <Text style={[t.typography.caption, { color: t.colors.error }]}>
                  {error}
                </Text>
              ) : null}

              {busy ? (
                <ActivityIndicator color={t.colors.rust} />
              ) : (
                <Button label="Send match" variant="primary" onPress={submit} />
              )}
              <Button
                label="Cancel"
                variant="pill"
                tone="black"
                onPress={close}
              />
            </ScrollView>
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
  formContent: { paddingHorizontal: 20, paddingBottom: 24, gap: 14 },
});
