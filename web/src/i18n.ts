/**
 * このファイルはNext.js 15およびReact 19に準拠した国際化設定を提供します。
 * next-intl v4と統合されたSSR対応のi18n機能です。
 *
 * このファイルで提供される機能：
 * - 利用可能な言語の定義
 * - デフォルト言語の設定
 * - サーバーサイドでのメッセージ取得関数
 * - タイムゾーン設定
 */

import { getRequestConfig } from "next-intl/server";

// 利用可能な言語
export const locales = ["en", "ja"] as const;

// デフォルト言語
export const defaultLocale = "ja" as const;

// タイムゾーン設定
export const timeZone = "Asia/Tokyo";

// メッセージをインポートする関数（エラーハンドリング付き）
async function importMessages(locale: string) {
  try {
    return (await import(`./messages/${locale}.json`)).default;
  } catch (error) {
    console.error(`Failed to load messages for locale: ${locale}`, error);
    // エラーが発生した場合はデフォルトロケールのメッセージを試みる
    if (locale !== defaultLocale) {
      console.info(`Falling back to default locale: ${defaultLocale}`);
      return importMessages(defaultLocale);
    }
    return {}; // 最終的にはデフォルトロケールも失敗した場合は空オブジェクトを返す
  }
}

// SSR/CSR両方で使えるメッセージ取得関数
export async function getMessages(locale: string) {
  return importMessages(locale || defaultLocale);
}

// next-intl用のリクエスト設定
export default getRequestConfig(async ({ locale }) => {
  const actualLocale = locale || defaultLocale;
  const messages = await importMessages(actualLocale);
  return {
    messages,
    locale: actualLocale,
    timeZone,
  };
});
