"use client";

import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs, doc, updateDoc } from "firebase/firestore";
import { Task, Block } from "@/types";
import Calendar from "@/app/components/Calendar";
import TaskItem from "@/app/components/TaskItem";
import UnassignedTasksSection from "@/app/components/UnassignedTasksSection";
import { ArrowPathIcon, ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";
import useRequireAuth from "@/app/hooks/useRequireAuth";
import { useMessages } from "@/app/hooks/useMessages";
import { formatDate, parseDate, getMonthRange } from "@/lib/dateUtils";
// import { locales } from "@/i18n";

// 静的生成のためのパラメータを提供
// export function generateStaticParams() {
//     return locales.map((locale) => ({ locale }));
// }

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

                console.log("allTasks", allTasks);

                // クライアント側で日付範囲でフィルタリング
                const startDateStr = formatDate(firstDay);
                const endDateStr = formatDate(lastDay);

                const filteredTasks = allTasks.filter(task => {
                    // 日付がないタスクも含める
                    if (!task.date) return true;

                    // 文字列の日付をDate型に変換して比較
                    const taskDate = parseDate(task.date);
                    return taskDate >= firstDay && taskDate <= lastDay;
                });

                console.log("filteredTasks", filteredTasks);

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

        const dateStr = formatDate(selectedDate);
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

    // 日付選択ハンドラ
    const handleDateSelect = (date: Date) => {
        setSelectedDate(date);
    };

    return (
        <div className="container mx-auto px-4 py-6">
            {/* ヘッダー部分 */}
            <div className="flex flex-col md:flex-row justify-between items-center mb-6">
                <h1 className="text-2xl md:text-3xl font-bold mb-4 md:mb-0">
                    {t('calendar.title')}
                </h1>

                <div className="flex space-x-2">
                    <button
                        onClick={goToPreviousMonth}
                        className="px-3 py-1.5 rounded-lg border dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800"
                    >
                        ← {t('calendar.prevMonth')}
                    </button>
                    <button
                        onClick={goToToday}
                        className="px-3 py-1.5 rounded-lg bg-primary-500 text-white hover:bg-primary-600"
                    >
                        {t('calendar.today')}
                    </button>
                    <button
                        onClick={goToNextMonth}
                        className="px-3 py-1.5 rounded-lg border dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800"
                    >
                        {t('calendar.nextMonth')} →
                    </button>
                </div>
            </div>

            {/* カレンダーとタスク表示部分 */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* 左側: 未割り当てタスク */}
                <div className="lg:col-span-1">
                    <UnassignedTasksSection
                        blocks={[]}
                        tasks={tasks.filter(task => !task.date || (task.date && !task.blockId))}
                        loading={loading}
                        date=""
                    />
                </div>

                {/* 右側: カレンダーと選択した日付のタスク */}
                <div className="lg:col-span-2 space-y-6">
                    {/* カレンダー */}
                    <Calendar
                        currentMonth={currentMonth}
                        tasks={tasks}
                        onPrevMonth={goToPreviousMonth}
                        onNextMonth={goToNextMonth}
                        onSelectDate={handleDateSelect}
                        selectedDate={selectedDate}
                    />

                    {/* 選択した日付のタスク */}
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
                        {selectedDate ? (
                            <>
                                <h2 className="text-xl font-semibold mb-4">
                                    {selectedDate.toLocaleDateString(t('common.locale'), {
                                        weekday: 'long',
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric'
                                    })}のタスク
                                </h2>

                                {loading ? (
                                    <div className="flex justify-center py-8">
                                        <svg className="animate-spin h-8 w-8 text-primary-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                    </div>
                                ) : selectedDateTasks.length > 0 ? (
                                    <div className="space-y-2">
                                        {selectedDateTasks.map((task) => (
                                            <div
                                                key={task.id}
                                                className={`p-3 rounded-lg border ${task.status === 'done'
                                                    ? 'bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-700'
                                                    : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700'
                                                    }`}
                                            >
                                                <div className="flex items-start justify-between">
                                                    <div className={`flex-1 ${task.status === 'done' ? 'line-through text-gray-500' : ''}`}>
                                                        <h3 className="font-medium">{task.title}</h3>
                                                        {task.description && (
                                                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{task.description}</p>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="empty-state">
                                        <svg className="w-12 h-12 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
                                        </svg>
                                        <p>{t('calendar.noTasksForDay')}</p>
                                    </div>
                                )}
                            </>
                        ) : (
                            <div className="empty-state py-12">
                                <svg className="w-16 h-16 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                                </svg>
                                <h3 className="text-xl font-medium mb-2">{t('calendar.selectDateMessage')}</h3>
                                <p className="text-gray-500 dark:text-gray-400">{t('calendar.selectDateDescription')}</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
} 