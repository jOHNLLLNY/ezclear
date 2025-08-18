module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      [
        'module-resolver',
        {
          root: ['./'],
          alias: {
            '@': './src',
            '@/components': './src/components',
            '@/ui': './src/ui',
            '@/context': './src/context',
            '@/theme': './src/theme',
            '@/types': './src/types',
            '@/utils': './src/utils',
          },
        },
      ],
      // IMPORTANT: Reanimated plugin must be listed last
      'react-native-reanimated/plugin',
    ],
  };
};
