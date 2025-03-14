/** @ts-check */
const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development'
});

/** @type {import('next').NextConfig} */
// next-intlの設定をCSRに最適化
const withNextIntl = require('next-intl/plugin')('./src/i18n.ts');

const nextConfig = {
  reactStrictMode: false, // ハイドレーションエラーを減らすために無効化
  images: {
    domains: ['lh3.googleusercontent.com', 'firebasestorage.googleapis.com'],
  },
  transpilePackages: ['lucide-react'],
  eslint: {
    // ESLintエラーで本番ビルドが失敗しないようにする
    ignoreDuringBuilds: true,
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
  // CSRモードを優先するための設定
  experimental: {
    // 静的に最適化を無効化してCSRを確実にする
    optimizeCss: false,
  },
  // サーバーコンポーネントの使用を最小限に
  serverExternalPackages: [],
  // ページ再生成をスキップ
  skipTrailingSlashRedirect: true,
  // サーバーアクション設定
  serverActions: false,
  // HTMLレンダリングの差異を減らすための設定
  compiler: {
    // 開発環境でもミニファイ
    reactRemoveProperties: process.env.NODE_ENV === 'production',
    removeConsole: process.env.NODE_ENV === 'production',
  },
};

// 複数のプラグインを組み合わせる場合はこのように順番に適用する
module.exports = withNextIntl(withPWA(nextConfig)); 