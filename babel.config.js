module.exports = function (api) {
  api.cache(true);
  return {
    presets: ["babel-preset-expo"],
    // Reanimated 4 compiles worklets via this plugin — it MUST be listed last.
    plugins: ["react-native-worklets/plugin"],
  };
};
