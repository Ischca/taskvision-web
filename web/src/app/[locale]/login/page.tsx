"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { auth } from "@/lib/firebase";
import {
    GoogleAuthProvider,
    signInWithPopup
} from "firebase/auth";
import { useAuth } from "@/app/components/AuthProvider";
import { Link } from "@/app/components/Link";
import { useParams } from "next/navigation";
import { loadMessages } from "@/app/components/i18n";
import { locales } from "@/i18n";

export function generateStaticParams() {
    return locales.map((locale) => ({ locale }));
}

export default function LoginPage() {
    const router = useRouter();
    const { userId, loading: authLoading } = useAuth();
    const [errorMessage, setErrorMessage] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    // i18n
    const params = useParams();
    const locale = (params?.locale as string) || 'ja';
    const [messages, setMessages] = useState<Record<string, any>>({});
    const [messagesLoading, setMessagesLoading] = useState(true);

    // メッセージのロード
    useEffect(() => {
        const loadMessageData = async () => {
            const loadedMessages = await loadMessages(locale);
            setMessages(loadedMessages);
            setMessagesLoading(false);
        };
        loadMessageData();
    }, [locale]);

    // 翻訳関数
    const t = (key: string) => {
        try {
            // common.key形式またはauth.key形式のキーを処理
            const parts = key.split('.');
            let current = messages;

            for (const part of parts) {
                if (current && typeof current === 'object' && part in current) {
                    current = current[part];
                } else {
                    return key; // キーが見つからない場合はキー自体を返す
                }
            }

            return current && typeof current === 'string' ? current : key;
        } catch (error) {
            console.error('Translation error:', error);
            return key; // エラーが発生した場合はキー自体を返す
        }
    };

    // ログイン済みの場合はホームにリダイレクト
    useEffect(() => {
        if (!authLoading && userId) {
            router.push(`/${locale}`);
        }
    }, [authLoading, userId, router, locale]);

    // Googleでログイン
    const handleGoogleLogin = async () => {
        setErrorMessage("");
        setIsSubmitting(true);

        try {
            const provider = new GoogleAuthProvider();
            await signInWithPopup(auth, provider);
            router.push(`/${locale}`);
        } catch (error: any) {
            console.error("Googleログインエラー:", error);
            setErrorMessage(t('auth.errors.googleLoginFailed'));
        } finally {
            setIsSubmitting(false);
        }
    };

    if (authLoading || messagesLoading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                    <p className="mt-4 text-lg">{t('common.states.loading')}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
            <div className="w-full max-w-md space-y-8">
                <div className="text-center">
                    <h1 className="text-3xl font-bold">TaskVision</h1>
                    <h2 className="mt-6 text-2xl font-bold text-gray-900">
                        {t('auth.login.title')}
                    </h2>
                </div>

                {errorMessage && (
                    <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
                        <div className="flex">
                            <div className="flex-shrink-0">
                                <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <div className="ml-3">
                                <p className="text-sm text-red-700">{errorMessage}</p>
                            </div>
                        </div>
                    </div>
                )}

                <div className="mt-8">
                    <button
                        onClick={handleGoogleLogin}
                        className="btn btn-primary w-full flex items-center justify-center bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
                        disabled={isSubmitting}
                    >
                        <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24">
                            <path
                                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                fill="#4285F4"
                            />
                            <path
                                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                fill="#34A853"
                            />
                            <path
                                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                fill="#FBBC05"
                            />
                            <path
                                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                fill="#EA4335"
                            />
                        </svg>
                        {t('auth.login.googleButton')}
                    </button>

                    <div className="mt-6 text-center">
                        <p className="text-sm text-gray-600">
                            {t('auth.login.noAccount')}{' '}
                            <Link
                                href="/signup"
                                className="text-blue-600 hover:text-blue-500"
                            >
                                {t('auth.login.signup')}
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
} 