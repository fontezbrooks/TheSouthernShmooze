import Svg, { Path } from "react-native-svg";
import { colors } from "@/theme/tokens";

interface IconProps {
	color?: string;
	size?: number;
}

/**
 * Filled briefcase exported from Figma (new file, node 23:4312) — the no-logo
 * provider-card placeholder glyph. Rust by default.
 */
export function BriefcaseIcon({
	size = 63,
	color = colors.rustDark,
}: IconProps) {
	return (
		<Svg fill="none" height={size} viewBox="0 0 63 63" width={size}>
			<Path
				clipRule="evenodd"
				d="M25.6222 11.3595C27.1811 9.80058 29.2954 8.9248 31.5 8.9248C33.7046 8.9248 35.8189 9.80058 37.3778 11.3595C38.3021 12.2837 38.9862 13.4032 39.39 14.621H23.61C24.0138 13.4032 24.6979 12.2837 25.6222 11.3595ZM18.1922 14.621C18.7079 11.9981 19.992 9.565 21.9099 7.64717C24.4533 5.10371 27.903 3.6748 31.5 3.6748C35.097 3.6748 38.5467 5.10371 41.0901 7.64717C43.008 9.565 44.2921 11.9981 44.8078 14.621H49.875C55.674 14.621 60.375 19.322 60.375 25.121V48.746C60.375 54.545 55.674 59.246 49.875 59.246H13.125C7.32601 59.246 2.625 54.545 2.625 48.746V25.121C2.625 19.322 7.32601 14.621 13.125 14.621H18.1922Z"
				fill={color}
				fillRule="evenodd"
			/>
		</Svg>
	);
}
