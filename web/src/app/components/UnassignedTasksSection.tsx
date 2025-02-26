"use client";

import { FC, useState, useEffect } from "react";
import { db } from "../../lib/firebase";
import { collection, query, where, onSnapshot, doc, updateDoc } from "firebase/firestore";
import { Task, Block } from "@/types";
import TaskItem from "./TaskItem";
import { InboxIcon } from "@heroicons/react/24/outline";
import { useAuth } from "./AuthProvider";
import { ChevronUpIcon, ChevronDownIcon } from "@heroicons/react/24/outline";

// プロパティの型定義
type UnassignedTasksSectionProps = {
    blocks: Block[];
    tasks: Task[];
    loading: boolean;
    date: string;
};

const UnassignedTasksSection: FC<UnassignedTasksSectionProps> = ({ blocks, tasks, loading, date }) => {
    const [isExpanded, setIsExpanded] = useState(true);
    const [dragOver, setDragOver] = useState(false);
    const { userId } = useAuth();

    // Firebaseを使用した未割り当てのタスク取得はもう必要ありません
    // 親コンポーネントから渡されたタスクを使用します

    const calculateProgress = (): number => {
        const total = tasks.length;
        if (total === 0) return 0;

        const completed = tasks.filter(task => task.status === "done").length;
        return Math.round((completed / total) * 100);
    };

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = "move";
        if (!dragOver) setDragOver(true);
    };

    const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setDragOver(false);
    };

    const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setDragOver(false);

        try {
            const taskData = JSON.parse(e.dataTransfer.getData("application/json")) as Task;

            // タスクのブロックIDをnullに更新
            await updateDoc(doc(db, "tasks", taskData.id), {
                blockId: null
            });
        } catch (error) {
            console.error("Error updating task:", error);
        }
    };

    // 進捗率を計算
    const progress = calculateProgress();

    return (
        <div
            className={`mt-4 p-4 border rounded-lg bg-white shadow-sm ${dragOver ? "border-primary-500 bg-primary-50" : "border-gray-200"}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
        >
            <div
                className="flex items-center justify-between cursor-pointer"
                onClick={() => setIsExpanded(!isExpanded)}
            >
                <div className="flex items-center">
                    <InboxIcon className="h-5 w-5 text-gray-500 mr-2" />
                    <h3 className="text-lg font-medium text-gray-900">未割り当てタスク</h3>
                    <div className="ml-3 text-sm text-gray-500">
                        {tasks.length} 件
                    </div>
                </div>
                <div className="flex items-center">
                    {tasks.length > 0 && (
                        <div className="mr-4 w-32">
                            <div className="text-xs text-gray-500 mb-1 flex justify-between">
                                <span>進捗</span>
                                <span>{progress}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                                <div
                                    className="bg-primary-600 h-2 rounded-full"
                                    style={{ width: `${progress}%` }}
                                ></div>
                            </div>
                        </div>
                    )}
                    <button className="p-1 rounded-full hover:bg-gray-100">
                        {isExpanded ?
                            <ChevronUpIcon className="h-5 w-5 text-gray-500" /> :
                            <ChevronDownIcon className="h-5 w-5 text-gray-500" />
                        }
                    </button>
                </div>
            </div>

            {isExpanded && (
                <div className="mt-3">
                    {loading ? (
                        <div className="py-4 text-center text-gray-500">
                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600 mx-auto"></div>
                            <p className="mt-2">読み込み中...</p>
                        </div>
                    ) : tasks.length === 0 ? (
                        <div className="py-6 text-center text-gray-500">
                            未割り当てのタスクはありません
                        </div>
                    ) : (
                        <ul className="space-y-2">
                            {tasks.map(task => (
                                <TaskItem key={task.id} task={task} isDraggable={true} />
                            ))}
                        </ul>
                    )}
                </div>
            )}
        </div>
    );
};

export default UnassignedTasksSection; 