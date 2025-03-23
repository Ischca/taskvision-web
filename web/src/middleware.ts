import createIntlMiddleware from "next-intl/middleware";
import { locales, defaultLocale } from "./i18n";
import { NextRequest } from "next/server";

// 国際化のミドルウェアを作成
const intlMiddleware = createIntlMiddleware({
  locales,
  defaultLocale,
  localePrefix: "always",
});

export default function middleware(request: NextRequest) {
  // 型の不一致を解決するための型アサーション
  return intlMiddleware(request as any);
}

export const config = {
  // 国際化が不要なパスを除外
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
};
