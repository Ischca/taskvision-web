"use client";

import React, { ReactNode } from "react";
import { Block, Task } from "@/types";
import { useTheme } from "./ThemeProvider";
import Link from "next/link";
import { useTranslations } from "next-intl";

interface SidebarProps {
  blocks: Block[];
  tasks: Task[];
  children?: ReactNode;
}

const Sidebar: React.FC<SidebarProps> = ({ blocks, tasks, children }) => {
  const { theme } = useTheme();
  const t = useTranslations();
  const isDark = theme === "dark";

  // 統計情報の計算
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((task) => task.status === "done").length;
  const pendingTasks = totalTasks - completedTasks;
  const completionRate =
    totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  const isComplete = completionRate === 100;

  // 今日の日付
  const today = new Date();
  const formattedDate = today.toLocaleDateString("ja-JP", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div
      className={`w-full lg:w-64 p-4 ${isDark ? "bg-gray-800 text-white" : "bg-white"}`}
    >
      <div className="mb-6">
        <div className="text-sm text-gray-500 dark:text-gray-400">
          {formattedDate}
        </div>
      </div>

      <div className="mb-6">
        <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
          {t("common.sidebar.overview")}
        </h2>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="bg-gray-100 dark:bg-gray-700 p-3 rounded-lg">
            <div className="text-sm text-gray-500 dark:text-gray-400">
              {t("common.sidebar.totalTasks")}
            </div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {totalTasks}
            </div>
          </div>
          <div className="bg-gray-100 dark:bg-gray-700 p-3 rounded-lg">
            <div className="text-sm text-gray-500 dark:text-gray-400">
              {t("common.sidebar.completionRate")}
            </div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {completionRate}%
            </div>
          </div>
        </div>

        <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2.5 mb-4">
          <div
            className={`h-2.5 rounded-full ${isComplete ? "bg-green-500" : "bg-primary-500"}`}
            style={{ width: `${completionRate}%` }}
          ></div>
        </div>

        {isComplete && totalTasks > 0 && (
          <div className="bg-green-100 dark:bg-green-900 p-3 rounded-lg text-green-800 dark:text-green-200 text-sm mb-4">
            {t("common.sidebar.allTasksCompleted")}
          </div>
        )}
      </div>

      <div className="mb-6">
        <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
          {t("common.sidebar.taskStatus")}
        </h2>
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
              <span className="text-gray-800 dark:text-gray-200">
                {t("tasks.completed")}
              </span>
            </div>
            <span className="font-medium text-gray-900 dark:text-white">
              {completedTasks}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full bg-primary-500 mr-2"></div>
              <span className="text-gray-800 dark:text-gray-200">
                {t("tasks.incomplete")}
              </span>
            </div>
            <span className="font-medium text-gray-900 dark:text-white">
              {pendingTasks}
            </span>
          </div>
        </div>
      </div>

      {children}

      <div className="mt-6">
        <Link
          href="/blocks/manage"
          className="text-primary-600 dark:text-primary-400 hover:underline text-sm flex items-center"
        >
          {t("common.sidebar.goToBlockManagement")}
        </Link>
      </div>
    </div>
  );
};

export default Sidebar;
