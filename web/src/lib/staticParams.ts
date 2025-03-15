// 静的生成のためのパラメータを提供する共有関数
import { locales } from '@/i18n';

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}
