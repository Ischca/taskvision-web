import { createSharedPathnamesNavigation } from 'next-intl/navigation';

// 利用可能な言語
export const locales = ['en', 'ja'] as const;

// デフォルト言語
export const defaultLocale = 'ja' as const;

// クライアントサイドレンダリング（CSR）に最適化するための設定
export const skipInitialDataFetch = true;

// CSR専用の設定
export const timeZone = 'Asia/Tokyo';

// パス生成ヘルパー - CSRとの互換性を向上
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

// クライアントコンポーネント用のメッセージ取得関数
export async function getMessages(locale: string) {
  return importMessages(locale);
}

// CSRモードに最適化された設定
export default async function getI18nConfig() {
  return {
    // 固定された日付を使用してサーバー/クライアント間の差異を防ぐ
    now: new Date('2023-01-01'),
    // メッセージは動的に読み込む（CSRでの運用を優先）
    messages: {},
    // タイムゾーン設定
    timeZone,
    // クライアントのみの処理を優先
    onError: (error: any) => {
      console.warn('i18n error:', error);
      return '';
    },
  };
}
