import type { ComponentType } from "react";
import type { SvgProps } from "react-native-svg";
import Feather from "@expo/vector-icons/Feather";
import { useTheme } from "@/theme/ThemeProvider";
import { PhoneIcon } from "./icons/PhoneIcon";
import { TriangleWarningIcon } from "./icons/TriangleWarningIcon";
import { BriefcaseIcon } from "./icons/BriefcaseIcon";
// Figma-exported glyphs (RC1) — color is driven by `currentColor`, so the
// `color` prop flows through via react-native-svg's `color`.
import ThumbsUpSvg from "./icons/thumbs-up.svg";
import SaleSvg from "./icons/sale-03.svg";
import StarSvg from "./icons/star-01.svg";
import FileQuestionSvg from "./icons/fileQuestion.svg";
// Brand glyphs (P6, owner-provided — design §8): fixed palette, `color` is a no-op.
import BrandBbbSvg from "./icons/brand-bbb.svg";
import BrandYelpSvg from "./icons/brand-yelp.svg";
import BrandGoogleBusinessSvg from "./icons/brand-google-business.svg";
import BrandGaSosSvg from "./icons/brand-ga-sos.svg";

/** Semantic icon names. Most map to Feather; a few route to Figma-exported SVGs. */
export type IconName =
  | "check"
  | "arrowRight"
  | "arrowLeft"
  | "phone"
  | "mail"
  | "house"
  | "dollar"
  | "calendar"
  | "plus"
  | "chevronDown"
  | "chevronLeft"
  | "heart"
  | "globe"
  | "facebook"
  | "instagram"
  | "star"
  | "search"
  | "x"
  // Figma-exported custom glyphs:
  | "phoneFilled"
  | "starFilled"
  | "triangleWarning"
  | "briefcaseFilled"
  | "thumbsUp"
  | "discount"
  | "fileQuestion"
  // Brand marks (fixed palette — `color` prop ignored):
  | "brandBbb"
  | "brandYelp"
  | "brandGoogleBusiness"
  | "brandGaSos";

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
  chevronLeft: "chevron-left",
  heart: "heart",
  globe: "globe",
  facebook: "facebook",
  instagram: "instagram",
  star: "star",
  search: "search",
  x: "x",
  check: "check",
};

type GlyphProps = { size?: number; color?: string };

/** Adapt a Figma `.svg` module (SvgProps) to the `{ size, color }` glyph contract. */
function svgGlyph(
  Svg: ComponentType<SvgProps>,
): ComponentType<GlyphProps> {
  return function Glyph({ size = 16, color }: GlyphProps) {
    return <Svg width={size} height={size} color={color} />;
  };
}

/** Custom glyphs (hand-authored tsx + Figma SVGs), keyed by semantic name. */
const CUSTOM: Partial<Record<IconName, ComponentType<GlyphProps>>> = {
  phoneFilled: PhoneIcon,
  triangleWarning: TriangleWarningIcon,
  briefcaseFilled: BriefcaseIcon,
  thumbsUp: svgGlyph(ThumbsUpSvg),
  discount: svgGlyph(SaleSvg),
  starFilled: svgGlyph(StarSvg),
  fileQuestion: svgGlyph(FileQuestionSvg),
  brandBbb: svgGlyph(BrandBbbSvg),
  brandYelp: svgGlyph(BrandYelpSvg),
  brandGoogleBusiness: svgGlyph(BrandGoogleBusinessSvg),
  brandGaSos: svgGlyph(BrandGaSosSvg),
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
