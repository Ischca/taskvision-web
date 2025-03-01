import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// 言語リソースをインポート
import jaTranslations from './locales/ja.json';
import enTranslations from './locales/en.json';

const resources = {
  ja: {
    translation: jaTranslations,
  },
  en: {
    translation: enTranslations,
  },
};

i18n
  // ブラウザの言語を自動検出
  .use(LanguageDetector)
  // react-i18nextを初期化
  .use(initReactI18next)
  // i18nの初期化
  .init({
    resources,
    fallbackLng: 'ja',
    debug: process.env.NODE_ENV === 'development',
    interpolation: {
      escapeValue: false, // XSS対策は不要（Reactが対応）
    },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
    },
  });

export default i18n;
