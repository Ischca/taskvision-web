"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CloudIcon, ArrowPathIcon } from "@heroicons/react/24/outline";
import { detectLocale, getRootTranslation } from "@/lib/detectLocale";

export default function Offline() {
  const [locale, setLocale] = useState("ja");

  useEffect(() => {
    setLocale(detectLocale());
  }, []);

  useEffect(() => {
    const handleOnline = () => {
      window.location.href = `/${locale}`;
    };

    window.addEventListener("online", handleOnline);
    return () => window.removeEventListener("online", handleOnline);
  }, [locale]);

  const handleReload = () => {
    window.location.reload();
  };

  const t = (key: string) => getRootTranslation(key, locale);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
      <div className="text-center max-w-md">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <CloudIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            {t("offline.title")}
          </h1>
          <p className="text-gray-600 mb-6">
            {t("offline.description")}
          </p>
          <div className="flex flex-col space-y-3">
            <button
              onClick={handleReload}
              className="w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-primary-600 hover:bg-primary-700"
            >
              <ArrowPathIcon className="h-5 w-5 mr-2" />
              {t("offline.reload")}
            </button>
            <Link
              href={`/${locale}`}
              className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-base font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              {t("error.home")}
            </Link>
          </div>
        </div>
        <p className="mt-4 text-sm text-gray-500">
          {t("offline.note")}
        </p>
      </div>
    </div>
  );
}
