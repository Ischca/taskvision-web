'use client';

import { ReactNode } from 'react';
import { NextIntlClientProvider } from 'next-intl';

type NextIntlClientProviderWrapperProps = {
    messages: Record<string, any>;
    locale: string;
    children: ReactNode;
    timeZone?: string;
};

/**
 * NextIntlClientProviderのクライアントサイドラッパー
 * onErrorなどの非シリアライズ可能なプロパティをここで定義することで、
 * サーバーコンポーネントからクライアントコンポーネントへの関数の受け渡しを避ける
 */
export default function NextIntlClientProviderWrapper({
    messages,
    locale,
    children,
    timeZone
}: NextIntlClientProviderWrapperProps) {
    return (
        <NextIntlClientProvider
            locale={locale}
            messages={messages}
            now={new Date()}
            timeZone={timeZone}
            onError={(error) => {
                console.error('NextIntl error:', error);
                return 'Translation error';
            }}
        >
            {children}
        </NextIntlClientProvider>
    );
} 