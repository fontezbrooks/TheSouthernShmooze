import { useEffect } from 'react';
import { AccessibilityInfo, AppState } from 'react-native';
import { useSharedValue, type SharedValue } from 'react-native-reanimated';

/**
 * Whether the background animation should run. Freezes (false) when the OS has
 * reduce-motion enabled or the app is backgrounded — reproducing the site's pause
 * behavior without an on-screen pause button.
 */
export function useBackgroundActive(): SharedValue<boolean> {
  const active = useSharedValue(true);

  useEffect(() => {
    let reduceMotion = false;
    let appActive = true;
    const update = () => {
      active.value = !reduceMotion && appActive;
    };

    AccessibilityInfo.isReduceMotionEnabled().then((v) => {
      reduceMotion = v;
      update();
    });
    const a11ySub = AccessibilityInfo.addEventListener('reduceMotionChanged', (v) => {
      reduceMotion = v;
      update();
    });
    const appSub = AppState.addEventListener('change', (s) => {
      appActive = s === 'active';
      update();
    });

    return () => {
      a11ySub.remove();
      appSub.remove();
    };
  }, [active]);

  return active;
}
