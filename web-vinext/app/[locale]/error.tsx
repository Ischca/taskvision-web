"use client";

import { useEffect } from "react";
import { useTranslations } from "./LocaleLayoutClient";
import Link from "next/link";
import { useParams } from "next/navigation";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const t = useTranslations();
  const params = useParams();
  const locale = (params?.locale as string) || "ja";

  useEffect(() => {
    console.error("Application error:", error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
        {t("common.errors.somethingWentWrong")}
      </h1>
      <p className="text-lg text-gray-700 dark:text-gray-300 mb-8">
        {t("common.errors.pleaseReload")}
      </p>
      <div className="flex flex-col sm:flex-row gap-4">
        <button
          onClick={() => reset()}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
        >
          {t("common.actions.update")}
        </button>
        <Link
          href={`/${locale}`}
          className="px-4 py-2 bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-white rounded hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors text-center"
        >
          {t("common.backToHome")}
        </Link>
      </div>
    </div>
  );
}
