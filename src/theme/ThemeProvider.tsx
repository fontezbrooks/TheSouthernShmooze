import { createContext, type ReactNode, useContext } from "react";
import {
	brandColors,
	brandFonts,
	brandRadii,
	brandShadow,
	colors,
	durations,
	fonts,
	radii,
	shadow,
	spacing,
} from "./tokens";
import { brandTypography, typography } from "./typography";

const theme = {
	/** 2026 rebrand namespace — screens migrate here in E2–E7. */
	brand: {
		colors: brandColors,
		fonts: brandFonts,
		radii: brandRadii,
		shadow: brandShadow,
		typography: brandTypography,
	},
	colors,
	durations,
	fonts,
	radii,
	shadow,
	spacing,
	typography,
} as const;

export type Theme = typeof theme;

const ThemeContext = createContext<Theme>(theme);

/** Access design tokens + typography from any component. */
export const useTheme = (): Theme => useContext(ThemeContext);

export function ThemeProvider({ children }: { children: ReactNode }) {
	return (
		<ThemeContext.Provider value={theme}>{children}</ThemeContext.Provider>
	);
}
