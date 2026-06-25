import { useState } from "react";
import {
  Pressable,
  Text,
  View,
  Modal,
  Platform,
  StyleSheet,
} from "react-native";
import DateTimePicker, {
  type DateTimePickerChangeEvent,
} from "@react-native-community/datetimepicker";
import { Controller, type Control } from "react-hook-form";
import { useTheme } from "@/theme/ThemeProvider";
import { Button } from "@/components/ui/Button";
import type { LeadFormValues } from "../leadSchema";
import { InputContainer } from "./InputContainer";

interface DateFieldProps {
  control: Control<LeadFormValues>;
  label: string;
}

const isIOS = Platform.OS === "ios";

/** Format as MM/DD/YYYY. */
function formatDate(d: Date): string {
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${mm}/${dd}/${d.getFullYear()}`;
}

/**
 * Optional project start date. On iOS the calendar is presented inside an opaque
 * modal card (so it stays legible over the daisy background) and committed via
 * "Done"; on Android the native dialog handles its own surface. Uses the v9
 * `onValueChange`/`onDismiss` handlers (not the deprecated `onChange`).
 */
export function DateField({ control, label }: DateFieldProps) {
  const t = useTheme();
  const [show, setShow] = useState(false);
  const [temp, setTemp] = useState<Date | undefined>(undefined);

  return (
    <Controller
      control={control}
      name="projectStartDate"
      render={({ field, fieldState }) => {
        const value = field.value instanceof Date ? field.value : undefined;

        const open = () => {
          setTemp(value ?? new Date());
          setShow(true);
        };

        // iOS: stage selections, commit on Done. Android: onValueChange fires on OK.
        const onValueChange = (
          _event: DateTimePickerChangeEvent,
          date: Date,
        ) => {
          if (!date) return;
          if (isIOS) {
            setTemp(date);
          } else {
            setShow(false);
            field.onChange(date);
          }
        };

        return (
          <>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={label}
              onPress={open}
            >
              <InputContainer icon="calendar" error={fieldState.error?.message}>
                <Text
                  style={[
                    t.typography.body,
                    { color: value ? t.colors.text : t.colors.muted },
                  ]}
                >
                  {value ? formatDate(value) : label}
                </Text>
              </InputContainer>
            </Pressable>

            {isIOS ? (
              <Modal
                visible={show}
                transparent
                animationType="fade"
                onRequestClose={() => setShow(false)}
              >
                <Pressable
                  style={styles.backdrop}
                  onPress={() => setShow(false)}
                >
                  <Pressable
                    style={[styles.card, { backgroundColor: t.colors.surface }]}
                    onPress={() => {}}
                  >
                    <DateTimePicker
                      value={temp ?? new Date()}
                      mode="date"
                      display="inline"
                      themeVariant="light"
                      accentColor={t.colors.rust}
                      onValueChange={onValueChange}
                      onDismiss={() => setShow(false)}
                    />
                    <Button
                      label="Done"
                      variant="pill"
                      tone="rust"
                      style={styles.done}
                      onPress={() => {
                        if (temp) field.onChange(temp);
                        setShow(false);
                      }}
                    />
                  </Pressable>
                </Pressable>
              </Modal>
            ) : show ? (
              <DateTimePicker
                value={value ?? new Date()}
                mode="date"
                display="default"
                onValueChange={onValueChange}
                onDismiss={() => setShow(false)}
              />
            ) : null}
          </>
        );
      }}
    />
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    paddingHorizontal: 16,
  },
  card: {
    borderRadius: 16,
    padding: 12,
    gap: 8,
  },
  done: { alignSelf: "flex-end" },
});
