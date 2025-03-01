'use client';

import { ReactNode } from 'react';
import { NextIntlClientProvider } from 'next-intl';

// サポートされている言語
export const locales = ['en', 'ja'];

// デフォルトの言語
export const defaultLocale = 'ja';

// NextIntlClientProviderのクライアントサイドラッパー
type I18nProviderProps = {
    children: ReactNode;
    messages: Record<string, any>;
    locale: string;
};

/**
 * クライアントサイド専用のi18nプロバイダーコンポーネント
 * CSRのみの環境でnext-intlを使用するためのラッパー
 */
export default function I18nProvider({ children, messages, locale }: I18nProviderProps) {
    // サーバーとクライアントで同じ値を使用するために、ハードコードされた時間を使用
    const fixedDate = new Date(2023, 0, 1);

    return (
        <NextIntlClientProvider
            locale={locale}
            messages={messages}
            now={fixedDate}
            timeZone="Asia/Tokyo"
            onError={(error) => {
                console.error('NextIntl error:', error);
                return 'Translation error';
            }}
        >
            {children}
        </NextIntlClientProvider>
    );
}

// クライアントサイドでメッセージを動的にロードする関数
export async function loadMessages(locale: string): Promise<Record<string, any>> {
    try {
        // 動的にメッセージをインポート
        const localeMessages = await import(`@/messages/${locale}.json`);
        return localeMessages;
    } catch (error) {
        console.error(`Failed to load messages for locale: ${locale}`, error);

        // フォールバックとして日本語のメッセージを読み込む
        try {
            const fallbackMessages = await import('@/messages/ja.json');
            return fallbackMessages;
        } catch (fallbackError) {
            console.error('Failed to load fallback messages', fallbackError);
            return {};
        }
    }
} 