// Metro config — adds react-native-svg-transformer so `.svg` files import as
// React components (Figma-exported SVGs are the design source of truth).
const { getDefaultConfig } = require("expo/metro-config");

/** @type {import('expo/metro-config').MetroConfig} */
// biome-ignore lint/correctness/noGlobalDirnameFilename: Metro loads this file as CommonJS via require(); import.meta is invalid there — the autofix silently drops the whole exported config (no .transformer), killing SVG imports.
const config = getDefaultConfig(__dirname);

config.transformer.babelTransformerPath = require.resolve(
	"react-native-svg-transformer/expo"
);
config.resolver.assetExts = config.resolver.assetExts.filter(
	(ext) => ext !== "svg"
);
config.resolver.sourceExts = [...config.resolver.sourceExts, "svg"];

module.exports = config;
