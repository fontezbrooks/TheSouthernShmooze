import Svg, { Path } from "react-native-svg";
import { brandColors } from "@/theme/tokens";

interface IconProps {
	color?: string;
	size?: number;
}

/**
 * Phone glyph exported from Figma (node 9:5950) — the handset/receiver style
 * used on Certified Provider cards and the concierge phone field. Single path,
 * recolorable via `color`.
 */
export function PhoneIcon({
	size = 18,
	color = brandColors.textSoft,
}: IconProps) {
	return (
		<Svg fill="none" height={size} viewBox="0 0 24 24" width={size}>
			<Path
				clipRule="evenodd"
				d="M4.75 3.53846C4.75 2.12195 5.91194 1 7.3125 1H16.6875C18.0881 1 19.25 2.12195 19.25 3.53846V20.4615C19.25 21.8781 18.0881 23 16.6875 23H7.3125C5.91194 23 4.75 21.8781 4.75 20.4615V3.53846ZM7.3125 3C6.98717 3 6.75 3.25564 6.75 3.53846V5.3269H17.25V3.53846C17.25 3.25564 17.0128 3 16.6875 3H7.3125ZM6.75 17.1731V6.8269H17.25V17.1731H6.75ZM6.75 18.6731V20.4615C6.75 20.7444 6.98717 21 7.3125 21H16.6875C17.0128 21 17.25 20.7444 17.25 20.4615V18.6731H6.75Z"
				fill={color}
				fillRule="evenodd"
			/>
		</Svg>
	);
}
