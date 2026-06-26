import Svg, { Path, Rect, Circle } from 'react-native-svg';
import { colors } from '@/theme/tokens';

interface IconProps {
  size?: number;
  color?: string;
}

/**
 * Filled warning triangle with exclamation — the inline error indicator from the
 * Figma field error variant (8:5867, `triangleWithExclamationPointFilled`). Red
 * fill with a white exclamation. Used in `InputContainer`'s error row.
 */
export function TriangleWarningIcon({ size = 12, color = colors.error }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M10.27 3.5a2 2 0 0 1 3.46 0l8.2 14.2a2 2 0 0 1-1.73 3H3.8a2 2 0 0 1-1.73-3l8.2-14.2Z"
        fill={color}
      />
      <Rect x="11" y="8.5" width="2" height="6" rx="1" fill={colors.white} />
      <Circle cx="12" cy="17.5" r="1.15" fill={colors.white} />
    </Svg>
  );
}
