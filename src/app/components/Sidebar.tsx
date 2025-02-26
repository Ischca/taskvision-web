"use client";

import React from "react";
import { Block, Task } from "@/types";
import { CheckCircleIcon, ClockIcon, ExclamationCircleIcon } from "@heroicons/react/24/outline";
import Link from "next/link";

interface SidebarProps {
    blocks: Block[];
    tasks: Task[];
}

const Sidebar: React.FC<SidebarProps> = ({ blocks, tasks }) => {
    // タスクの統計情報を計算
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(task => task.status === "done").length;
    const pendingTasks = totalTasks - completedTasks;
    const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
    const isComplete = completionRate === 100;

    // 今日の日付
    const today = new Date();
    const formattedDate = today.toLocaleDateString("ja-JP", {
        year: "numeric",
        month: "long",
        day: "numeric",
        weekday: "long"
    });

    return (
        <div className="bg-white rounded-lg shadow p-4">
            <div className="text-gray-500 text-sm mb-4">{formattedDate}</div>

            <div className="mb-6">
                <h2 className="text-lg font-bold text-gray-900 mb-2">概要</h2>
                <div className="grid grid-cols-2 gap-2 mb-4">
                    <div className="bg-gray-50 p-3 rounded-lg">
                        <div className="text-sm text-gray-500">合計タスク</div>
                        <div className="text-xl font-bold">{totalTasks}</div>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-lg">
                        <div className="text-sm text-gray-500">完了率</div>
                        <div className={`text-xl font-bold ${isComplete ? "text-green-600" : ""}`}>
                            {completionRate}%
                        </div>
                    </div>
                </div>

                {totalTasks > 0 && (
                    <div className="w-full flex items-center justify-center">
                        <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
                            <div
                                className={`h-4 rounded-full transition-all duration-500 ${isComplete
                                    ? "bg-green-500 animate-pulse-soft"
                                    : "bg-primary"
                                    }`}
                                style={{ width: `${completionRate}%` }}
                            />
                        </div>
                    </div>
                )}

                {isComplete && totalTasks > 0 && (
                    <div className="mt-2 text-center text-green-600 font-medium animate-fade-in">
                        おめでとうございます！すべてのタスクが完了しました 🎉
                    </div>
                )}
            </div>

            <div className="mb-6">
                <h2 className="text-lg font-bold text-gray-900 mb-2">タスク状態</h2>
                <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center">
                            <CheckCircleIcon className="h-4 w-4 text-green-500 mr-2" />
                            <span>完了</span>
                        </div>
                        <span className={`text-sm font-semibold px-2 py-1 rounded ${isComplete ? "bg-green-200 text-green-900" : "bg-green-100 text-green-800"
                            }`}>
                            {completedTasks}
                        </span>
                    </div>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center">
                            <ClockIcon className="h-4 w-4 text-blue-500 mr-2" />
                            <span>未完了</span>
                        </div>
                        <span className="text-sm font-semibold bg-blue-100 text-blue-800 px-2 py-1 rounded">
                            {pendingTasks}
                        </span>
                    </div>
                </div>
            </div>

            <div className="text-center mt-6">
                <Link
                    href="/blocks/manage"
                    className="text-primary text-sm hover:underline"
                >
                    ブロック管理画面へ
                </Link>
            </div>
        </div>
    );
};

export default Sidebar; 