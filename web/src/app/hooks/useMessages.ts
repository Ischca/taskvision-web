'use client';

import { useParams } from 'next/navigation';
import { useMemo } from 'react';
import ja from '@/messages/ja.json';
import en from '@/messages/en.json';

type Messages = Record<string, any>;

/**
 * ページの現在のロケールに基づいてメッセージを取得するフック
 */
export function useMessages() {
  const params = useParams();

  // パラメータからロケールを取得（デフォルトは日本語）
  const locale = useMemo(() => {
    if (params && typeof params.locale === 'string') {
      return params.locale;
    }
    return 'ja';
  }, [params]);

  // ロケールに対応するメッセージを取得
  const messages = useMemo(() => {
    switch (locale) {
      case 'en':
        return en;
      case 'ja':
      default:
        return ja;
    }
  }, [locale]);

  // 翻訳関数
  const t = (key: string): string => {
    const keys = key.split('.');
    let value: any = messages;

    for (const k of keys) {
      if (value === undefined || value === null) return key;
      value = value[k];
    }

    if (typeof value !== 'string') {
      console.warn(`Translation key "${key}" does not resolve to a string`);
      return key;
    }

    return value;
  };

  return { messages, locale, t };
}
