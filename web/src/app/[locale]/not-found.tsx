"use client";

import { useTranslations } from "next-intl";
import Link from "next/link";

export default function NotFound() {
  const t = useTranslations("common");

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
        404
      </h1>
      <p className="text-lg text-gray-700 dark:text-gray-300 mb-8">
        {t("errors.pageNotFound")}
      </p>
      <Link
        href="/"
        className="px-4 py-2 bg-primary-500 text-white rounded hover:bg-primary-600 transition-colors"
      >
        {t("backToHome")}
      </Link>
    </div>
  );
}
