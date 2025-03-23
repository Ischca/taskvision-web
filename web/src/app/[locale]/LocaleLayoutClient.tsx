"use client";

import { ReactNode, useEffect, useState } from "react";
import { AuthProvider } from "../components/AuthProvider";
import ThemeProvider from "../components/ThemeProvider";
import Header from "../components/Header";
import { NextIntlClientProvider } from "next-intl";
import { useParams } from "next/navigation";
import PWAComponents from "../components/PWAComponents";
import OfflineDetector from "../components/OfflineDetector";

// 一定の固定フッターを定義（年は固定値を使用）
const FooterContent = () => (
  <footer className="bg-white shadow-sm py-4 px-4 md:px-6 lg:px-8 text-center text-sm text-gray-500">
    <p suppressHydrationWarning>
      © 2025 TaskVision - Simple and easy-to-use task management tool
    </p>
  </footer>
);

export default function LocaleLayoutClient({
  children,
  messages,
}: {
  children: React.ReactNode;
  messages: Record<string, any>;
}) {
  const params = useParams();
  const [locale, setLocale] = useState<string>("ja");

  // 非同期APIに対応するため、useEffect内でパラメータを処理
  useEffect(() => {
    const fetchParams = async () => {
      // params自体がPromiseになっているため、awaitで解決する
      const resolvedParams = await Promise.resolve(params);
      const localeValue = (resolvedParams?.locale as string) || "ja";
      setLocale(localeValue);
    };

    fetchParams().catch(console.error);
  }, [params]);

  return (
    <NextIntlClientProvider
      locale={locale}
      messages={messages}
      timeZone="Asia/Tokyo"
      onError={(error) => {
        console.error("NextIntl error:", error);
        return "Translation error";
      }}
    >
      <AuthProvider>
        <ThemeProvider>
          <PWAComponents />
          <div className="flex flex-col min-h-screen">
            <Header />
            <main className="flex-grow py-6 px-4 md:px-6 lg:px-8 bg-gray-50">
              {children}
            </main>
            <FooterContent />
          </div>
        </ThemeProvider>
      </AuthProvider>
    </NextIntlClientProvider>
  );
}
