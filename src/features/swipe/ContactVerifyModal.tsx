import { useState } from "react";
import {
  Modal,
  View,
  Text,
  TextInput,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { useTheme } from "@/theme/ThemeProvider";
import { Button } from "@/components/ui/Button";
import { swipeRepository, type SwipeRepository } from "./swipeRepository";
import type { SeekerContact } from "./swipeTypes";

interface ContactVerifyModalProps {
  visible: boolean;
  sessionToken: string;
  onClose: () => void;
  onVerified: (contact: SeekerContact) => void;
  repo?: SwipeRepository;
}

/**
 * First-swipe gate (no account): capture name + email, email an OTP, confirm it. Only on
 * success does a lead get sent. Resolves with the verified contact for the session.
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
    <Modal visible={visible} transparent animationType="slide" onRequestClose={close}>
      <View style={styles.backdrop}>
        <View style={[styles.sheet, { backgroundColor: t.colors.bg }]}>
          <Text style={t.typography.displayXS}>
            {step === "capture" ? "Confirm your contact" : "Enter your code"}
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

          <Button label="Cancel" variant="pill" tone="black" onPress={close} />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  sheet: {
    padding: 20,
    gap: 12,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  input: { borderWidth: 1, paddingHorizontal: 12, height: 48 },
});
