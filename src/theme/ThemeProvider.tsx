import { createContext, type ReactNode, useContext } from "react";
import {
	brandColors,
	brandFonts,
	brandRadii,
	brandShadow,
	durations,
} from "./tokens";
import { brandTypography } from "./typography";

const theme = {
	/** 2026 rebrand namespace — the only token set since the Aug 2026 migration. */
	brand: {
		colors: brandColors,
		fonts: brandFonts,
		radii: brandRadii,
		shadow: brandShadow,
		typography: brandTypography,
	},
	durations,
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
