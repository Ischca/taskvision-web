"use client";

import { ReactNode, createContext, useContext, useEffect, useState } from "react";

// テーマコンテキストの型定義
type ThemeContextType = {
    theme: string;
    toggleTheme: () => void;
};

// テーマコンテキストの作成（デフォルト値を設定）
const ThemeContext = createContext<ThemeContextType>({
    theme: "light",
    toggleTheme: () => { }
});

// テーマコンテキストを使用するカスタムフック
export const useTheme = () => {
    return useContext(ThemeContext);
};

// テーマプロバイダーコンポーネント
export default function ThemeProvider({ children }: { children: ReactNode }) {
    const [theme, setTheme] = useState<string>("light");
    const [mounted, setMounted] = useState(false);

    // テーマの切り替え関数
    const toggleTheme = () => {
        const newTheme = theme === "light" ? "dark" : "light";
        console.log(`テーマを切り替えます: ${theme} → ${newTheme}`);
        setTheme(newTheme);
        localStorage.setItem("theme", newTheme);
        updateTheme(newTheme);
    };

    // テーマの更新を適用する関数
    const updateTheme = (newTheme: string) => {
        // 現在のクラスをリセット
        document.documentElement.classList.remove("dark", "light");

        // 新しいテーマクラスを追加
        document.documentElement.classList.add(newTheme);

        // daisyUI用のテーマ属性を設定
        document.documentElement.setAttribute("data-theme", newTheme);
        document.documentElement.style.colorScheme = newTheme;

        // ダークモード用のクラスをbodyから削除（Tailwindの動作のため）
        if (newTheme === 'dark') {
            document.body.classList.add('dark-mode');
            document.body.classList.remove('light-mode');
        } else {
            document.body.classList.add('light-mode');
            document.body.classList.remove('dark-mode');
        }

        // デバッグ情報
        console.log(`テーマ適用完了: ${newTheme}`);
        console.log("HTML classes:", document.documentElement.className);
    };

    // 初期化時にテーマを設定
    useEffect(() => {
        setMounted(true);
        try {
            // ストレージから保存されたテーマを取得するか、デフォルトとしてlightを使用
            let storedTheme = "light";
            try {
                const saved = localStorage.getItem("theme");
                if (saved) {
                    storedTheme = saved;
                }
            } catch (e) {
                console.warn("ローカルストレージへのアクセスエラー:", e);
            }

            console.log("初期テーマを設定します:", storedTheme);
            setTheme(storedTheme);
            updateTheme(storedTheme);
        } catch (e) {
            console.error("テーマ初期化エラー:", e);
            // エラー時はデフォルトテーマを適用
            setTheme("light");
            updateTheme("light");
        }
    }, []);

    // テーマが変更されたときの処理
    useEffect(() => {
        if (mounted) {
            updateTheme(theme);
        }
    }, [theme, mounted]);

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
} 