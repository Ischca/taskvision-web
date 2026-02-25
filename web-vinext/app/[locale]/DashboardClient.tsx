"use client";

import { useState } from "react";
import { useI18n } from "./LocaleLayoutClient";

// ダミーのタスクデータ（Firebase接続前のテスト用）
interface MockTask {
  id: string;
  title: string;
  status: "open" | "done";
  blockId: string | null;
}

const mockTasks: MockTask[] = [
  { id: "1", title: "プロジェクト計画を作成", status: "open", blockId: "morning" },
  { id: "2", title: "コードレビュー", status: "open", blockId: "morning" },
  { id: "3", title: "ドキュメント更新", status: "done", blockId: null },
  { id: "4", title: "ミーティング準備", status: "open", blockId: null },
];

export function DashboardClient({ locale }: { locale: string }) {
  const { t } = useI18n();
  const [tasks, setTasks] = useState<MockTask[]>(mockTasks);

  const toggleTask = (id: string) => {
    setTasks((prev) =>
      prev.map((task) =>
        task.id === id
          ? { ...task, status: task.status === "open" ? "done" : "open" }
          : task
      )
    );
  };

  const assignedTasks = tasks.filter((task) => task.blockId);
  const unassignedTasks = tasks.filter((task) => !task.blockId);

  return (
    <div className="space-y-6">
      {/* ブロック割り当て済みタスク */}
      <section className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">{t("blocks.title")}</h2>
        <div className="space-y-2">
          {assignedTasks.map((task) => (
            <div
              key={task.id}
              className="flex items-center gap-3 p-3 border rounded hover:bg-gray-50"
            >
              <button
                onClick={() => toggleTask(task.id)}
                className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                  task.status === "done"
                    ? "bg-green-500 border-green-500 text-white"
                    : "border-gray-300"
                }`}
              >
                {task.status === "done" && "✓"}
              </button>
              <span
                className={
                  task.status === "done" ? "line-through text-gray-400" : ""
                }
              >
                {task.title}
              </span>
              <span className="ml-auto text-xs text-gray-400">
                {t(`tasks.status.${task.status}`)}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* 未割り当てタスク */}
      <section className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">{t("tasks.unassigned")}</h2>
        {unassignedTasks.length === 0 ? (
          <p className="text-gray-500">{t("tasks.noTasks")}</p>
        ) : (
          <div className="space-y-2">
            {unassignedTasks.map((task) => (
              <div
                key={task.id}
                className="flex items-center gap-3 p-3 border rounded hover:bg-gray-50 border-dashed"
              >
                <button
                  onClick={() => toggleTask(task.id)}
                  className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                    task.status === "done"
                      ? "bg-green-500 border-green-500 text-white"
                      : "border-gray-300"
                  }`}
                >
                  {task.status === "done" && "✓"}
                </button>
                <span
                  className={
                    task.status === "done" ? "line-through text-gray-400" : ""
                  }
                >
                  {task.title}
                </span>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 検証情報 */}
      <section className="bg-blue-50 rounded-lg p-4 text-sm text-blue-800">
        <p>
          Locale: <code className="bg-blue-100 px-1 rounded">{locale}</code> |
          Framework: <code className="bg-blue-100 px-1 rounded">Vinext (Vite)</code> |
          i18n: <code className="bg-blue-100 px-1 rounded">Custom lightweight</code>
        </p>
      </section>
    </div>
  );
}
