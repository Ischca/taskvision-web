"use client";

import React, { FC, useState, useEffect } from "react";
import { Task, Block } from "@/types";
import TaskItem from "./TaskItem";
import { db } from "@/lib/firebase";
import { doc, updateDoc } from "firebase/firestore";
import { ChevronDownIcon, ChevronUpIcon } from "@heroicons/react/24/outline";
import { useMessages } from '@/app/hooks/useMessages';

type UnassignedTasksSectionProps = {
    blocks: Block[];
    tasks: Task[];
    loading: boolean;
    date: string;
};

const UnassignedTasksSection: FC<UnassignedTasksSectionProps> = ({ blocks, tasks, loading, date }) => {
    const [expanded, setExpanded] = useState(true);
    const [dragOver, setDragOver] = useState(false);
    const { messages } = useMessages();
    const [hasInitialized, setHasInitialized] = useState(false);

    // 初期化後の状態更新のためにuseEffectを使用
    useEffect(() => {
        if (!hasInitialized) {
            setHasInitialized(true);
        }
    }, [hasInitialized]);

    // messagesからテキストを取得するヘルパー関数
    const t = (key: string) => {
        try {
            if (!messages) {
                return key;
            }

            const parts = key.split('.');
            let current = messages;

            for (const part of parts) {
                if (current && typeof current === 'object' && part in current) {
                    current = (current as any)[part];
                } else {
                    return key;
                }
            }

            return current && typeof current === 'string' ? current : key;
        } catch (error) {
            return key;
        }
    };

    // タスクの進捗を計算
    const calculateProgress = (): number => {
        if (tasks.length === 0) return 0;
        const completedTasks = tasks.filter(task => task.status === 'done').length;
        return Math.round((completedTasks / tasks.length) * 100);
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
                date: null
            });

            // コンソールに成功メッセージを表示
            console.log(`Task ${taskId} moved to unassigned tasks`);
        } catch (error) {
            console.error("Error updating task:", error);
        }
    };

    // 未割り当てタスクセクションの表示内容
    return (
        <div
            className={`unassigned-tasks-section ${dragOver ? 'drag-over' : ''}`}
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
                    <h2 className="unassigned-section-title">{t('common.tasks.unassignedTasks')}</h2>
                    <span className="unassigned-task-count">
                        {tasks.length}
                    </span>
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
            <div className={`unassigned-tasks-list ${expanded ? 'expanded' : 'collapsed'}`}>
                {loading ? (
                    <div className="p-6 flex justify-center">
                        <svg className="animate-spin h-6 w-6 text-primary-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                    </div>
                ) : tasks.length > 0 ? (
                    <div className="divide-y divide-gray-100 dark:divide-gray-700">
                        {tasks.map((task) => (
                            <div key={task.id} className="task-container">
                                <TaskItem task={task} isDraggable={true} />
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="p-6 text-center text-gray-500 dark:text-gray-400">
                        {t('common.tasks.noUnassignedTasks')}
                    </div>
                )}
            </div>
        </div>
    );
};

export default UnassignedTasksSection; 