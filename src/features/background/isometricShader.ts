import { Skia } from '@shopify/react-native-skia';
import { BACKGROUND_SKSL } from './backgroundConfig';

/** Compiled runtime effect for the generative background overlay. */
export const BACKGROUND_EFFECT = (() => {
  const effect = Skia.RuntimeEffect.Make(BACKGROUND_SKSL);
  if (!effect) {
    throw new Error('Failed to compile background SkSL shader');
  }
  return effect;
})();
