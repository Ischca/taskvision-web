"use client";

import React, { FC, useCallback, useMemo } from "react";
import { Task } from "@/types";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";
import { useTheme } from "./ThemeProvider";
import { useMessages } from '@/app/hooks/useMessages';

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

    // カレンダーに表示する日付を生成
    const calendarDays = useMemo(() => {
        const year = currentMonth.getFullYear();
        const month = currentMonth.getMonth();

        // 月の初日
        const firstDay = new Date(year, month, 1);
        // 月の最終日
        const lastDay = new Date(year, month + 1, 0);

        // 月の初日の曜日（0: 日曜日, 1: 月曜日, ..., 6: 土曜日）
        const firstDayOfWeek = firstDay.getDay();

        // カレンダーに表示する日付の配列
        const days: Date[] = [];

        // 前月の日付を追加
        for (let i = firstDayOfWeek; i > 0; i--) {
            const day = new Date(year, month, 1 - i);
            days.push(day);
        }

        // 当月の日付を追加
        for (let i = 1; i <= lastDay.getDate(); i++) {
            const day = new Date(year, month, i);
            days.push(day);
        }

        // 翌月の日付を追加（6週間分の表示に調整）
        const daysNeeded = 42 - days.length; // 6週間分（6 * 7 = 42）になるように
        for (let i = 1; i <= daysNeeded; i++) {
            const day = new Date(year, month + 1, i);
            days.push(day);
        }

        return days;
    }, [currentMonth]);

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

    // 現在の月かどうかをチェック
    const isCurrentMonth = (date: Date) => {
        return date.getMonth() === currentMonth.getMonth();
    };

    // 今日の日付かどうかをチェック
    const isToday = (date: Date) => {
        const today = new Date();
        return (
            date.getDate() === today.getDate() &&
            date.getMonth() === today.getMonth() &&
            date.getFullYear() === today.getFullYear()
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

    // 日付クリックハンドラ
    const handleDateClick = (date: Date) => {
        onSelectDate(date);
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

            {/* カレンダー本体 */}
            <div className="p-1 sm:p-2">
                {/* 曜日ヘッダー */}
                <div className="weekday-header">
                    {weekdays.map((day, index) => (
                        <div
                            key={index}
                            className={`weekday-cell ${index === 0
                                ? 'sunday'
                                : index === 6
                                    ? 'saturday'
                                    : 'weekday'}`}
                        >
                            {day}
                        </div>
                    ))}
                </div>

                {/* 日付グリッド */}
                <div className="calendar-grid">
                    {calendarDays.map((day, index) => {
                        const tasksForDay = getTasksForDate(day);
                        const isSunday = day.getDay() === 0;
                        const isSaturday = day.getDay() === 6;

                        return (
                            <div
                                key={index}
                                className={`calendar-cell ${isCurrentMonth(day) ? 'current-month' : 'other-month'
                                    } ${isSelected(day) ? 'selected' : ''} ${isToday(day) ? 'today' : ''
                                    }`}
                                onClick={() => handleDateClick(day)}
                            >
                                {/* 日付表示 */}
                                <div className="flex justify-between items-start">
                                    <div
                                        className={`calendar-day-number ${isSelected(day) ? 'selected' : ''
                                            } ${isToday(day) ? 'today' : ''} ${isSunday ? 'sunday' : isSaturday ? 'saturday' : ''
                                            }`}
                                    >
                                        {day.getDate()}
                                    </div>

                                    {/* タスク数表示 */}
                                    {tasksForDay.length > 0 && (
                                        <span className="calendar-task-count">
                                            {tasksForDay.length}
                                        </span>
                                    )}
                                </div>

                                {/* タスク表示 */}
                                <div className="mt-1 space-y-1">
                                    {tasksForDay.slice(0, 2).map((task, i) => (
                                        <div
                                            key={i}
                                            className={`calendar-task-item ${task.status === 'done' ? 'done' : 'pending'
                                                }`}
                                            title={task.title}
                                        >
                                            {task.title}
                                        </div>
                                    ))}
                                    {tasksForDay.length > 2 && (
                                        <div className="calendar-more-tasks">
                                            +{tasksForDay.length - 2} {t('calendar.moreTasks')}
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default Calendar;