'use client';

import { ReactNode, Suspense, useEffect, useState } from 'react';
import AuthProvider from '../components/AuthProvider';
import ThemeProvider from '../components/ThemeProvider';
import Header from "../components/Header";
import I18nProvider, { loadMessages } from '../components/i18n';
import { useParams } from 'next/navigation';
import ClientOnly from '../components/ClientOnly';
import PWAComponents from '../components/PWAComponents';
import OfflineDetector from '../components/OfflineDetector';
import { locales } from "@/i18n";

// 一定の固定フッターを定義（年は固定値を使用）
const FooterContent = () => (
    <footer className="bg-white shadow-sm py-4 px-4 md:px-6 lg:px-8 text-center text-sm text-gray-500">
        <p suppressHydrationWarning>© 2025 TaskVision - Simple and easy-to-use task management tool</p>
    </footer>
);

// 空のエンプティヘッダーコンポーネント - サーバーとクライアントで一致させるため
const EmptyHeader = () => (
    <header className="bg-white shadow-sm sticky top-0 z-10 h-16"></header>
);

// ローディングコンポーネント
const LoadingContent = () => (
    <div className="flex flex-col min-h-screen">
        <EmptyHeader />
        <main className="flex-grow py-6 px-4 md:px-6 lg:px-8 bg-gray-50">
            <div className="flex justify-center items-center min-h-[60vh]">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        </main>
        <FooterContent />
    </div>
);

export function generateStaticParams() {
    return locales.map((locale) => ({ locale }));
}

export default function LocaleLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const params = useParams();
    const [messages, setMessages] = useState<Record<string, any>>({});
    const [isLoading, setIsLoading] = useState(true);
    const [isMounted, setIsMounted] = useState(false);

    // クライアントサイドでlocaleを取得
    const locale = (params?.locale as string) || 'ja';

    // コンポーネントがマウントされたことを確認
    useEffect(() => {
        setIsMounted(true);
    }, []);

    // クライアントサイドでメッセージを非同期に読み込む
    useEffect(() => {
        if (!isMounted) return;

        const fetchMessages = async () => {
            setIsLoading(true);
            try {
                const loadedMessages = await loadMessages(locale);
                setMessages(loadedMessages);
            } catch (error) {
                console.error('Failed to load messages:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchMessages();
    }, [locale, isMounted]);

    // 常に同じ構造を返す
    return (
        <>
            {(!isMounted || isLoading) ? (
                <LoadingContent />
            ) : (
                <I18nProvider locale={locale} messages={messages}>
                    <AuthProvider>
                        <ThemeProvider>
                            <PWAComponents />
                            <div className="flex flex-col min-h-screen">
                                <Header messages={messages} />
                                <main className="flex-grow py-6 px-4 md:px-6 lg:px-8 bg-gray-50">
                                    {children}
                                </main>
                                <FooterContent />
                            </div>
                        </ThemeProvider>
                    </AuthProvider>
                </I18nProvider>
            )}
        </>
    );
} 