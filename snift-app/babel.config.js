module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      // Include nativewind as a preset rather than plugin
      ['babel-preset-expo', { jsxImportSource: 'nativewind' }],
      'nativewind/babel',  // move here
    ],
    plugins: [
      'react-native-worklets/plugin',  // for reanimated v3 / worklets
    ],
  };
};
