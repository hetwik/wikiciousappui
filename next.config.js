const withPWA = require('next-pwa');
const runtimeCaching = require('next-pwa/cache');

const { i18n } = require('./next-i18next.config');
const webpack = require('webpack');
const { withSentryConfig } = require('@sentry/nextjs');

const isProduction = process.env.NODE_ENV === 'production';

const config = {
  i18n,
  images: {
    domains: ['raw.githubusercontent.com', 'arweave.net', 'www.dual.finance'],
  },
  reactStrictMode: true,
  rewrites: async () => {
    return [
      {
        source: '/openSerumApi/:path*',
        destination: 'https://openserum.io/api/serum/:path*',
      },
    ];
  },
  webpack: (config, opts) => {
    if (!opts.isServer) {
      config.resolve.fallback = {
        fs: false,
      };
    }

    config.plugins.push(
      new webpack.DefinePlugin({
        'process.env': {
          BUILD_ID: JSON.stringify(opts.buildId),
        },
      })
    );

    return config;
  },
};

const nextConfig = withPWA({
  dest: 'public',
  disable: !isProduction,
  runtimeCaching,
})(config);

module.exports = withSentryConfig(
  nextConfig,
  {
    silent: true,
    org: 'wikicious',
    project: 'wikicious-v1-ui',
  },
  {
    widenClientFileUpload: true,
    transpileClientSDK: true,
    tunnelRoute: '/monitoring',
    hideSourceMaps: true,
    disableLogger: true,
  }
);
