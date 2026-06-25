import { useState } from 'react';
import { View, StyleSheet, type LayoutChangeEvent, type StyleProp, type ViewStyle } from 'react-native';
import { Canvas, Fill, Shader } from '@shopify/react-native-skia';
import { useSharedValue, useDerivedValue, useFrameCallback } from 'react-native-reanimated';
import { BACKGROUND_EFFECT } from './isometricShader';
import { BG_CONFIG } from './backgroundConfig';
import { useBackgroundActive } from './useBackgroundActive';

interface AnimatedBackgroundProps {
  style?: StyleProp<ViewStyle>;
}

const { colorA, colorB, noiseScale, speed, alpha } = BG_CONFIG;

/**
 * The morphing "isometric" generative overlay. Renders a Skia runtime shader driven by
 * a reanimated frame clock; pauses via {@link useBackgroundActive}. Sits over the daisy
 * base layer at low opacity.
 */
export function AnimatedBackground({ style }: AnimatedBackgroundProps) {
  const [size, setSize] = useState({ width: 0, height: 0 });
  const active = useBackgroundActive();
  const time = useSharedValue(0);

  useFrameCallback((info) => {
    'worklet';
    if (active.value) {
      time.value += info.timeSincePreviousFrame ?? 16;
    }
  });

  const uniforms = useDerivedValue(
    () => ({
      u_time: time.value / 1000,
      u_resolution: [size.width || 1, size.height || 1],
      u_colorA: colorA,
      u_colorB: colorB,
      u_noiseScale: noiseScale,
      u_speed: speed,
      u_alpha: alpha,
    }),
    [size.width, size.height],
  );

  const onLayout = (e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    setSize((prev) => (prev.width === width && prev.height === height ? prev : { width, height }));
  };

  return (
    <View style={style} onLayout={onLayout} pointerEvents="none">
      {size.width > 0 && size.height > 0 ? (
        <Canvas style={StyleSheet.absoluteFill}>
          <Fill>
            <Shader source={BACKGROUND_EFFECT} uniforms={uniforms} />
          </Fill>
        </Canvas>
      ) : null}
    </View>
  );
}
