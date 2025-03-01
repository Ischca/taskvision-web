"use client";

import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs, doc, updateDoc } from "firebase/firestore";
import { Task } from "@/types";
import Calendar from "@/app/components/Calendar";
import TaskItem from "@/app/components/TaskItem";
import UnassignedTasksSection from "@/app/components/UnassignedTasksSection";
import { ArrowPathIcon, ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";
import useRequireAuth from "@/app/hooks/useRequireAuth";
import { useMessages } from "@/app/hooks/useMessages";

export default function CalendarPage() {
    const { messages } = useMessages();
    const { userId, loading: authLoading, isAuthenticated } = useRequireAuth();
    const [tasks, setTasks] = useState<Task[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [selectedDateTasks, setSelectedDateTasks] = useState<Task[]>([]);

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

    // 月の最初と最後の日を取得
    const getMonthRange = (date: Date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        return { firstDay, lastDay };
    };

    // 日付文字列を生成する関数（タイムゾーンの問題を解決）
    const formatDateString = (date: Date): string => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    // 選択された月のタスクを取得
    useEffect(() => {
        const fetchTasksForMonth = async () => {
            if (!userId) return;

            setLoading(true);
            try {
                // 日付範囲をフォーマット
                const { firstDay, lastDay } = getMonthRange(currentMonth);

                // ユーザーIDのみでクエリを実行し、日付のフィルタリングはクライアント側で行う
                const tasksRef = collection(db, "tasks");
                const q = query(
                    tasksRef,
                    where("userId", "==", userId)
                );

                const snapshot = await getDocs(q);
                const allTasks = snapshot.docs.map((doc) => ({
                    id: doc.id,
                    ...doc.data(),
                })) as Task[];

                // クライアント側で日付範囲でフィルタリング
                const startDateStr = formatDateString(firstDay);
                const endDateStr = formatDateString(lastDay);

                const filteredTasks = allTasks.filter(task => {
                    if (!task.date) return false;
                    return task.date >= startDateStr && task.date <= endDateStr;
                });

                setTasks(filteredTasks);
            } catch (error) {
                console.error("Error fetching tasks for calendar:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchTasksForMonth();
    }, [userId, currentMonth]);

    // 選択された日付のタスクをフィルタリング
    useEffect(() => {
        if (!selectedDate) {
            setSelectedDateTasks([]);
            return;
        }

        const dateStr = formatDateString(selectedDate);
        const filteredTasks = tasks.filter(task => task.date === dateStr);
        setSelectedDateTasks(filteredTasks);
    }, [selectedDate, tasks]);

    // 月を変更する関数
    const goToPreviousMonth = () => {
        const newDate = new Date(currentMonth);
        newDate.setMonth(newDate.getMonth() - 1);
        setCurrentMonth(newDate);
    };

    const goToNextMonth = () => {
        const newDate = new Date(currentMonth);
        newDate.setMonth(newDate.getMonth() + 1);
        setCurrentMonth(newDate);
    };

    const goToToday = () => {
        setCurrentMonth(new Date());
        setSelectedDate(new Date());
    };

    // ドラッグオーバーイベントハンドラー
    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = "move";
    };

    return (
        <div className="container mx-auto max-w-4xl px-4 sm:px-6 py-4 sm:py-8" onDragOver={handleDragOver}>
            <div className="flex flex-col space-y-6">
                {/* カレンダーヘッダー */}
                <div className="flex flex-col sm:flex-row justify-between items-center mb-4 sm:mb-0">
                    <h1 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-0">{t('calendar.title')}</h1>
                    <div className="flex items-center space-x-2">
                        <button
                            onClick={goToPreviousMonth}
                            className="p-1.5 sm:p-2 rounded-full hover:bg-gray-200 text-gray-700"
                        >
                            <ChevronLeftIcon className="h-4 w-4 sm:h-5 sm:w-5" />
                        </button>
                        <span className="text-base sm:text-lg font-medium">
                            {currentMonth.toLocaleDateString(t('common.locale') || 'ja-JP', { year: 'numeric', month: 'long' })}
                        </span>
                        <button
                            onClick={goToNextMonth}
                            className="p-1.5 sm:p-2 rounded-full hover:bg-gray-200 text-gray-700"
                        >
                            <ChevronRightIcon className="h-4 w-4 sm:h-5 sm:w-5" />
                        </button>
                        <button
                            onClick={goToToday}
                            className="ml-2 px-3 py-1 text-sm font-medium text-primary-600 hover:text-primary-800 hover:bg-primary-50 border border-primary-300 rounded-md flex items-center"
                        >
                            <ArrowPathIcon className="h-4 w-4 mr-1" />
                            {t('calendar.today')}
                        </button>
                    </div>
                </div>

                {/* 未割り当てタスクセクション */}
                <UnassignedTasksSection
                    blocks={[]} // 必要に応じてブロックをfetchする処理を追加
                    tasks={tasks.filter(task => task.date === null)} // 日付未設定のタスク
                    loading={loading}
                    date=""
                />

                {/* カレンダー */}
                <div className="bg-white rounded-xl shadow-md overflow-hidden">
                    <Calendar
                        currentMonth={currentMonth}
                        tasks={tasks}
                        onPrevMonth={goToPreviousMonth}
                        onNextMonth={goToNextMonth}
                        onSelectDate={setSelectedDate}
                        selectedDate={selectedDate}
                    />
                </div>

                {/* 選択された日付のタスク一覧 */}
                <div className="bg-white rounded-xl shadow-md overflow-hidden">
                    <div className="p-4 border-b border-gray-200">
                        <h2 className="text-lg font-medium">
                            {selectedDate ? (
                                <>
                                    {selectedDate.toLocaleDateString(t('common.locale') || 'ja-JP', { month: 'long', day: 'numeric', weekday: 'long' })}
                                    {t('calendar.tasksForDay')}
                                </>
                            ) : (
                                t('calendar.selectDate')
                            )}
                        </h2>
                    </div>

                    <div className="divide-y divide-gray-100">
                        {loading ? (
                            <div className="p-8 text-center">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
                                <p className="mt-2 text-gray-600">{t('calendar.loadingTasks')}</p>
                            </div>
                        ) : selectedDateTasks.length > 0 ? (
                            <div>
                                {selectedDateTasks.map((task) => (
                                    <div key={task.id} className="task-container">
                                        <TaskItem task={task} isDraggable={true} />
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="p-8 text-center text-gray-500">
                                {selectedDate ? t('calendar.noTasksForDay') : t('calendar.selectDateToViewTasks')}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
} 