/** Central registry of bundled brand assets (Metro `require` for static bundling). */

// Tiled daisy/floral pattern — the app background base layer (Figma: repeating
// pattern over Vanilla #FFF8EA). Rendered as a repeating ImageBackground.
// NOTE: assets/ is gitignored except runtime files (see .gitignore) so a clean
// checkout can resolve the require.
export const daisyBackground = require("../../assets/background.png");

// Square brand logo (1600×1600) — the animated splash centerpiece.
export const splashLogo = require("../../assets/splash-logo.png");

// NOTE: the horizontal wordmark is a Figma-exported SVG
// (assets/ShmoozeLogo-Horizontal.svg) imported directly as a component in
// AppHeader via react-native-svg-transformer — not a require()'d raster.

// Home banner photos (Figma V3) — "Let us help you plan" group photo (338×124,
// image-on-top) and "Ask the community" Facebook screenshot (88×169, image-on-left).
export const bannerHelp = require("../../assets/banner-help.png");
export const bannerCommunity = require("../../assets/banner-community.png");
