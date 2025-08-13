
const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname, {
  // [Web-only]: Enables CSS support in Metro.
  isCSSEnabled: true,
});

// Add nativewind transformer
config.transformer.babelTransformerPath = require.resolve('nativewind/transformer');

module.exports = config;
