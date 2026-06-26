/** Central registry of bundled brand assets (Metro `require` for static bundling). */

// Tiled daisy/floral pattern — the app background base layer (Figma: repeating
// pattern over Vanilla #FFF8EA). Rendered as a repeating ImageBackground.
// NOTE: assets/ is gitignored except runtime files (see .gitignore) so a clean
// checkout can resolve the require.
export const daisyBackground = require("../../assets/background.png");

// Square brand logo (1600×1600) — the animated splash centerpiece.
export const splashLogo = require("../../assets/splash-logo.png");
