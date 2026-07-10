import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  type ViewStyle,
} from "react-native";
import { useTheme } from "@/theme/ThemeProvider";
import { Icon } from "@/components/ui/Icon";

const PLACEHOLDER = "Search by service type...";
/** Hard offset drop shadow (Figma: 4px 4px 0 #602A00) — same physical look as the buttons. */
const SHADOW_OFFSET = 4;

/** Static hard-shadow frame shared by the input and the button variant. */
function Shell({
  children,
  pressableProps,
}: {
  children: React.ReactNode;
  pressableProps?: { onPress: () => void; accessibilityLabel: string };
}) {
  const t = useTheme();
  const pill: ViewStyle[] = [
    styles.pill,
    { backgroundColor: t.colors.surface, borderColor: t.colors.rustDark },
  ];
  return (
    <View style={styles.outer}>
      <View
        pointerEvents="none"
        style={[styles.shadow, { backgroundColor: t.colors.rustDark }]}
      />
      {pressableProps ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={pressableProps.accessibilityLabel}
          onPress={pressableProps.onPress}
          style={pill}
        >
          {children}
        </Pressable>
      ) : (
        <View style={pill}>{children}</View>
      )}
    </View>
  );
}

/** Filled circle-with-X clear control (Figma `circleWithXFilled`). */
function ClearButton({ onPress }: { onPress: () => void }) {
  const t = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Clear search"
      hitSlop={8}
      onPress={onPress}
      style={[styles.clear, { backgroundColor: t.colors.neutral500 }]}
    >
      <Icon name="x" size={12} color={t.colors.white} />
    </Pressable>
  );
}

interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  onFocus?: () => void;
  onBlur?: () => void;
  onClear?: () => void;
  /** Ref to the underlying input so callers can focus it (e.g. arriving from Home). */
  inputRef?: React.RefObject<TextInput | null>;
}

/**
 * Directory search input (Figma 47:14848): rounded rust pill with the hard 4px
 * brown drop shadow, magnifier, "Search by service type…" placeholder, and a
 * filled circle-X clear once populated. Controlled by the parent.
 */
export function SearchBar({
  value,
  onChangeText,
  onFocus,
  onBlur,
  onClear,
  inputRef,
}: SearchBarProps) {
  const t = useTheme();
  return (
    <Shell>
      <Icon name="search" size={18} color={t.colors.rust} />
      <TextInput
        ref={inputRef}
        style={[t.typography.body, styles.input, { color: t.colors.text }]}
        value={value}
        onChangeText={onChangeText}
        onFocus={onFocus}
        onBlur={onBlur}
        placeholder={PLACEHOLDER}
        placeholderTextColor={t.colors.muted}
        returnKeyType="search"
        autoCorrect={false}
        autoCapitalize="none"
        accessibilityLabel="Search the directory"
      />
      {value.length > 0 ? (
        <ClearButton
          onPress={() => {
            onChangeText("");
            onClear?.();
          }}
        />
      ) : null}
    </Shell>
  );
}

/**
 * Non-editable search bar that just routes to the Directory search (the Home
 * entry point — "another option for the same route", no in-place search).
 */
export function SearchBarButton({ onPress }: { onPress: () => void }) {
  const t = useTheme();
  return (
    <Shell
      pressableProps={{ onPress, accessibilityLabel: "Search the directory" }}
    >
      <Icon name="search" size={18} color={t.colors.rust} />
      <Text
        style={[t.typography.body, styles.input, { color: t.colors.muted }]}
      >
        {PLACEHOLDER}
      </Text>
    </Shell>
  );
}

const styles = StyleSheet.create({
  outer: { position: "relative", width: "100%" },
  shadow: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    borderRadius: 100,
    transform: [{ translateX: SHADOW_OFFSET }, { translateY: SHADOW_OFFSET }],
  },
  pill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    height: 48,
    paddingHorizontal: 12,
    borderWidth: 2,
    borderRadius: 100,
  },
  // Center the text in the 48px pill: no default vertical padding, lineHeight
  // tightened below the 24px body token (which sat the text low) but ABOVE the
  // font size — a 16px line box clipped the font's ascenders at the top
  // (device report). Listed AFTER t.typography.body so the override wins.
  input: {
    flex: 1,
    paddingVertical: 0,
    lineHeight: 20,
    textAlignVertical: "center",
    includeFontPadding: false,
  },
  clear: {
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
  },
});
