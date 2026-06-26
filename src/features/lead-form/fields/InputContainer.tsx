import { type ReactNode } from "react";
import { View, StyleSheet } from "react-native";
import { useTheme } from "@/theme/ThemeProvider";
import { Icon, type IconName } from "@/components/ui/Icon";
import { FloatingLabel } from "@/components/ui/FloatingLabel";
import { PaddedErrorMessage } from "@/components/ui/PaddedErrorMessage";

interface InputContainerProps {
  label: string;
  /** focused || hasValue → label floats up. Forced true for multiline. */
  floated: boolean;
  icon?: IconName;
  /** Trailing node (chevron for selects), vertically centered. */
  trailing?: ReactNode;
  error?: string;
  disabled?: boolean;
  multiline?: boolean;
  /** The value control (TextInput / Text), rendered in the lower slot. */
  children: ReactNode;
}

/**
 * The Figma V3 "Label Inside" input shell: a floating label (placeholder → small
 * top label), a leading icon + value row, and a padded error message below. The
 * label is pinned floated for multiline fields.
 */
export function InputContainer({
  label,
  floated,
  icon,
  trailing,
  error,
  disabled = false,
  multiline = false,
  children,
}: InputContainerProps) {
  const t = useTheme();
  const isFloated = floated || multiline;
  const borderColor = error ? t.colors.error : t.colors.inputBorder;

  return (
    <View style={styles.wrap}>
      <View
        style={[
          styles.box,
          multiline ? styles.boxMultiline : styles.boxSingle,
          {
            backgroundColor: t.colors.surface,
            borderRadius: t.radii.input,
            borderColor,
            opacity: disabled ? 0.5 : 1,
          },
        ]}
      >
        <View
          style={[
            styles.content,
            multiline
              ? styles.contentMultiline
              : isFloated
                ? styles.contentFloated
                : styles.contentCenter,
          ]}
        >
          <FloatingLabel
            label={label}
            floated={isFloated}
            hasIcon={!!icon && !multiline}
          />
          {/* Icon + value share the lower row, so the floated top-left label never overlaps the icon. */}
          <View
            style={[styles.valueRow, multiline && styles.valueRowMultiline]}
          >
            {icon && !multiline ? (
              <Icon name={icon} size={18} color={t.colors.muted} />
            ) : null}
            <View style={styles.valueFill}>{children}</View>
          </View>
        </View>
        {trailing}
      </View>
      {error ? <PaddedErrorMessage message={error} /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 4, width: "100%" },
  box: {
    flexDirection: "row",
    gap: 6,
    paddingHorizontal: 12,
    borderWidth: 1,
  },
  boxSingle: { minHeight: 58, paddingVertical: 8, alignItems: "center" },
  boxMultiline: {
    minHeight: 131,
    paddingVertical: 12,
    alignItems: "flex-start",
  },
  content: {
    flex: 1,
    height: 42,
    position: "relative",
  },
  // Empty/unfocused: value row centered (placeholder label sits over it).
  contentCenter: { justifyContent: "center" },
  // Floated: value row drops to the bottom so the top-left label stands clear.
  contentFloated: { justifyContent: "flex-end" },
  contentMultiline: {
    height: undefined,
    flex: 1,
    justifyContent: "flex-start",
  },
  valueRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    width: "100%",
  },
  // Clear the floated top label on the taller multiline field.
  valueRowMultiline: { marginTop: 18 },
  valueFill: { flex: 1 },
});
