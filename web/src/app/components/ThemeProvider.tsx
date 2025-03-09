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

        // メタタグを動的に更新
        let themeColorMeta = document.querySelector('meta[name="theme-color"]');
        if (!themeColorMeta) {
            themeColorMeta = document.createElement('meta');
            themeColorMeta.setAttribute('name', 'theme-color');
            document.head.appendChild(themeColorMeta);
        }
        themeColorMeta.setAttribute('content', newTheme === 'dark' ? '#1f2937' : '#ffffff');

        // ダークモード用のクラスをbodyに適用
        if (newTheme === 'dark') {
            document.documentElement.classList.add('dark');
            document.body.classList.add('dark-mode');
            document.body.classList.remove('light-mode');
            document.body.classList.add('bg-gray-900', 'text-gray-100');
            document.body.classList.remove('bg-white', 'text-gray-900');
        } else {
            document.documentElement.classList.remove('dark');
            document.body.classList.add('light-mode');
            document.body.classList.remove('dark-mode');
            document.body.classList.add('bg-white', 'text-gray-900');
            document.body.classList.remove('bg-gray-900', 'text-gray-100');
        }

        // スタイルシートの再計算を強制するハック
        // これによりブラウザが再計算を強制されTailwindのダークモードが即座に反映される
        const tempStyle = document.createElement('style');
        document.head.appendChild(tempStyle);
        document.head.removeChild(tempStyle);

    };

    // システムのカラースキーム設定を取得する関数
    const getSystemTheme = () => {
        if (typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            return 'dark';
        }
        return 'light';
    };

    // 初期化時にテーマを設定
    useEffect(() => {
        setMounted(true);
        try {
            // ストレージから保存されたテーマを取得
            let storedTheme = null;
            try {
                storedTheme = localStorage.getItem("theme");
            } catch (e) {
                console.warn("ローカルストレージへのアクセスエラー:", e);
            }

            // ユーザーが明示的に設定したテーマがあればそれを使用、なければシステム設定を使用
            const initialTheme = storedTheme || getSystemTheme();

            setTheme(initialTheme);
            updateTheme(initialTheme);
        } catch (e) {
            console.error("テーマ初期化エラー:", e);
            // エラー時はデフォルトテーマを適用
            setTheme("light");
            updateTheme("light");
        }
    }, []);

    // システムテーマの変更を監視するが、ユーザーが明示的に設定した場合は無視
    useEffect(() => {
        if (!mounted) return;

        // システムテーマの変更を監視
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

        const handleSystemThemeChange = (e: MediaQueryListEvent) => {
            const userTheme = localStorage.getItem("theme");
            // ユーザーが明示的にテーマを設定していない場合のみシステムテーマを適用
            if (!userTheme) {
                const newTheme = e.matches ? 'dark' : 'light';
                setTheme(newTheme);
                updateTheme(newTheme);
            }
        };

        mediaQuery.addEventListener('change', handleSystemThemeChange);

        return () => {
            mediaQuery.removeEventListener('change', handleSystemThemeChange);
        };
    }, [mounted]);

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