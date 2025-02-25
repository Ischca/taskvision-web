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
    DevicePhoneMobileIcon
} from "@heroicons/react/24/outline";
import { usePathname } from "next/navigation";
import { useTheme } from "./ThemeProvider";

const Header: FC = () => {
    const pathname = usePathname();
    const { theme, toggleTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    // クライアントサイドでのみレンダリングを確実にする
    useEffect(() => {
        setMounted(true);
    }, []);

    // 現在のパスがアクティブかどうかを判定
    const isActive = (path: string) => {
        return pathname === path;
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
                                    <li>
                                        <Link href="/settings">設定</Link>
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
                                        <Link href="/settings">
                                            設定
                                        </Link>
                                    </li>
                                    <li>
                                        <Link href="/profile">
                                            プロフィール
                                        </Link>
                                    </li>
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