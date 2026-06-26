import Svg, { Path } from 'react-native-svg';
import { colors } from '@/theme/tokens';

interface IconProps {
  size?: number;
  color?: string;
}

/**
 * Tag exported from Figma (new file, node 23:4247) — the provider-card
 * "discount" chip glyph (shown when the business has a coupon). Two paths:
 * the tag body and the punch-hole.
 */
export function TagIcon({ size = 16, color = colors.text }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 16 16" fill="none">
      <Path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M9.6665 5.99983C9.6665 6.9203 8.92031 7.6665 7.99984 7.6665C7.07936 7.6665 6.33317 6.9203 6.33317 5.99983C6.33317 5.07936 7.07936 4.33316 7.99984 4.33316C8.92031 4.33316 9.6665 5.07936 9.6665 5.99983ZM8.6665 5.99983C8.6665 6.36802 8.36803 6.6665 7.99984 6.6665C7.63165 6.6665 7.33317 6.36802 7.33317 5.99983C7.33317 5.63164 7.63165 5.33316 7.99984 5.33316C8.36803 5.33316 8.6665 5.63164 8.6665 5.99983Z"
        fill={color}
      />
      <Path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M9.31902 0.937178C8.56427 0.274846 7.43541 0.274847 6.68066 0.937179L3.34732 3.86235C2.9146 4.24209 2.6665 4.78988 2.6665 5.3656V13.3332C2.6665 14.4377 3.56193 15.3332 4.6665 15.3332H11.3332C12.4377 15.3332 13.3332 14.4377 13.3332 13.3332V5.3656C13.3332 4.78988 13.0851 4.24209 12.6524 3.86235L9.31902 0.937178ZM7.56011 1.93935C7.81169 1.71857 8.18798 1.71857 8.43956 1.93935L11.7729 4.86452C11.9171 4.9911 11.9998 5.17369 11.9998 5.3656V13.3332C11.9998 13.7014 11.7014 13.9998 11.3332 13.9998H4.6665C4.29831 13.9998 3.99984 13.7014 3.99984 13.3332V5.3656C3.99984 5.17369 4.08254 4.9911 4.22678 4.86452L7.56011 1.93935Z"
        fill={color}
      />
    </Svg>
  );
}
