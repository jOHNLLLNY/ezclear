const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Support symlinked packages and .cjs/.mjs resolution issues
config.resolver = {
  ...config.resolver,
  sourceExts: [...config.resolver.sourceExts, 'cjs', 'mjs', 'js', 'jsx', 'ts', 'tsx'],
};

module.exports = config;
