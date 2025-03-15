// 静的生成のためのパラメータを提供する共有関数
import { locales } from "@/i18n";

// 動的ルートのパラメータを生成する関数
// この関数はサーバーコンポーネントでのみ使用されるべきです
export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

// クライアントコンポーネントで使用するための関数
// これはビルド時には使用されず、実行時のみ使用されます
export function getStaticLocales() {
  return locales;
}
