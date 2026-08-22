import Feather from "@expo/vector-icons/Feather";
import type { ComponentType } from "react";
import type { SvgProps } from "react-native-svg";
import { useTheme } from "@/theme/ThemeProvider";
import { BriefcaseIcon } from "./icons/BriefcaseIcon";
// Brand glyphs (P6, owner-provided — design §8): fixed palette, `color` is a no-op.
import BrandBbbSvg from "./icons/brand-bbb.svg";
import BrandGaSosSvg from "./icons/brand-ga-sos.svg";
import BrandGoogleBusinessSvg from "./icons/brand-google-business.svg";
import BrandYelpSvg from "./icons/brand-yelp.svg";
import FileQuestionSvg from "./icons/fileQuestion.svg";
import { PhoneIcon } from "./icons/PhoneIcon";
import SaleSvg from "./icons/sale-03.svg";
import StarSvg from "./icons/star-01.svg";
import { TriangleWarningIcon } from "./icons/TriangleWarningIcon";
// Figma-exported glyphs (RC1) — color is driven by `currentColor`, so the
// `color` prop flows through via react-native-svg's `color`.
import ThumbsUpSvg from "./icons/thumbs-up.svg";

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
	arrowLeft: "arrow-left",
	arrowRight: "arrow-right",
	calendar: "calendar",
	check: "check",
	chevronDown: "chevron-down",
	chevronLeft: "chevron-left",
	dollar: "dollar-sign",
	facebook: "facebook",
	globe: "globe",
	heart: "heart",
	house: "home",
	instagram: "instagram",
	mail: "mail",
	phone: "phone",
	plus: "plus-circle",
	search: "search",
	star: "star",
	x: "x",
};

type GlyphProps = { size?: number; color?: string };

/** Adapt a Figma `.svg` module (SvgProps) to the `{ size, color }` glyph contract. */
function svgGlyph(Svg: ComponentType<SvgProps>): ComponentType<GlyphProps> {
	return function Glyph({ size = 16, color }: GlyphProps) {
		return <Svg color={color} height={size} width={size} />;
	};
}

/** Custom glyphs (hand-authored tsx + Figma SVGs), keyed by semantic name. */
const CUSTOM: Partial<Record<IconName, ComponentType<GlyphProps>>> = {
	brandBbb: svgGlyph(BrandBbbSvg),
	brandGaSos: svgGlyph(BrandGaSosSvg),
	brandGoogleBusiness: svgGlyph(BrandGoogleBusinessSvg),
	brandYelp: svgGlyph(BrandYelpSvg),
	briefcaseFilled: BriefcaseIcon,
	discount: svgGlyph(SaleSvg),
	fileQuestion: svgGlyph(FileQuestionSvg),
	phoneFilled: PhoneIcon,
	starFilled: svgGlyph(StarSvg),
	thumbsUp: svgGlyph(ThumbsUpSvg),
	triangleWarning: TriangleWarningIcon,
};

interface IconProps {
	color?: string;
	name: IconName;
	size?: number;
}

/** Semantic icon — routes to a Figma SVG when available, else Feather. */
export function Icon({ name, size = 18, color }: IconProps) {
	const t = useTheme();
	const Custom = CUSTOM[name];
	if (Custom) {
		return <Custom color={color} size={size} />;
	}
	return (
		<Feather
			color={color ?? t.brand.colors.text}
			name={FEATHER[name]}
			size={size}
		/>
	);
}
