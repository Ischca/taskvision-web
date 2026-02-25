export const locales = ["ja", "en"] as const;
export const defaultLocale = "ja" as const;
export type Locale = (typeof locales)[number];

// メッセージの型（深くネスト可能）
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Messages = Record<string, any>;

const messageCache = new Map<string, Messages>();

export async function getMessages(locale: string): Promise<Messages> {
  if (messageCache.has(locale)) {
    return messageCache.get(locale)!;
  }

  try {
    const messages = (await import(`../messages/${locale}.json`)).default;
    messageCache.set(locale, messages);
    return messages;
  } catch {
    const fallback = (await import(`../messages/${defaultLocale}.json`))
      .default;
    messageCache.set(locale, fallback);
    return fallback;
  }
}

/**
 * ドット区切りキーでネストされたメッセージを解決する
 * 例: resolve(messages, "common.actions.login") → "ログイン"
 */
function resolve(messages: Messages, key: string): string {
  const parts = key.split(".");
  let current: unknown = messages;
  for (const part of parts) {
    if (current && typeof current === "object" && part in current) {
      current = (current as Record<string, unknown>)[part];
    } else {
      return key;
    }
  }
  return typeof current === "string" ? current : key;
}

/**
 * next-intl の useTranslations() 互換の翻訳関数を生成する
 * t("common.actions.login") のようにフルパスで使える
 */
export function createTranslator(messages: Messages) {
  return function t(key: string): string {
    return resolve(messages, key);
  };
}
