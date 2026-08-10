/**
 * E1 rebrand acceptance (claudedocs/site-reconciliation/design.md §E1):
 * brand tokens mirror the live-site design system (report.md §5, §8.5),
 * fonts resolve to real loaded families, and legacy tokens stay intact
 * so unmigrated screens keep rendering unchanged (NFR-1).
 */
import * as fraunces from "@expo-google-fonts/fraunces";
import * as publicSans from "@expo-google-fonts/public-sans";
import * as caveat from "@expo-google-fonts/caveat";
import {
  brandColors,
  brandFonts,
  brandRadii,
  brandShadow,
  colors,
  radii,
  shadow,
} from "../tokens";
import { brandTypography, typography } from "../typography";

describe("brand palette (site design truth)", () => {
  it("matches the site-extracted core palette exactly", () => {
    expect(brandColors.bg).toBe("#FFFDF8"); // magnolia
    expect(brandColors.porchCream).toBe("#FBF1E1");
    expect(brandColors.clay).toBe("#A8472B");
    expect(brandColors.clayDark).toBe("#8A3820");
    expect(brandColors.pine).toBe("#26402F");
    expect(brandColors.pineDark).toBe("#1B2E21");
    expect(brandColors.gold).toBe("#C98F2B");
    expect(brandColors.goldLight).toBe("#E7B85A");
    expect(brandColors.peach).toBe("#EFA85F");
    expect(brandColors.peachSoft).toBe("#F9E0BE");
    expect(brandColors.text).toBe("#2A2420"); // ink
    expect(brandColors.textSoft).toBe("#5B5148");
    expect(brandColors.line).toBe("#E4D6BE");
  });

  it("uses the site radii scale 10/16/28 + pill", () => {
    expect(brandRadii).toEqual({ sm: 10, md: 16, lg: 28, pill: 999 });
  });
});

describe("brand shadows are soft, not the legacy hard offset", () => {
  it.each(Object.entries(brandShadow))("%s blurs with partial opacity", (_name, s) => {
    expect(s.shadowRadius).toBeGreaterThan(0); // legacy hard shadows use radius 0
    expect(s.shadowOpacity).toBeLessThan(1); // legacy hard shadows use opacity 1
    expect(s.shadowOffset.width).toBe(0); // vertical drop, no diagonal offset
  });
});

describe("brand fonts resolve to loaded families", () => {
  it("every brandFonts key is a real @expo-google-fonts export", () => {
    const available: Record<string, unknown> = {
      ...fraunces,
      ...publicSans,
      ...caveat,
    };
    for (const family of Object.values(brandFonts)) {
      expect(available[family]).toBeDefined();
    }
  });

  it("brandTypography only uses brand families", () => {
    const families = new Set<string>(Object.values(brandFonts));
    for (const style of Object.values(brandTypography)) {
      expect(families.has(style.fontFamily as string)).toBe(true);
    }
  });
});

describe("legacy tokens untouched (NFR-1: no regressions on unmigrated screens)", () => {
  it("keeps the legacy palette, hard shadow, and ramp exports", () => {
    expect(colors.rust).toBe("#994706");
    expect(colors.bg).toBe("#FFF8EA");
    expect(shadow.hard.shadowRadius).toBe(0);
    expect(shadow.hard.shadowOffset).toEqual({ width: 4, height: 4 });
    expect(radii.card).toBe(24);
    expect(typography.displayL.fontFamily).toBe("Shrikhand_400Regular");
  });
});
