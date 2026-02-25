"use client";

import { createContext, useContext, ReactNode } from "react";
import { Messages, createTranslator } from "../../src/lib/i18n";
import PWAComponents from "../../src/app/components/PWAComponents";

interface I18nContextValue {
  locale: string;
  messages: Messages;
  t: (key: string) => string;
}

const I18nContext = createContext<I18nContextValue | null>(null);

/**
 * next-intl の useTranslations() と同等のAPI
 * 全コンポーネントで t("common.actions.login") のように使える
 */
export function useTranslations() {
  const ctx = useContext(I18nContext);
  if (!ctx)
    throw new Error("useTranslations must be used within LocaleLayoutClient");
  return ctx.t;
}

/**
 * locale と messages にアクセスするフック
 */
export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx)
    throw new Error("useI18n must be used within LocaleLayoutClient");
  return ctx;
}

export function LocaleLayoutClient({
  locale,
  messages,
  children,
}: {
  locale: string;
  messages: Messages;
  children: ReactNode;
}) {
  const t = createTranslator(messages);

  return (
    <I18nContext.Provider value={{ locale, messages, t }}>
      {children}
      <PWAComponents />
    </I18nContext.Provider>
  );
}
