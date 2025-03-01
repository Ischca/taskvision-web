"use client";

import React, { FC, useCallback, useMemo } from "react";
import { Task } from "@/types";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";
import { useTheme } from "./ThemeProvider";
import { useMessages } from '@/app/hooks/useMessages';
import { UnifiedCalendar } from "@/components/ui/unified-calendar";

interface CalendarProps {
    currentMonth: Date;
    tasks: Task[];
    onPrevMonth: () => void;
    onNextMonth: () => void;
    onSelectDate: (date: Date) => void;
    selectedDate: Date | null;
}

const Calendar: FC<CalendarProps> = ({
    currentMonth,
    tasks,
    onPrevMonth,
    onNextMonth,
    onSelectDate,
    selectedDate,
}) => {
    const { theme } = useTheme();
    const { t } = useMessages();
    const isDark = theme === "dark";

    // 日付文字列を生成する関数（タイムゾーンの問題を解決）
    const formatDateString = (date: Date): string => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    // 日付ごとのタスク数を取得
    const getTasksForDate = (date: Date) => {
        const dateStr = formatDateString(date);
        return tasks.filter(task => task.date === dateStr);
    };

    // 選択された日付かどうかをチェック
    const isSelected = (date: Date) => {
        if (!selectedDate) return false;
        return (
            date.getDate() === selectedDate.getDate() &&
            date.getMonth() === selectedDate.getMonth() &&
            date.getFullYear() === selectedDate.getFullYear()
        );
    };

    // 曜日の表示 - 国際化対応
    const weekdays = t('common.locale') === 'en-US'
        ? ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
        : ["日", "月", "火", "水", "木", "金", "土"];

    // 月の表示 - 国際化対応
    const monthName = currentMonth.toLocaleDateString(t('common.locale') || 'ja-JP', {
        year: 'numeric',
        month: 'long',
    });

    const handleDateSelect = (date: Date | undefined) => {
        if (date) {
            onSelectDate(date);
        }
    };

    // カスタムデイコンテンツレンダラー
    const customDayContent = (day: Date) => {
        const tasksForDay = getTasksForDate(day);
        const isWeekend = day.getDay() === 0 || day.getDay() === 6;
        const isSunday = day.getDay() === 0;
        const isSaturday = day.getDay() === 6;

        return (
            <div className="flex flex-col items-center h-full w-full">
                <div
                    className={`flex justify-center items-center w-6 h-6 sm:w-7 sm:h-7 rounded-full mb-1 ${isSelected(day)
                            ? 'bg-primary-500 text-white'
                            : isSunday
                                ? 'text-red-500'
                                : isSaturday
                                    ? 'text-blue-500'
                                    : ''
                        }`}
                >
                    {day.getDate()}
                </div>

                {/* タスク表示 */}
                {tasksForDay.length > 0 && (
                    <div className="w-full">
                        {tasksForDay.slice(0, 2).map((task, i) => (
                            <div
                                key={i}
                                className={`text-xs truncate rounded px-1 py-0.5 mb-0.5 ${task.status === 'done'
                                        ? 'line-through text-gray-500 bg-gray-100'
                                        : 'bg-primary-100 text-primary-800'
                                    }`}
                            >
                                {task.title}
                            </div>
                        ))}
                        {tasksForDay.length > 2 && (
                            <div className="text-xs text-center text-gray-500">
                                +{tasksForDay.length - 2} {t('common.calendar.moreTasks')}
                            </div>
                        )}
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className={`rounded-lg shadow-md overflow-hidden ${isDark ? 'bg-gray-800 text-white' : 'bg-white'}`}>
            {/* カレンダーヘッダー */}
            <div className="p-3 sm:p-4 flex justify-between items-center border-b">
                <h2 className="text-base sm:text-xl font-semibold">{monthName}</h2>
                <div className="flex space-x-2">
                    <button
                        onClick={onPrevMonth}
                        className={`p-1.5 sm:p-2 rounded-full ${isDark
                                ? 'hover:bg-gray-700 text-gray-300'
                                : 'hover:bg-gray-100 text-gray-700'
                            }`}
                    >
                        <ChevronLeftIcon className="h-4 w-4 sm:h-5 sm:w-5" />
                    </button>
                    <button
                        onClick={onNextMonth}
                        className={`p-1.5 sm:p-2 rounded-full ${isDark
                                ? 'hover:bg-gray-700 text-gray-300'
                                : 'hover:bg-gray-100 text-gray-700'
                            }`}
                    >
                        <ChevronRightIcon className="h-4 w-4 sm:h-5 sm:w-5" />
                    </button>
                </div>
            </div>

            {/* UnifiedCalendarを使用 */}
            <UnifiedCalendar
                mode="embedded"
                date={selectedDate || undefined}
                onDateChange={handleDateSelect}
                calendarMode="single"
                className="custom-calendar"
            // ここに他のカスタムプロパティを追加
            />
        </div>
    );
};

export default Calendar;