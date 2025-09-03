/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**.amazon.com" },
      { protocol: "https", hostname: "**.amazonaws.com" },
      { protocol: "https", hostname: "**.mzstatic.com" },
      { protocol: "https", hostname: "**.magazineluiza.com.br" },
      { protocol: "https", hostname: "**.casasbahia.com.br" },
      { protocol: "https", hostname: "**.shopee.com.br" },
      { protocol: "https", hostname: "**" }
    ]
  },
  experimental: {
    serverComponentsExternalPackages: ["firebase-admin"]
  }
};

const path = require('path');

/** @type {import('next').NextConfig} */
const withAlias = {
  ...nextConfig,
  webpack: (config) => {
    config.resolve.alias = {
      ...(config.resolve.alias || {}),
      '@': path.resolve(__dirname, 'src'),
    };
    return config;
  },
};

module.exports = withAlias;
