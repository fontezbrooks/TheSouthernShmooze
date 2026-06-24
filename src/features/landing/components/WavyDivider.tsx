import { useWindowDimensions, View, StyleSheet } from 'react-native';
import { Canvas, Path, Skia } from '@shopify/react-native-skia';

interface WavyDividerProps {
  /** Fill color of the band (the section below). */
  color: string;
  height?: number;
}

/** A wavy top edge transitioning from the hero into the content section (matches the site). */
export function WavyDivider({ color, height = 28 }: WavyDividerProps) {
  const { width } = useWindowDimensions();

  const path = Skia.Path.Make();
  const amp = height * 0.55;
  const waves = 6;
  const seg = width / waves;
  path.moveTo(0, height);
  path.lineTo(0, amp);
  for (let i = 0; i < waves; i += 1) {
    const x = i * seg;
    path.cubicTo(x + seg * 0.35, 0, x + seg * 0.65, amp * 2, x + seg, amp);
  }
  path.lineTo(width, height);
  path.close();

  return (
    <View style={[styles.wrap, { width, height }]} pointerEvents="none">
      <Canvas style={StyleSheet.absoluteFill}>
        <Path path={path} color={color} />
      </Canvas>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginTop: -1 },
});
