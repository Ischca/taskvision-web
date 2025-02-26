"use client";

import { FC, useEffect, useState } from "react";
import Link from "next/link";
import {
    Cog6ToothIcon,
    CalendarIcon,
    ClockIcon,
    SunIcon,
    MoonIcon,
    Squares2X2Icon,
    DevicePhoneMobileIcon,
    UserCircleIcon,
    ArrowRightOnRectangleIcon
} from "@heroicons/react/24/outline";
import { usePathname, useRouter } from "next/navigation";
import { useTheme } from "./ThemeProvider";
import { useAuth } from "./AuthProvider";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";

const Header: FC = () => {
    const pathname = usePathname();
    const router = useRouter();
    const { theme, toggleTheme } = useTheme();
    const [mounted, setMounted] = useState(false);
    const { user, userId, loading } = useAuth();

    // クライアントサイドでのみレンダリングを確実にする
    useEffect(() => {
        setMounted(true);
    }, []);

    // 現在のパスがアクティブかどうかを判定
    const isActive = (path: string) => {
        return pathname === path;
    };

    // ログアウト処理
    const handleLogout = async () => {
        try {
            await signOut(auth);
            router.push("/login");
        } catch (error) {
            console.error("ログアウトエラー:", error);
        }
    };

    // アクティブリンクのスタイル
    const activeLinkStyle = "text-primary border-b-2 border-primary";

    // サーバーサイドレンダリング時は最小限の内容を表示
    if (!mounted) {
        return <header className="bg-white shadow-sm sticky top-0 z-10 h-16"></header>;
    }

    return (
        <header className={`sticky top-0 z-10 shadow-sm ${theme === 'dark' ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'}`}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    <div className="flex">
                        <Link
                            href="/"
                            className={`flex items-center gap-2 px-2 py-2 rounded-lg transition-colors ${theme === 'dark' ? 'text-white hover:bg-gray-700' : 'text-gray-900 hover:bg-gray-100'}`}
                        >
                            <ClockIcon className="h-7 w-7 text-primary" />
                            <span className="text-xl font-bold">TaskVision</span>
                        </Link>

                        <nav className="hidden sm:ml-6 sm:flex sm:space-x-4 items-center">
                            <Link
                                href="/"
                                className={`px-3 py-2 text-sm font-medium hover:text-primary transition-colors ${isActive("/") ? activeLinkStyle : theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}
                            >
                                ホーム
                            </Link>
                            <Link
                                href="/calendar"
                                className={`px-3 py-2 text-sm font-medium hover:text-primary transition-colors ${isActive("/calendar") ? activeLinkStyle : theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}
                            >
                                カレンダー
                            </Link>
                            <Link
                                href="/blocks/manage"
                                className={`px-3 py-2 text-sm font-medium hover:text-primary transition-colors ${isActive("/blocks/manage") ? activeLinkStyle : theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}
                            >
                                ブロック管理
                            </Link>
                        </nav>
                    </div>

                    <div className="flex items-center gap-2">
                        {/* テーマ切り替えボタン */}
                        <button
                            onClick={toggleTheme}
                            className={`p-2 rounded-full transition-colors ${theme === 'dark' ? 'text-gray-300 hover:text-white hover:bg-gray-700' : 'text-gray-600 hover:text-primary hover:bg-gray-100'}`}
                            aria-label={theme === "light" ? "ダークモードに切り替え" : "ライトモードに切り替え"}
                        >
                            {theme === "light" ? (
                                <MoonIcon className="h-5 w-5" />
                            ) : (
                                <SunIcon className="h-5 w-5" />
                            )}
                        </button>

                        {/* ログイン状態に応じた表示 */}
                        {!loading && (
                            userId ? (
                                <div className="hidden sm:flex items-center">
                                    <div className="dropdown dropdown-end">
                                        <label
                                            tabIndex={0}
                                            className={`flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer transition-colors ${theme === 'dark' ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-600 hover:bg-gray-100'}`}
                                        >
                                            <UserCircleIcon className="h-5 w-5" />
                                            <span className="text-sm font-medium">{user?.displayName || 'ユーザー'}</span>
                                        </label>
                                        <ul
                                            tabIndex={0}
                                            className={`mt-3 p-2 shadow menu dropdown-content rounded-box w-52 z-10 ${theme === 'dark' ? 'bg-gray-800 text-gray-200' : 'bg-white text-gray-700'}`}
                                        >
                                            <li>
                                                <Link href="/profile">
                                                    プロフィール
                                                </Link>
                                            </li>
                                            <li>
                                                <button onClick={handleLogout} className="flex items-center text-red-500">
                                                    <ArrowRightOnRectangleIcon className="h-4 w-4 mr-2" />
                                                    ログアウト
                                                </button>
                                            </li>
                                        </ul>
                                    </div>
                                </div>
                            ) : (
                                <Link
                                    href="/login"
                                    className={`hidden sm:flex items-center px-4 py-2 rounded-md text-sm font-medium ${theme === 'dark' ? 'bg-primary-600 text-white hover:bg-primary-700' : 'bg-primary-500 text-white hover:bg-primary-600'}`}
                                >
                                    <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24">
                                        <path
                                            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                            fill="#FFFFFF"
                                        />
                                        <path
                                            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                            fill="#FFFFFF"
                                        />
                                        <path
                                            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                            fill="#FFFFFF"
                                        />
                                        <path
                                            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                            fill="#FFFFFF"
                                        />
                                    </svg>
                                    Googleでログイン
                                </Link>
                            )
                        )}

                        {/* モバイルメニュー（sm以下で表示） */}
                        <div className="sm:hidden">
                            <div className="dropdown dropdown-end">
                                <label tabIndex={0} className={`btn btn-ghost btn-circle ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                                    <Squares2X2Icon className="h-5 w-5" />
                                </label>
                                <ul
                                    tabIndex={0}
                                    className={`mt-3 p-2 shadow menu dropdown-content rounded-box w-52 z-10 ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}
                                >
                                    <li>
                                        <Link href="/" className={isActive("/") ? "font-bold text-primary" : ""}>
                                            ホーム
                                        </Link>
                                    </li>
                                    <li>
                                        <Link
                                            href="/calendar"
                                            className={isActive("/calendar") ? "font-bold text-primary" : ""}
                                        >
                                            カレンダー
                                        </Link>
                                    </li>
                                    <li>
                                        <Link
                                            href="/blocks/manage"
                                            className={isActive("/blocks/manage") ? "font-bold text-primary" : ""}
                                        >
                                            ブロック管理
                                        </Link>
                                    </li>

                                    {/* ログイン状態に応じた表示（モバイル用） */}
                                    {!loading && (
                                        userId ? (
                                            <>
                                                <li>
                                                    <Link href="/profile">プロフィール</Link>
                                                </li>
                                                <li>
                                                    <button onClick={handleLogout} className="text-red-500">
                                                        ログアウト
                                                    </button>
                                                </li>
                                            </>
                                        ) : (
                                            <li>
                                                <Link href="/login" className="flex items-center">
                                                    <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24">
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
                                                    Googleでログイン
                                                </Link>
                                            </li>
                                        )
                                    )}

                                    <li>
                                        <Link href="/pwa-guide" className="flex items-center">
                                            <DevicePhoneMobileIcon className="h-4 w-4 mr-2" />
                                            アプリインストール
                                        </Link>
                                    </li>
                                </ul>
                            </div>
                        </div>

                        {/* 設定メニュー（デスクトップ用） */}
                        <div className="hidden sm:block">
                            <div className="dropdown dropdown-end">
                                <label
                                    tabIndex={0}
                                    className={`btn btn-ghost btn-circle ${theme === 'dark' ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-600 hover:bg-gray-100'}`}
                                >
                                    <Cog6ToothIcon className="h-5 w-5" />
                                </label>
                                <ul
                                    tabIndex={0}
                                    className={`mt-3 p-2 shadow menu dropdown-content rounded-box w-52 z-10 ${theme === 'dark' ? 'bg-gray-800 text-gray-200' : 'bg-white text-gray-700'}`}
                                >
                                    <li>
                                        <Link href="/help">
                                            ヘルプ
                                        </Link>
                                    </li>
                                    <li>
                                        <Link href="/pwa-guide" className="flex items-center">
                                            <DevicePhoneMobileIcon className="h-4 w-4 mr-2" />
                                            アプリインストール
                                        </Link>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;