"use client";

import React, { useRef } from "react";
import {
  XMarkIcon,
  CheckIcon,
  ArrowPathIcon,
  ChevronUpIcon,
} from "@heroicons/react/24/outline";
import { useTranslations } from "next-intl";

interface QuickTaskDrawerProps {
  isQuickDrawerOpen: boolean;
  setIsQuickDrawerOpen: (value: boolean) => void;
  setIsModalOpen: (value: boolean) => void;
  quickTitle: string;
  setQuickTitle: (value: string) => void;
  isQuickSubmitting: boolean;
  handleQuickSubmit: (e: React.FormEvent) => Promise<void>;
  quickTitleInputRef: React.RefObject<HTMLInputElement | null>;
  drawerRef: React.RefObject<HTMLDivElement | null>;
}

const QuickTaskDrawer = ({
  isQuickDrawerOpen,
  setIsQuickDrawerOpen,
  setIsModalOpen,
  quickTitle,
  setQuickTitle,
  isQuickSubmitting,
  handleQuickSubmit,
  quickTitleInputRef,
  drawerRef,
}: QuickTaskDrawerProps) => {
  const t = useTranslations();

  return (
    <div
      className={`fixed inset-x-0 bottom-0 z-50 sm:hidden transition-transform duration-300 ease-in-out ${isQuickDrawerOpen ? "translate-y-0" : "translate-y-full"}`}
    >
      <div
        ref={drawerRef}
        className="bg-white dark:bg-gray-800 rounded-t-xl shadow-xl p-4 border-t border-gray-200 dark:border-gray-700"
      >
        <div className="flex justify-center mb-2">
          <div className="w-16 h-1.5 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
        </div>

        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-lg text-gray-900 dark:text-white">
            {t("tasks.quickAdd")}
          </h3>
          <div className="flex space-x-2">
            <button
              className="p-1.5 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
              onClick={() => {
                setIsQuickDrawerOpen(false);
                setIsModalOpen(true);
              }}
            >
              <ChevronUpIcon className="h-5 w-5" />
              <span className="sr-only">{t("tasks.advancedSettings")}</span>
            </button>
            <button
              className="p-1.5 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
              onClick={() => setIsQuickDrawerOpen(false)}
            >
              <XMarkIcon className="h-5 w-5" />
              <span className="sr-only">{t("tasks.close")}</span>
            </button>
          </div>
        </div>

        <form onSubmit={handleQuickSubmit} className="space-y-4">
          <div className="flex space-x-2">
            <input
              ref={quickTitleInputRef}
              type="text"
              className="input input-bordered flex-1 focus-ring"
              value={quickTitle}
              onChange={(e) => setQuickTitle(e.target.value)}
              placeholder={t("tasks.taskName")}
              required
            />
            <button
              type="submit"
              className="btn btn-primary"
              disabled={!quickTitle.trim() || isQuickSubmitting}
            >
              {isQuickSubmitting ? (
                <ArrowPathIcon className="h-5 w-5 animate-spin" />
              ) : (
                <CheckIcon className="h-5 w-5" />
              )}
            </button>
          </div>

          <div className="text-xs text-gray-500 dark:text-gray-400 mt-2">
            <p>{t("tasks.willBeRegisteredToday")}</p>
            <p>
              {t("tasks.forDetailedSettings")}
              <button
                type="button"
                className="text-primary-600 dark:text-primary-400 underline"
                onClick={() => {
                  setQuickTitle("");
                  setIsQuickDrawerOpen(false);
                  setIsModalOpen(true);
                }}
              >
                {t("tasks.here")}
              </button>
            </p>
            <p className="mt-1.5 flex items-center justify-center text-gray-400 dark:text-gray-500">
              <span>{t("tasks.swipeDownToClose")}</span>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default QuickTaskDrawer;
