"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { detectLocale, getRootTranslation } from "@/lib/detectLocale";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const [locale, setLocale] = useState("ja");

  useEffect(() => {
    setLocale(detectLocale());
  }, []);

  useEffect(() => {
    console.error(error);
  }, [error]);

  const t = (key: string) => getRootTranslation(key, locale);

  return (
    <html lang={locale}>
      <body>
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
          <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full text-center">
            <h1 className="text-3xl font-bold text-gray-800 mb-4">
              {t("globalError.title")}
            </h1>
            <p className="text-gray-600 mb-6">
              {t("globalError.description")}
            </p>
            <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3 justify-center">
              <button
                onClick={() => reset()}
                className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
              >
                {t("error.retry")}
              </button>
              <Link
                href={`/${locale}`}
                className="px-6 py-3 bg-gray-200 text-gray-800 font-medium rounded-lg hover:bg-gray-300 transition-colors"
              >
                {t("error.home")}
              </Link>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}
