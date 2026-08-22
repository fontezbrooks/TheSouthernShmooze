/** Central registry of bundled brand assets (Metro `require` for static bundling). */

// NOTE: assets/ is gitignored except runtime files (see .gitignore) so a clean
// checkout can resolve the require.

// Square brand logo (1600×1600) — the animated splash centerpiece.
export const splashLogo = require("../../assets/splash-logo.png");

// NOTE: the horizontal wordmark is a Figma-exported SVG
// (assets/ShmoozeLogo-Horizontal.svg) imported directly as a component in
// AppHeader via react-native-svg-transformer — not a require()'d raster.

// Home banner photos — "Let us help you plan" Concierge photo (July 2026 design
// round: NewImage.png replaces banner-help.png) and "Ask the community" Facebook
// screenshot (88×169, image-on-left).
export const bannerHelp = require("../../assets/np1.jpg");
export const bannerCommunity = require("../../assets/banner-community.png");
