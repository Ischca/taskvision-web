import { createSharedPathnamesNavigation } from "next-intl/navigation";

// 利用可能な言語
export const locales = ["en", "ja"] as const;

// デフォルト言語
export const defaultLocale = "ja" as const;

// SSRモードで最適化するための設定
export const skipInitialDataFetch = false;

// タイムゾーン設定
export const timeZone = "Asia/Tokyo";

// パス生成ヘルパー - SSRモードを活用
export const { Link, redirect, usePathname, useRouter } =
  createSharedPathnamesNavigation({
    locales,
    defaultLocale,
  });

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
  return importMessages(locale);
}

// SSRモードに最適化された設定
export default async function getI18nConfig(locale: string) {
  const messages = await importMessages(locale);

  return {
    // 現在の日時を使用してSSRで正確な値を提供
    now: new Date(),
    // サーバーサイドでメッセージを読み込む
    messages,
    // タイムゾーン設定
    timeZone,
    // エラーハンドリング
    onError: (error: any) => {
      console.error("i18n error:", error);
      return null;
    },
  };
}
