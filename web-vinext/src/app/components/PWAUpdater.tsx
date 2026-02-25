"use client";

import { useState, useEffect } from "react";
import { ArrowPathIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { useTranslations } from "../../../app/[locale]/LocaleLayoutClient";

export default function PWAUpdater() {
  const t = useTranslations();
  const [showUpdateBanner, setShowUpdateBanner] = useState(false);
  const [registration, setRegistration] =
    useState<ServiceWorkerRegistration | null>(null);

  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;

    const handleUpdate = (reg: ServiceWorkerRegistration) => {
      if (reg.waiting) {
        setRegistration(reg);
        setShowUpdateBanner(true);
      }
    };

    navigator.serviceWorker.ready.then((reg) => {
      if (reg.waiting) {
        setRegistration(reg);
        setShowUpdateBanner(true);
        return;
      }

      reg.addEventListener("updatefound", () => {
        if (reg.installing) {
          const newWorker = reg.installing;
          newWorker.addEventListener("statechange", () => {
            if (
              newWorker.state === "installed" &&
              navigator.serviceWorker.controller
            ) {
              handleUpdate(reg);
            }
          });
        }
      });
    });

    navigator.serviceWorker.addEventListener("controllerchange", () => {
      window.location.reload();
    });
  }, []);

  const applyUpdate = () => {
    if (registration?.waiting) {
      registration.waiting.postMessage({ type: "SKIP_WAITING" });
      setShowUpdateBanner(false);
    }
  };

  if (!showUpdateBanner) {
    return null;
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 m-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-4 max-w-md mx-auto border border-gray-200 dark:border-gray-700">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-bold text-lg text-gray-800 dark:text-gray-100">
            {t("pwa.updateTitle")}
          </h3>
          <button
            onClick={() => setShowUpdateBanner(false)}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            aria-label={t("pwa.close")}
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>
        <p className="text-gray-600 dark:text-gray-300 mb-4">
          {t("pwa.updateDescription")}
        </p>
        <div className="flex space-x-2">
          <button
            onClick={applyUpdate}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md flex items-center justify-center"
          >
            <ArrowPathIcon className="h-5 w-5 mr-2" />
            {t("pwa.update")}
          </button>
          <button
            onClick={() => setShowUpdateBanner(false)}
            className="flex-1 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 font-medium py-2 px-4 rounded-md"
          >
            {t("pwa.later")}
          </button>
        </div>
      </div>
    </div>
  );
}
