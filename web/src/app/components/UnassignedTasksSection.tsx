"use client";

import React, { useState, useEffect } from "react";
import { Task, Block } from "@/types";
import TaskItem from "./TaskItem";
import { db } from "@/lib/firebase";
import { doc, updateDoc } from "firebase/firestore";
import { ChevronDownIcon, ChevronUpIcon } from "@heroicons/react/24/outline";
import { useTranslations } from "next-intl";

type UnassignedTasksSectionProps = {
  blocks: Block[];
  tasks: Task[];
  loading: boolean;
  date: string;
};

// FCを使わず、直接関数としてコンポーネントを定義
const UnassignedTasksSection = ({
  blocks,
  tasks,
  loading,
  date,
}: UnassignedTasksSectionProps) => {
  const [expanded, setExpanded] = useState(true);
  const [dragOver, setDragOver] = useState(false);
  const [hasInitialized, setHasInitialized] = useState(false);

  // next-intlの翻訳フックを使用
  const t = useTranslations();

  const completedTasks = tasks.filter((task) => task.status === "done");
  const incompleteTasks = tasks.filter((task) => task.status === "open");

  // 初期化後の状態更新のためにuseEffectを使用
  useEffect(() => {
    if (!hasInitialized) {
      setHasInitialized(true);
    }
  }, [hasInitialized]);

  // タスクの進捗を計算
  const calculateProgress = (): number => {
    if (tasks.length === 0) return 0;
    return Math.round((completedTasks.length / tasks.length) * 100);
  };

  // ドラッグオーバーイベントハンドラー
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setDragOver(true);
  };

  // ドラッグリーブイベントハンドラー
  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(false);
  };

  // ドロップイベントハンドラー
  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(false);

    const taskId = e.dataTransfer.getData("taskId");
    if (!taskId) return;

    try {
      // タスクIDからFirestoreドキュメントを参照
      const taskRef = doc(db, "tasks", taskId);

      // ドキュメントの更新（blockId と date を null に設定）
      await updateDoc(taskRef, {
        blockId: null,
        date: null,
      });
    } catch (error) {
      console.error("Error updating task:", error);
    }
  };

  // 未割り当てタスクセクションの表示内容
  return (
    <div
      className={`unassigned-tasks-section mt-4 ${dragOver ? "drag-over" : ""}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* ヘッダー部分 */}
      <div
        className="unassigned-section-header"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center">
          <h2 className="unassigned-section-title">
            {t("tasks.unassignedTasks")}
          </h2>
          <span className="unassigned-task-count">{tasks.length}</span>
        </div>
        <button className="unassigned-toggle-button">
          {expanded ? (
            <ChevronUpIcon className="h-5 w-5 text-gray-500 dark:text-gray-400" />
          ) : (
            <ChevronDownIcon className="h-5 w-5 text-gray-500 dark:text-gray-400" />
          )}
        </button>
      </div>

      {/* タスク一覧部分 */}
      <div
        className={`unassigned-tasks-list ${expanded ? "expanded" : "collapsed"}`}
      >
        {loading ? (
          <div className="p-6 flex justify-center">
            <svg
              className="animate-spin h-6 w-6 text-primary-500"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
          </div>
        ) : tasks.length > 0 ? (
          <div>
            {/* 未完了タスク */}
            {incompleteTasks.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 p-2 pl-4">
                  {t("tasks.incompleteTitle", { defaultValue: "未完了タスク" })}
                  <span className="ml-2 text-xs bg-gray-200 dark:bg-gray-700 rounded-full px-2 py-0.5">
                    {incompleteTasks.length}
                  </span>
                </h3>
                <div className="divide-y divide-gray-100 dark:divide-gray-700">
                  {incompleteTasks.map((task) => (
                    <div key={task.id} className="task-container">
                      <TaskItem task={task} isDraggable={true} />
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* 完了タスク */}
            {completedTasks.length > 0 && (
              <div className="mt-4">
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 p-2 pl-4">
                  {t("tasks.completedTitle", { defaultValue: "完了タスク" })}
                  <span className="ml-2 text-xs bg-gray-200 dark:bg-gray-700 rounded-full px-2 py-0.5">
                    {completedTasks.length}
                  </span>
                </h3>
                <div className="divide-y divide-gray-100 dark:divide-gray-700">
                  {completedTasks.map((task) => (
                    <div key={task.id} className="task-container">
                      <TaskItem task={task} isDraggable={true} />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="p-6 text-center text-gray-500 dark:text-gray-400">
            {t("tasks.noUnassignedTasks")}
          </div>
        )}
      </div>
    </div>
  );
};

export default UnassignedTasksSection;
