/** @ts-check */
const withPWA = require("next-pwa")({
  dest: "public",
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === "development",
});

/** @type {import('next').NextConfig} */
// next-intlの設定をSSRに最適化
const withNextIntl = require("next-intl/plugin")("./src/i18n.ts");

const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ["lh3.googleusercontent.com", "firebasestorage.googleapis.com"],
    // SSRモードでは画像最適化が必要
    unoptimized: false,
  },
  transpilePackages: ["lucide-react"],
  eslint: {
    // ESLintエラーで本番ビルドが失敗しないようにする
    ignoreDuringBuilds: true,
    // 特定のディレクトリやファイルを無視
    dirs: ["src", "app"],
  },
  webpack: (config) => {
    config.resolve.fallback = {
      fs: false,
      net: false,
      tls: false,
      child_process: false,
    };
    return config;
  },
  // Firebase App Hostingに最適化された設定
  experimental: {
    // App Hostingはデフォルトでサーバーコンポーネントをサポート
    serverActions: {
      bodySizeLimit: "2mb",
    },
  },
  // Firebase App Hostingではoutput: 'standalone'が推奨
  output: "standalone",
  // SSRで必要なサーバーコンポーネントのパッケージ設定
  serverExternalPackages: ["next-intl"],
  // ページ再生成をスキップ
  skipTrailingSlashRedirect: true,
  // HTMLレンダリングの設定
  compiler: {
    // 開発環境でもミニファイ
    reactRemoveProperties: process.env.NODE_ENV === "production",
    removeConsole: process.env.NODE_ENV === "production",
  },
};

// 最終的な設定を作成
const finalConfig = withNextIntl(withPWA(nextConfig));
module.exports = finalConfig;
