"use client";

import { useRouter, usePathname } from "next/navigation";
import { locales } from "../../lib/i18n";
import { useEffect, useState } from "react";
import { LanguageIcon } from "@heroicons/react/24/outline";
import { useTheme } from "./ThemeProvider";

const LanguageSwitcher = () => {
  const router = useRouter();
  const pathname = usePathname();
  const [currentLocale, setCurrentLocale] = useState("ja");
  const [isOpen, setIsOpen] = useState(false);
  const { theme } = useTheme();

  useEffect(() => {
    if (pathname) {
      const locale = pathname.split("/")[1];
      if (locales.includes(locale as (typeof locales)[number])) {
        setCurrentLocale(locale);
      }
    }
  }, [pathname]);

  const switchLanguage = (locale: string) => {
    if (pathname && currentLocale !== locale) {
      const newPath = pathname.replace(/^\/[^\/]+/, `/${locale}`);
      router.push(newPath);
      setIsOpen(false);
    }
  };

  const localeName = (locale: string) => {
    const names: Record<string, string> = {
      ja: "日本語",
      en: "English",
    };
    return names[locale] || locale;
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`p-2 rounded-full transition-colors relative ${
          theme === "dark"
            ? "text-gray-300 hover:bg-gray-700"
            : "text-gray-600 hover:bg-gray-100"
        }`}
        aria-label="言語を選択"
      >
        <LanguageIcon
          className={`h-5 w-5 ${theme === "dark" ? "text-gray-300" : "text-gray-600"}`}
        />
      </button>

      {isOpen && (
        <div
          className={`absolute right-0 mt-2 w-48 rounded-md shadow-lg z-20 overflow-hidden ${
            theme === "dark" ? "bg-gray-800" : "bg-white"
          }`}
        >
          <div className="py-1">
            {locales.map((locale) => (
              <button
                key={locale}
                onClick={() => switchLanguage(locale)}
                className={`w-full text-left px-4 py-2 text-sm ${
                  currentLocale === locale
                    ? theme === "dark"
                      ? "bg-gray-700 text-primary-400 font-medium"
                      : "bg-gray-100 text-primary font-medium"
                    : theme === "dark"
                      ? "text-gray-300 hover:bg-gray-700"
                      : "text-gray-700 hover:bg-gray-50"
                }`}
              >
                {localeName(locale)}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default LanguageSwitcher;
