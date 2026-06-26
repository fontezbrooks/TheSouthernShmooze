import Svg, { Path } from 'react-native-svg';
import { colors } from '@/theme/tokens';

interface IconProps {
  size?: number;
  color?: string;
}

/**
 * Filled, rounded-point star exported from Figma (node 13:5816) — the Certified
 * Provider rating star. Replaces the hollow Feather `star`. Pumpkin by default.
 */
export function StarIcon({ size = 20, color = colors.pumpkin }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M11.2335 3.47544C11.5564 2.84152 12.4436 2.84152 12.7665 3.47544L15.4887 8.81981L20.2342 9.38194C20.9751 9.46971 21.2666 10.4114 20.71 10.9189L17.0345 14.2698L18.0141 19.9613C18.1407 20.6971 17.3723 21.2514 16.7366 20.8829L12 18.1372L7.26336 20.8829C6.62766 21.2514 5.85931 20.6971 5.98595 19.9613L6.96552 14.2698L3.29005 10.9189C2.73338 10.4114 3.02485 9.46971 3.76579 9.38194L8.51132 8.81981L11.2335 3.47544Z"
        fill={color}
      />
    </Svg>
  );
}
