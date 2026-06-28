import type { ComponentType } from "react";
import Feather from "@expo/vector-icons/Feather";
import { useTheme } from "@/theme/ThemeProvider";
import { PhoneIcon } from "./icons/PhoneIcon";
import { StarIcon } from "./icons/StarIcon";
import { TriangleWarningIcon } from "./icons/TriangleWarningIcon";
import { BriefcaseIcon } from "./icons/BriefcaseIcon";
import { ThumbsUpIcon } from "./icons/ThumbsUpIcon";
import { TagIcon } from "./icons/TagIcon";

/** Semantic icon names. Most map to Feather; a few route to Figma-exported SVGs. */
export type IconName =
  | "arrowRight"
  | "arrowLeft"
  | "phone"
  | "mail"
  | "house"
  | "dollar"
  | "calendar"
  | "plus"
  | "chevronDown"
  | "star"
  | "search"
  | "x"
  // Figma-exported custom glyphs:
  | "phoneFilled"
  | "starFilled"
  | "triangleWarning"
  | "briefcaseFilled"
  | "thumbsUp"
  | "tag";

const FEATHER: Record<string, React.ComponentProps<typeof Feather>["name"]> = {
  arrowRight: "arrow-right",
  arrowLeft: "arrow-left",
  phone: "phone",
  mail: "mail",
  house: "home",
  dollar: "dollar-sign",
  calendar: "calendar",
  plus: "plus-circle",
  chevronDown: "chevron-down",
  star: "star",
  search: "search",
  x: "x",
};

/** Custom glyphs exported from Figma, keyed by semantic name. */
const CUSTOM: Partial<
  Record<IconName, ComponentType<{ size?: number; color?: string }>>
> = {
  phoneFilled: PhoneIcon,
  starFilled: StarIcon,
  triangleWarning: TriangleWarningIcon,
  briefcaseFilled: BriefcaseIcon,
  thumbsUp: ThumbsUpIcon,
  tag: TagIcon,
};

interface IconProps {
  name: IconName;
  size?: number;
  color?: string;
}

/** Semantic icon — routes to a Figma SVG when available, else Feather. */
export function Icon({ name, size = 18, color }: IconProps) {
  const t = useTheme();
  const Custom = CUSTOM[name];
  if (Custom) {
    return <Custom size={size} color={color} />;
  }
  return (
    <Feather name={FEATHER[name]} size={size} color={color ?? t.colors.text} />
  );
}
