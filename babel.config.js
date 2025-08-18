module.exports = function (api) {
    api.cache(true);
    return {
      presets: [
        'babel-preset-expo',
        'nativewind/babel',           // ← this is a PRESET
      ],
      plugins: [
        'expo-router/babel',          // ← this is a PLUGIN
        'react-native-reanimated/plugin', // must stay LAST
      ],
    };
  };