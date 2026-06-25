import Feather from '@expo/vector-icons/Feather';
import { useTheme } from '@/theme/ThemeProvider';

/** Semantic icon names used across the app, mapped to the Feather set. */
export type IconName =
  | 'arrowRight'
  | 'arrowLeft'
  | 'phone'
  | 'mail'
  | 'house'
  | 'dollar'
  | 'calendar'
  | 'plus'
  | 'chevronDown'
  | 'star';

const FEATHER: Record<IconName, React.ComponentProps<typeof Feather>['name']> = {
  arrowRight: 'arrow-right',
  arrowLeft: 'arrow-left',
  phone: 'phone',
  mail: 'mail',
  house: 'home',
  dollar: 'dollar-sign',
  calendar: 'calendar',
  plus: 'plus-circle',
  chevronDown: 'chevron-down',
  star: 'star',
};

interface IconProps {
  name: IconName;
  size?: number;
  color?: string;
}

/** Thin wrapper over Feather so call sites use semantic names + theme colors. */
export function Icon({ name, size = 18, color }: IconProps) {
  const t = useTheme();
  return <Feather name={FEATHER[name]} size={size} color={color ?? t.colors.text} />;
}
