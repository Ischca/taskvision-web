import { ReactNode } from "react";
import { locales } from "@/i18n";
import { getMessages } from "@/i18n";
import { getTranslations } from "next-intl/server";

// 静的生成のためのパラメータを提供
export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

// クライアントコンポーネントをインポート
import LocaleLayoutClient from "./LocaleLayoutClient";

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  // Next.js 15に対応するため、paramsをawaitする
  const { locale } = await params;

  // サーバーサイドでメッセージを取得
  const messages = await getMessages(locale);

  // クライアントコンポーネントにメッセージを渡す
  return (
    <LocaleLayoutClient messages={messages}>{children}</LocaleLayoutClient>
  );
}
