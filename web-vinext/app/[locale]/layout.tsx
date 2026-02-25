import { locales } from "../../src/lib/i18n";
import { LocaleLayoutClient } from "./LocaleLayoutClient";

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  // サーバーサイドでメッセージを読み込み
  const { getMessages } = await import("../../src/lib/i18n");
  const messages = await getMessages(locale);

  return <LocaleLayoutClient locale={locale} messages={messages}>{children}</LocaleLayoutClient>;
}
