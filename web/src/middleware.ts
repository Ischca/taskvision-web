import createMiddleware from 'next-intl/middleware';
import { locales, defaultLocale } from './i18n';

// This middleware intercepts requests to `/` and will redirect
// to one of the configured locales instead (e.g. `/en`).
// In the redirect response, we also configure a cookie that
// records the locale that was selected.
export default createMiddleware({
  // サポートされるロケールの一覧
  locales,
  // デフォルトのロケール
  defaultLocale,
  // ロケールの検出順序（パス、クッキー、ヘッダーの順）
  localeDetection: true,
  // ロケールプレフィックスの設定（常にURLにロケールを含める）
  localePrefix: 'always',
});

export const config = {
  // Skip all paths that should not be internationalized.
  // This skips API routes, static files, etc.
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)'],
};
