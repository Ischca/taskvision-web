/** @ts-check */
const withPWA = require("next-pwa")({
  dest: "public",
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === "development",
});

/** @type {import('next').NextConfig} */
// next-intlの設定をCSRに最適化
const withNextIntl = require("next-intl/plugin")("./src/i18n.ts");

const nextConfig = {
  reactStrictMode: false, // ハイドレーションエラーを減らすために無効化
  images: {
    domains: ["lh3.googleusercontent.com", "firebasestorage.googleapis.com"],
    // unoptimized: true, // 静的エクスポートのために画像最適化を無効化
  },
  transpilePackages: ["lucide-react"],
  eslint: {
    // ESLintエラーで本番ビルドが失敗しないようにする
    ignoreDuringBuilds: true,
    // 特定のディレクトリやファイルを無視
    dirs: ["src", "app"],
  },
  // output: "export", // 静的HTMLとして出力を無効化
  // distDir: "out", // 出力先設定を削除
  webpack: (config) => {
    config.resolve.fallback = {
      fs: false,
      net: false,
      tls: false,
      child_process: false,
    };
    return config;
  },
  // CSRモードを優先するための設定
  experimental: {
    // 静的に最適化を無効化してCSRを確実にする
    optimizeCss: false,
  },
  // サーバーコンポーネントの使用を最小限に
  serverExternalPackages: [],
  // ページ再生成をスキップ
  skipTrailingSlashRedirect: true,
  // HTMLレンダリングの差異を減らすための設定
  compiler: {
    // 開発環境でもミニファイ
    reactRemoveProperties: process.env.NODE_ENV === "production",
    removeConsole: process.env.NODE_ENV === "production",
  },
};

// 最終的な設定を作成
const finalConfig = withNextIntl(withPWA(nextConfig));
module.exports = finalConfig;
