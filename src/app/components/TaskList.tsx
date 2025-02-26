"use client";

import React, { useState } from "react";
import { Block, Task } from "@/types";
import { db } from "@/lib/firebase";
import { doc, updateDoc } from "firebase/firestore";
import {
    CheckIcon,
    PencilSquareIcon,
    TrashIcon,
    ClockIcon,
    CalendarIcon
} from "@heroicons/react/24/outline";

interface TaskListProps {
    tasks: Task[];
    blocks: Block[];
    onTasksUpdated?: () => Promise<void>;
    loading: boolean;
}

const TaskList: React.FC<TaskListProps> = ({ tasks, blocks, onTasksUpdated, loading }) => {
    const [expandedTaskId, setExpandedTaskId] = useState<string | null>(null);
    const [isDragOver, setIsDragOver] = useState(false);

    // タスクの完了状態を切り替える
    const toggleTaskStatus = async (task: Task) => {
        try {
            const taskRef = doc(db, "tasks", task.id);
            const newStatus = task.status === "done" ? "open" : "done";

            await updateDoc(taskRef, {
                status: newStatus,
                updatedAt: new Date().toISOString()
            });

            // onTasksUpdatedが存在する場合のみ呼び出す
            if (onTasksUpdated) {
                await onTasksUpdated();
            }
        } catch (error) {
            console.error("Error toggling task status:", error);
        }
    };

    // タスクの詳細を表示・非表示
    const toggleTaskDetails = (taskId: string) => {
        setExpandedTaskId(expandedTaskId === taskId ? null : taskId);
    };

    // ブロック名を取得
    const getBlockName = (blockId: string | null) => {
        if (!blockId) return "未分類";
        const block = blocks.find(b => b.id === blockId);
        return block ? block.name : "未分類";
    };

    // 日付をフォーマット
    const formatDate = (dateStr: string | null) => {
        if (!dateStr) return "日付なし";
        const date = new Date(dateStr);
        return date.toLocaleDateString("ja-JP", {
            month: "short",
            day: "numeric"
        });
    };

    // ドラッグ関連のイベントハンドラを追加
    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = "move";
        if (!isDragOver) setIsDragOver(true);
    };

    const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
        // 子要素へのドラッグリーブイベントを無視
        if (e.currentTarget.contains(e.relatedTarget as Node)) return;
        setIsDragOver(false);
    };

    const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragOver(false);

        try {
            const taskData = JSON.parse(e.dataTransfer.getData("application/json")) as Task;

            // タスクのブロックIDをnullに更新（未割り当てに設定）
            await updateDoc(doc(db, "tasks", taskData.id), {
                blockId: null
            });
        } catch (error) {
            console.error("ドロップ処理中にエラーが発生しました:", error);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-8">
                <div className="loading loading-spinner loading-lg"></div>
            </div>
        );
    }

    if (tasks.length === 0) {
        return (
            <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 text-center">
                <p className="text-gray-500 dark:text-gray-400">登録されたタスクはありません</p>
                <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">右上の「+タスク追加」ボタンからタスクを作成しましょう</p>
            </div>
        );
    }

    return (
        <div
            className={`bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden 
                      ${isDragOver ? "ring-2 ring-primary-500 bg-primary-50/10" : ""}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
        >
            <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                {tasks.map(task => (
                    <li key={task.id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3 flex-1">
                                <button
                                    onClick={() => toggleTaskStatus(task)}
                                    className={`w-5 h-5 rounded-full flex items-center justify-center border ${task.status === "done"
                                        ? "bg-primary border-primary"
                                        : "border-gray-300 dark:border-gray-600"
                                        }`}
                                >
                                    {task.status === "done" && (
                                        <CheckIcon className="w-3 h-3 text-white" />
                                    )}
                                </button>

                                <div className="flex-1">
                                    <h3
                                        className={`text-base font-medium cursor-pointer ${task.status === "done" ? "line-through text-gray-400 dark:text-gray-500" : "text-gray-800 dark:text-gray-200"
                                            }`}
                                        onClick={() => toggleTaskDetails(task.id)}
                                    >
                                        {task.title}
                                    </h3>

                                    <div className="flex items-center space-x-2 mt-1">
                                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                                            <ClockIcon className="w-3 h-3 mr-1" />
                                            {getBlockName(task.blockId)}
                                        </span>

                                        {task.date && (
                                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                                                <CalendarIcon className="w-3 h-3 mr-1" />
                                                {formatDate(task.date)}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="flex space-x-2">
                                <button
                                    className="p-1 text-gray-400 hover:text-gray-500 dark:text-gray-500 dark:hover:text-gray-400 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
                                    aria-label="編集"
                                >
                                    <PencilSquareIcon className="w-5 h-5" />
                                </button>
                                <button
                                    className="p-1 text-gray-400 hover:text-red-500 dark:text-gray-500 dark:hover:text-red-400 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
                                    aria-label="削除"
                                >
                                    <TrashIcon className="w-5 h-5" />
                                </button>
                            </div>
                        </div>

                        {expandedTaskId === task.id && task.description && (
                            <div className="mt-3 pl-8 pr-2 text-sm text-gray-600 dark:text-gray-400">
                                <p>{task.description}</p>

                                {task.deadline && (
                                    <div className="mt-2 text-xs text-red-600 dark:text-red-400 flex items-center">
                                        <ClockIcon className="w-3 h-3 mr-1" />
                                        締切: {task.deadline}
                                    </div>
                                )}
                            </div>
                        )}
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default TaskList; 