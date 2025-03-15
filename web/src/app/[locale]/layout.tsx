import { ReactNode } from "react";
import { locales } from "@/i18n";

// 静的生成のためのパラメータを提供
export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

// クライアントコンポーネントをインポート
import LocaleLayoutClient from "./LocaleLayoutClient";

export default function LocaleLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <LocaleLayoutClient>{children}</LocaleLayoutClient>;
}
