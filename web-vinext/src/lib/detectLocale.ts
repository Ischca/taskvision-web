export function detectLocale(): string {
  if (typeof window === "undefined") return "ja";
  const match = window.location.pathname.match(/^\/(ja|en)/);
  return match ? match[1] : "ja";
}

const translations: Record<string, Record<string, string>> = {
  ja: {
    "error.title": "エラーが発生しました",
    "error.description": "申し訳ありませんが、予期せぬエラーが発生しました。",
    "error.retry": "再試行",
    "error.home": "ホームに戻る",
    "notFound.title": "ページが見つかりません",
    "notFound.description":
      "お探しのページは存在しないか、移動された可能性があります。",
    "globalError.title": "致命的なエラーが発生しました",
    "globalError.description":
      "申し訳ありませんが、システムエラーが発生しました。",
    "offline.title": "オフラインです",
    "offline.description":
      "インターネットに接続されていないため、TaskVisionの一部の機能が利用できません。接続が回復したら自動的にリロードされます。",
    "offline.reload": "再読み込み",
    "offline.note":
      "オフラインモードではキャッシュされたデータのみアクセス可能です",
  },
  en: {
    "error.title": "Something went wrong",
    "error.description": "We're sorry, but an unexpected error occurred.",
    "error.retry": "Retry",
    "error.home": "Back to Home",
    "notFound.title": "Page not found",
    "notFound.description":
      "The page you're looking for doesn't exist or has been moved.",
    "globalError.title": "Fatal error occurred",
    "globalError.description":
      "We're sorry, but a system error occurred.",
    "offline.title": "You are offline",
    "offline.description":
      "Some features of TaskVision are unavailable because you're not connected to the internet. The page will reload automatically when the connection is restored.",
    "offline.reload": "Reload",
    "offline.note": "Only cached data is accessible in offline mode",
  },
};

export function getRootTranslation(key: string, locale?: string): string {
  const l = locale || detectLocale();
  return translations[l]?.[key] || translations["ja"][key] || key;
}
