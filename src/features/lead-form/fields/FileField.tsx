import { Pressable, Text, View, StyleSheet } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import { Controller, type Control } from 'react-hook-form';
import { useTheme } from '@/theme/ThemeProvider';
import { Button } from '@/components/ui/Button';
import type { LeadFormValues, PickedFile } from '../leadSchema';

interface FileFieldProps {
  control: Control<LeadFormValues>;
  label: string;
}

/** Optional file upload — Figma "Add a File" (Button L) + a chip once picked. */
export function FileField({ control, label }: FileFieldProps) {
  const t = useTheme();

  return (
    <Controller
      control={control}
      name="file"
      render={({ field }) => {
        const file = field.value as PickedFile | undefined;

        const pick = async () => {
          const result = await DocumentPicker.getDocumentAsync({
            type: '*/*',
            copyToCacheDirectory: true,
          });
          if (!result.canceled && result.assets[0]) {
            const a = result.assets[0];
            field.onChange({
              uri: a.uri,
              name: a.name,
              mimeType: a.mimeType,
              size: a.size ?? undefined,
            } satisfies PickedFile);
          }
        };

        if (file) {
          return (
            <View style={[styles.chip, { borderColor: t.colors.inputBorder, backgroundColor: t.colors.surface }]}>
              <Text style={[t.typography.body, styles.name]} numberOfLines={1}>
                {file.name}
              </Text>
              <Pressable
                onPress={() => field.onChange(undefined)}
                accessibilityRole="button"
                accessibilityLabel={`Remove ${file.name}`}
                hitSlop={8}
              >
                <Text style={[t.typography.captionSemi, { color: t.colors.rust }]}>Remove</Text>
              </Pressable>
            </View>
          );
        }

        return <Button label={label} icon="plus" iconPosition="leading" variant="wide" tone="none" onPress={pick} />;
      }}
    />
  );
}

const styles = StyleSheet.create({
  chip: {
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 14,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  name: { flex: 1 },
});
