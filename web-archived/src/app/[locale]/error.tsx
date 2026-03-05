"use client";

import { useEffect } from "react";
import { useTranslations } from "next-intl";
import Link from "next/link";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const t = useTranslations("common");

  useEffect(() => {
    // エラーをログに記録
    console.error("アプリケーションエラー:", error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
        {t("errors.somethingWentWrong")}
      </h1>
      <p className="text-lg text-gray-700 dark:text-gray-300 mb-8">
        {t("errors.pleaseReload")}
      </p>
      <div className="flex flex-col sm:flex-row gap-4">
        <button
          onClick={() => reset()}
          className="px-4 py-2 bg-primary-500 text-white rounded hover:bg-primary-600 transition-colors"
        >
          {t("actions.update")}
        </button>
        <Link
          href="/"
          className="px-4 py-2 bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-white rounded hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors text-center"
        >
          {t("backToHome")}
        </Link>
      </div>
    </div>
  );
}
