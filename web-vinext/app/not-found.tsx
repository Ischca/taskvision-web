"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { detectLocale, getRootTranslation } from "@/lib/detectLocale";

export default function NotFound() {
  const [locale, setLocale] = useState("ja");

  useEffect(() => {
    setLocale(detectLocale());
  }, []);

  const t = (key: string) => getRootTranslation(key, locale);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
      <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full text-center">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">
          404 - {t("notFound.title")}
        </h1>
        <p className="text-gray-600 mb-6">
          {t("notFound.description")}
        </p>
        <Link
          href={`/${locale}`}
          className="inline-block px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
        >
          {t("error.home")}
        </Link>
      </div>
    </div>
  );
}
