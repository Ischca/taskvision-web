import type { Metadata, Viewport } from "next";
import { M_PLUS_Rounded_1c } from "next/font/google";
import "./globals.css";
import Header from "./components/Header";
import ThemeProvider from "./components/ThemeProvider";
import AuthProvider from "./components/AuthProvider";
import PWAComponents from "@/app/components/PWAComponents";

// M PLUS Rounded 1c フォントの設定
const mPlusRounded = M_PLUS_Rounded_1c({
    weight: ['400', '500', '700'],
    subsets: ["latin"],
    display: "swap",
    variable: "--font-m-plus-rounded",
});

export const metadata: Metadata = {
    title: "TaskVision - 日々のタスクをブロックで管理",
    description: "1日の流れを固定されたブロックで管理する、シンプルで使いやすいタスク管理アプリ",
    keywords: "タスク管理, スケジュール, 時間ブロック, 生産性向上",
    manifest: '/manifest.json',
    metadataBase: new URL('https://your-domain.com'),
    openGraph: {
        title: 'TaskVision - タスク管理アプリ',
        description: 'タイムブロッキングを活用した効率的なタスク管理',
        url: 'https://your-domain.com',
        siteName: 'TaskVision',
        locale: 'ja_JP',
        type: 'website',
    },
};

export const viewport: Viewport = {
    colorScheme: 'light',
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="ja" className="light" suppressHydrationWarning>
            <head>
                <meta name="color-scheme" content="light" />
                <meta name="theme-color" content="#ffffff" />
                <meta name="apple-mobile-web-app-capable" content="yes" />
                <meta name="apple-mobile-web-app-status-bar-style" content="default" />
                <meta name="apple-mobile-web-app-title" content="TaskVision" />
                <link rel="apple-touch-icon" href="/icons/apple-icon-180.png" />
            </head>
            <body className={`${mPlusRounded.variable} font-sans bg-white text-gray-900`}>
                <AuthProvider>
                    <ThemeProvider>
                        <PWAComponents />
                        <div className="flex flex-col min-h-screen">
                            <Header />
                            <main className="flex-grow py-6 px-4 md:px-6 lg:px-8 bg-gray-50">
                                {children}
                            </main>
                            <footer className="bg-white shadow-sm py-4 px-4 md:px-6 lg:px-8 text-center text-sm text-gray-500">
                                <p>© {new Date().getFullYear()} TaskVision - シンプルで使いやすいタスク管理ツール</p>
                            </footer>
                        </div>
                    </ThemeProvider>
                </AuthProvider>
            </body>
        </html>
    );
}