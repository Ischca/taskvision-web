/** @ts-check */
const runtimeCaching = require("next-pwa/cache");
const withPWA = require("next-pwa")({
  dest: "public",
  runtimeCaching,
  disable: process.env.NODE_ENV === "development",
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    unoptimized: true,
    domains: ["lh3.googleusercontent.com", "firebasestorage.googleapis.com"],
  },
  output: "standalone",
  distDir: ".next",
  trailingSlash: false,
  poweredByHeader: false,
  generateEtags: false,
  experimental: {
    optimizeCss: true,
    disableOptimizedLoading: false,
    appDocumentPreloading: false,
    serverActions: {
      bodySizeLimit: "2mb",
      allowedOrigins: ["localhost:3000"],
    },
  },
  webpack: (config) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
    };
    config.module = {
      ...config.module,
      exprContextCritical: false,
    };
    return config;
  },
};

// PWA設定を最後に適用
module.exports = withPWA(nextConfig);
