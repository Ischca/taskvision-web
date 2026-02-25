"use client";

import { useTranslations } from "./LocaleLayoutClient";
import Link from "next/link";
import { useParams } from "next/navigation";

export default function NotFound() {
  const t = useTranslations();
  const params = useParams();
  const locale = (params?.locale as string) || "ja";

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
        404
      </h1>
      <p className="text-lg text-gray-700 dark:text-gray-300 mb-8">
        {t("common.errors.pageNotFound")}
      </p>
      <Link
        href={`/${locale}`}
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
      >
        {t("common.backToHome")}
      </Link>
    </div>
  );
}
