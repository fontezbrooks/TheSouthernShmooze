import { createContext, useContext, type ReactNode } from "react";
import {
  brandColors,
  brandFonts,
  brandRadii,
  brandShadow,
  colors,
  radii,
  spacing,
  durations,
  fonts,
  shadow,
} from "./tokens";
import { brandTypography, typography } from "./typography";

const theme = {
  colors,
  radii,
  spacing,
  durations,
  fonts,
  shadow,
  typography,
  /** 2026 rebrand namespace — screens migrate here in E2–E7. */
  brand: {
    colors: brandColors,
    radii: brandRadii,
    shadow: brandShadow,
    fonts: brandFonts,
    typography: brandTypography,
  },
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
