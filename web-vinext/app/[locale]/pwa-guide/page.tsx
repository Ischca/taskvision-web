"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import {
  DevicePhoneMobileIcon,
  ArrowDownTrayIcon,
  WifiIcon,
  ClockIcon,
  ArrowTopRightOnSquareIcon,
} from "@heroicons/react/24/outline";
import { useTranslations } from "../LocaleLayoutClient";

export default function PWAGuidePage() {
  const t = useTranslations();
  const params = useParams();
  const locale = (params?.locale as string) || "ja";

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden mb-8">
        <div className="bg-indigo-600 px-4 py-5 sm:px-6">
          <h1 className="text-lg md:text-xl font-medium text-white">
            {t("pwa.guideTitle")}
          </h1>
          <p className="mt-1 max-w-2xl text-sm text-indigo-100">
            {t("pwa.guideSubtitle")}
          </p>
        </div>
        <div className="px-4 py-5 sm:px-6">
          <div className="border-b border-gray-200 dark:border-gray-700 pb-5 mb-5">
            <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100 flex items-center">
              <DevicePhoneMobileIcon className="h-5 w-5 mr-2 text-indigo-500" />
              {t("pwa.whatIsPwa")}
            </h2>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              {t("pwa.whatIsPwaDescription")}
            </p>
          </div>

          <div className="border-b border-gray-200 dark:border-gray-700 pb-5 mb-5">
            <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100 flex items-center">
              <ArrowDownTrayIcon className="h-5 w-5 mr-2 text-indigo-500" />
              {t("pwa.howToInstall")}
            </h2>

            <div className="mt-4 space-y-5">
              <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-md">
                <h3 className="font-medium text-gray-900 dark:text-gray-100">
                  {t("pwa.iosSafari")}
                </h3>
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                  {t("pwa.iosSafariSteps")}
                </p>
              </div>

              <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-md">
                <h3 className="font-medium text-gray-900 dark:text-gray-100">
                  {t("pwa.androidChrome")}
                </h3>
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                  {t("pwa.androidChromeSteps")}
                </p>
              </div>

              <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-md">
                <h3 className="font-medium text-gray-900 dark:text-gray-100">
                  {t("pwa.chromeDesktop")}
                </h3>
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                  {t("pwa.chromeDesktopSteps")}
                </p>
              </div>
            </div>
          </div>

          <div className="border-b border-gray-200 dark:border-gray-700 pb-5 mb-5">
            <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100 flex items-center">
              <WifiIcon className="h-5 w-5 mr-2 text-indigo-500" />
              {t("pwa.offlineFeatures")}
            </h2>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              {t("pwa.offlineFeaturesDescription")}
            </p>
          </div>

          <div className="border-b border-gray-200 dark:border-gray-700 pb-5 mb-5">
            <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100 flex items-center">
              <ClockIcon className="h-5 w-5 mr-2 text-indigo-500" />
              {t("pwa.autoUpdate")}
            </h2>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              {t("pwa.autoUpdateDescription")}
            </p>
          </div>

          <div className="mt-6 text-center">
            <Link
              href={`/${locale}`}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              {t("pwa.tryApp")}
              <ArrowTopRightOnSquareIcon className="ml-2 h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
