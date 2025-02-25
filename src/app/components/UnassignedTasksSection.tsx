"use client";

import { FC, useState, useEffect } from "react";
import { db } from "../../lib/firebase";
import { collection, query, where, onSnapshot, doc, updateDoc } from "firebase/firestore";
import { Task } from "@/types";
import TaskItem from "./TaskItem";
import { InboxIcon } from "@heroicons/react/24/outline";
import { useAuth } from "./AuthProvider";
import { ChevronUpIcon, ChevronDownIcon } from "@heroicons/react/24/outline";

const UnassignedTasksSection: FC = () => {
    const [unassignedTasks, setUnassignedTasks] = useState<Task[]>([]);
    const [loading, setLoading] = useState(true);
    const [isExpanded, setIsExpanded] = useState(true);
    const [dragOver, setDragOver] = useState(false);
    const { userId } = useAuth();

    // 日付もブロックも未割り当てのタスクを取得
    useEffect(() => {
        const tasksRef = collection(db, "tasks");
        const q = query(
            tasksRef,
            where("userId", "==", userId),
            where("date", "==", null)
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const tasks = snapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            })) as Task[];

            // ブロックIDがないものをフィルタリング
            const fullyUnassignedTasks = tasks.filter(task => !task.blockId);
            setUnassignedTasks(fullyUnassignedTasks);
            setLoading(false);
        }, (error) => {
            console.error("Error fetching unassigned tasks:", error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [userId]);

    // タスク進捗率を計算
    const calculateProgress = (): number => {
        if (unassignedTasks.length === 0) return 0;
        const completedTasks = unassignedTasks.filter((task) => task.status === "done");
        return Math.round((completedTasks.length / unassignedTasks.length) * 100);
    };

    // ドラッグオーバーイベントハンドラー
    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = "move";
        setDragOver(true);
    };

    // ドラッグリーブイベントハンドラー
    const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
        // 子要素へのドラッグリーブイベントを無視
        if (e.currentTarget.contains(e.relatedTarget as Node)) return;
        setDragOver(false);
    };

    // ドロップイベントハンドラー
    const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setDragOver(false);

        try {
            const taskData = JSON.parse(e.dataTransfer.getData("application/json")) as Task;
            console.log(`タスク "${taskData.title}" を未割り当てに移動します`);

            // Firestoreでタスクを更新
            const taskRef = doc(db, "tasks", taskData.id);
            await updateDoc(taskRef, {
                blockId: null,
                date: null
            });
        } catch (error) {
            console.error("未割り当てへの移動中にエラーが発生しました:", error);
        }
    };

    const progress = calculateProgress();

    return (
        <div
            className={`mb-8 bg-white rounded-xl shadow-sm overflow-hidden ${dragOver ? "ring-2 ring-primary-500 drag-over" : ""}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
        >
            <div
                className="p-3 sm:p-4 border-b border-gray-200 cursor-pointer"
                onClick={() => setIsExpanded(!isExpanded)}
            >
                <div className="flex flex-wrap sm:flex-nowrap items-center justify-between">
                    <div className="flex items-center w-full sm:w-auto">
                        <InboxIcon className="h-5 w-5 text-gray-500 mr-2" />
                        <h3 className="text-base sm:text-lg font-medium">
                            未割り当てタスク
                        </h3>
                    </div>

                    <div className="flex items-center w-full sm:w-auto justify-end mt-2 sm:mt-0">
                        {unassignedTasks.length > 0 && (
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
                                {unassignedTasks.length}件
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
                    {loading ? (
                        <div className="p-4 text-center">
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary-600 mx-auto"></div>
                            <p className="mt-2 text-sm text-gray-500">読み込み中...</p>
                        </div>
                    ) : unassignedTasks.length > 0 ? (
                        unassignedTasks.map((task) => (
                            <div key={task.id} className="task-container">
                                <TaskItem task={task} isDraggable={true} />
                            </div>
                        ))
                    ) : (
                        <div className="p-4 text-center text-gray-500 text-sm italic">
                            未割り当てのタスクはありません。タスクをここにドラッグしてください。
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default UnassignedTasksSection; 