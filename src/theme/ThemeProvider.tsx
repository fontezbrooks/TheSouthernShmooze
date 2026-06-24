import { createContext, useContext, type ReactNode } from 'react';
import { colors, radii, spacing, durations, fonts } from './tokens';
import { typography } from './typography';

const theme = { colors, radii, spacing, durations, fonts, typography } as const;

export type Theme = typeof theme;

const ThemeContext = createContext<Theme>(theme);

/** Access design tokens + typography from any component. */
export const useTheme = (): Theme => useContext(ThemeContext);

export function ThemeProvider({ children }: { children: ReactNode }) {
  return <ThemeContext.Provider value={theme}>{children}</ThemeContext.Provider>;
}
