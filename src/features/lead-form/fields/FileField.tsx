import { Pressable, Text, View, StyleSheet } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import { Controller, type Control } from 'react-hook-form';
import { useTheme } from '@/theme/ThemeProvider';
import type { LeadFormValues, PickedFile } from '../leadSchema';
import { FormField } from './FormField';

interface FileFieldProps {
  control: Control<LeadFormValues>;
  label: string;
}

/** Optional file upload — any type, via the native document picker. */
export function FileField({ control, label }: FileFieldProps) {
  const t = useTheme();

  return (
    <Controller
      control={control}
      name="file"
      render={({ field, fieldState }) => {
        const file = field.value as PickedFile | undefined;

        const pick = async () => {
          const result = await DocumentPicker.getDocumentAsync({
            type: '*/*',
            copyToCacheDirectory: true,
          });
          if (!result.canceled && result.assets[0]) {
            const a = result.assets[0];
            const picked: PickedFile = {
              uri: a.uri,
              name: a.name,
              mimeType: a.mimeType,
              size: a.size ?? undefined,
            };
            field.onChange(picked);
          }
        };

        return (
          <FormField label={label} error={fieldState.error?.message}>
            {file ? (
              <View style={[styles.chip, { borderColor: t.colors.line, backgroundColor: t.colors.surface }]}>
                <Text style={[t.typography.body, styles.name]} numberOfLines={1}>
                  {file.name}
                </Text>
                <Pressable
                  onPress={() => field.onChange(undefined)}
                  accessibilityRole="button"
                  accessibilityLabel={`Remove ${file.name}`}
                  hitSlop={8}
                >
                  <Text style={[t.typography.label, { color: t.colors.accent }]}>Remove</Text>
                </Pressable>
              </View>
            ) : (
              <Pressable
                onPress={pick}
                accessibilityRole="button"
                accessibilityLabel="Add a file"
                style={[styles.add, { borderColor: t.colors.line, backgroundColor: t.colors.surface }]}
              >
                <Text style={[t.typography.label, { color: t.colors.secondary }]}>＋ Add a File</Text>
              </Pressable>
            )}
          </FormField>
        );
      }}
    />
  );
}

const styles = StyleSheet.create({
  add: {
    borderWidth: 1,
    borderStyle: 'dashed',
    paddingVertical: 16,
    paddingHorizontal: 12,
    alignItems: 'center',
    borderRadius: 4,
  },
  chip: {
    borderWidth: 1,
    borderRadius: 4,
    paddingVertical: 12,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  name: { flex: 1 },
});
