"use client";

import { FC, useState, useEffect, ReactNode } from "react";
import TaskItem from "@/app/components/TaskItem";
import { Block, Task } from "@/types";
import { db } from "../../lib/firebase";
import { doc, updateDoc } from "firebase/firestore";
import {
    ChevronDownIcon,
    ChevronUpIcon,
    ClockIcon,
    ExclamationCircleIcon,
    BellIcon
} from "@heroicons/react/24/outline";
import { useAuth } from "./AuthProvider";

// プロパティの型定義
type BlockListProps = {
    blocks: Block[];
    tasks: Task[];
    date: string;
    loading: boolean;
};

const BlockList: FC<BlockListProps> = ({ blocks, tasks, date, loading }) => {
    const [expandedBlocks, setExpandedBlocks] = useState<{ [key: string]: boolean }>({});
    const [dragOverBlock, setDragOverBlock] = useState<string | null>(null);
    const { userId } = useAuth();

    // 現在のブロックを判定（時間ベース）
    const getCurrentBlock = (): string | null => {
        const now = new Date();
        const hours = now.getHours();
        const minutes = now.getMinutes();
        const currentTime = `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`;

        for (const block of blocks) {
            if (block.startTime <= currentTime && currentTime <= block.endTime) {
                return block.id;
            }
        }
        return null;
    };

    // 初期状態では全てのブロックを展開
    useEffect(() => {
        const initialExpandState: { [key: string]: boolean } = {};
        blocks.forEach((block) => {
            initialExpandState[block.id] = true;
        });
        setExpandedBlocks(initialExpandState);
    }, [blocks]);

    // ブロックの展開状態を切り替える
    const toggleBlock = (blockId: string) => {
        setExpandedBlocks((prev) => ({
            ...prev,
            [blockId]: !prev[blockId],
        }));
    };

    // ブロックのタスク進捗率を計算
    const calculateProgress = (blockId: string): number => {
        const blockTasks = tasks.filter((task) => task.blockId === blockId);
        if (blockTasks.length === 0) return 0;

        const completedTasks = blockTasks.filter((task) => task.status === "done");
        return Math.round((completedTasks.length / blockTasks.length) * 100);
    };

    // ドラッグオーバーイベントハンドラー
    const handleDragOver = (e: React.DragEvent<HTMLDivElement>, blockId: string) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = "move";
        setDragOverBlock(blockId);
    };

    // ドラッグリーブイベントハンドラー
    const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
        // 子要素へのドラッグリーブイベントを無視
        if (e.currentTarget.contains(e.relatedTarget as Node)) return;
        setDragOverBlock(null);
    };

    // ドロップイベントハンドラー
    const handleDrop = async (e: React.DragEvent<HTMLDivElement>, blockId: string) => {
        e.preventDefault();
        setDragOverBlock(null);

        try {
            const taskData = JSON.parse(e.dataTransfer.getData("application/json")) as Task;
            console.log(`タスク "${taskData.title}" をブロック "${blockId}" に移動します`);

            // Firestoreでタスクを更新
            await updateDoc(doc(db, "tasks", taskData.id), {
                blockId: blockId,
                date: date
            });
        } catch (error) {
            console.error("ドロップ処理中にエラーが発生しました:", error);
        }
    };

    // 現在のブロックを取得
    const currentBlockId = getCurrentBlock();

    return (
        <div className="space-y-6">
            {blocks.map((block) => {
                const blockTasks = tasks.filter((task) => task.blockId === block.id);
                const progress = calculateProgress(block.id);
                const isCurrent = block.id === currentBlockId;
                const isExpanded = expandedBlocks[block.id] || false;

                return (
                    <div
                        key={block.id}
                        className={`block-container bg-white rounded-xl shadow-sm overflow-hidden ${dragOverBlock === block.id ? "ring-2 ring-primary-500 drag-over" : ""
                            }`}
                        onDragOver={(e) => handleDragOver(e, block.id)}
                        onDragLeave={handleDragLeave}
                        onDrop={(e) => handleDrop(e, block.id)}
                    >
                        <div
                            className={`p-3 sm:p-4 border-b border-gray-200 cursor-pointer ${isCurrent ? "bg-primary-50 dark:bg-primary-900/20" : ""
                                }`}
                            onClick={() => toggleBlock(block.id)}
                        >
                            <div className="flex flex-wrap sm:flex-nowrap items-center justify-between">
                                <div className="flex items-center w-full sm:w-auto">
                                    <div className="mr-2">
                                        {isCurrent ? (
                                            <div className="pulse-animation">
                                                <span className="relative inline-flex rounded-full h-3 w-3 bg-primary-500"></span>
                                            </div>
                                        ) : (
                                            <span className="inline-block h-3 w-3 rounded-full bg-gray-300 dark:bg-gray-600"></span>
                                        )}
                                    </div>
                                    <h3 className="text-base sm:text-lg font-medium truncate text-gray-900 dark:text-white">
                                        {block.name}
                                        <span className="ml-2 text-xs sm:text-sm font-normal text-gray-500 dark:text-gray-400 block sm:inline">
                                            {block.startTime} - {block.endTime}
                                        </span>
                                    </h3>
                                </div>

                                <div className="flex items-center w-full sm:w-auto justify-end mt-2 sm:mt-0">
                                    {blockTasks.length > 0 && (
                                        <div className="flex items-center mr-4">
                                            <div className="w-16 sm:w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-primary-500"
                                                    style={{ width: `${progress}%` }}
                                                ></div>
                                            </div>
                                            <span className="ml-2 text-xs text-gray-500">
                                                {progress}%
                                            </span>
                                        </div>
                                    )}

                                    <div className="flex items-center">
                                        <span className="text-sm text-gray-500 mr-2">
                                            {blockTasks.length}件
                                        </span>
                                        <button
                                            className="p-1.5 rounded-full hover:bg-gray-100"
                                            aria-label={isExpanded ? "折りたたむ" : "展開する"}
                                        >
                                            {isExpanded ? (
                                                <ChevronUpIcon className="h-5 w-5 text-gray-500" />
                                            ) : (
                                                <ChevronDownIcon className="h-5 w-5 text-gray-500" />
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {isExpanded && (
                            <div className="divide-y divide-gray-100">
                                {blockTasks.map((task) => {
                                    // リマインダーの有無をチェック
                                    const hasReminders = task.reminderSettings && (
                                        task.reminderSettings.enableBlockStartReminder ||
                                        task.reminderSettings.enableBlockEndReminder ||
                                        task.reminderSettings.enableDeadlineReminder
                                    );

                                    return (
                                        <div key={task.id} className="task-container">
                                            <TaskItem task={task} isDraggable={true} />
                                        </div>
                                    );
                                })}

                                {blockTasks.length === 0 && (
                                    <div className="p-4 text-center text-gray-500 dark:text-gray-400 text-sm italic">
                                        このブロックにタスクはありません。タスクをここにドラッグしてください。
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                );
            })}

            {blocks.length === 0 && (
                <div className="text-center py-8 bg-white dark:bg-gray-800 rounded-xl shadow-sm">
                    <ExclamationCircleIcon className="h-10 w-10 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-500 dark:text-gray-400 mb-2">ブロックが設定されていません</p>
                    <p className="text-sm text-gray-400 dark:text-gray-500">
                        ブロック管理画面からブロックを作成してください
                    </p>
                </div>
            )}
        </div>
    );
};

export default BlockList;