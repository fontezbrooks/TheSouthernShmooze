module.exports = (api) => {
	api.cache(true);
	return {
		// Reanimated 4 compiles worklets via this plugin — it MUST be listed last.
		plugins: ["react-native-worklets/plugin"],
		presets: ["babel-preset-expo"],
	};
};
