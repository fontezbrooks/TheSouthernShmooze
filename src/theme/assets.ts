/** Central registry of bundled brand assets (Metro `require` for static bundling). */

// Tiled daisy/floral pattern — the app background base layer (Figma: repeating
// pattern over Vanilla #FFF8EA). Rendered as a repeating ImageBackground.
// NOTE: assets/ is gitignored except this file (see .gitignore) so a clean
// checkout can resolve the require.
export const daisyBackground = require("../../assets/background.png");
