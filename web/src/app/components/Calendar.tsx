"use client";

import { FC } from "react";
import { Task } from "@/types";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";
import { useTheme } from "./ThemeProvider";

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
    const isDark = theme === "dark";

    // 月の日数を取得
    const getDaysInMonth = (year: number, month: number) => {
        return new Date(year, month + 1, 0).getDate();
    };

    // 月の最初の日の曜日を取得（0: 日曜日, 1: 月曜日, ...）
    const getFirstDayOfMonth = (year: number, month: number) => {
        return new Date(year, month, 1).getDay();
    };

    // 月の最後の日の曜日を取得
    const getLastDayOfMonth = (year: number, month: number) => {
        const lastDay = new Date(year, month + 1, 0);
        return lastDay.getDay();
    };

    // 前月の最後の数日を取得
    const getPreviousMonthDays = (year: number, month: number) => {
        const firstDayOfMonth = getFirstDayOfMonth(year, month);
        const prevMonth = month === 0 ? 11 : month - 1;
        const prevMonthYear = month === 0 ? year - 1 : year;
        const daysInPrevMonth = getDaysInMonth(prevMonthYear, prevMonth);

        const days = [];
        for (let i = 0; i < firstDayOfMonth; i++) {
            const day = daysInPrevMonth - firstDayOfMonth + i + 1;
            days.push({
                date: new Date(prevMonthYear, prevMonth, day),
                isCurrentMonth: false,
                isPreviousMonth: true,
            });
        }
        return days;
    };

    // 現在の月の日を取得
    const getCurrentMonthDays = (year: number, month: number) => {
        const daysInMonth = getDaysInMonth(year, month);
        const days = [];

        for (let i = 1; i <= daysInMonth; i++) {
            days.push({
                date: new Date(year, month, i),
                isCurrentMonth: true,
                isPreviousMonth: false,
                isNextMonth: false,
            });
        }
        return days;
    };

    // 次月の最初の数日を取得
    const getNextMonthDays = (year: number, month: number) => {
        const lastDayOfMonth = getLastDayOfMonth(year, month);
        const nextMonth = month === 11 ? 0 : month + 1;
        const nextMonthYear = month === 11 ? year + 1 : year;

        const days = [];
        for (let i = 0; i < 6 - lastDayOfMonth; i++) {
            days.push({
                date: new Date(nextMonthYear, nextMonth, i + 1),
                isCurrentMonth: false,
                isNextMonth: true,
            });
        }
        return days;
    };

    // カレンダーの日付を生成
    const generateCalendarDays = () => {
        const year = currentMonth.getFullYear();
        const month = currentMonth.getMonth();

        const prevMonthDays = getPreviousMonthDays(year, month);
        const currentMonthDays = getCurrentMonthDays(year, month);
        const nextMonthDays = getNextMonthDays(year, month);

        return [...prevMonthDays, ...currentMonthDays, ...nextMonthDays];
    };

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

    // 今日の日付かどうかをチェック
    const isToday = (date: Date) => {
        const today = new Date();
        return (
            date.getDate() === today.getDate() &&
            date.getMonth() === today.getMonth() &&
            date.getFullYear() === today.getFullYear()
        );
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

    // 曜日の表示
    const weekdays = ["日", "月", "火", "水", "木", "金", "土"];

    // 月の表示
    const monthName = currentMonth.toLocaleDateString('ja-JP', {
        year: 'numeric',
        month: 'long',
    });

    const calendarDays = generateCalendarDays();

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

            {/* 曜日ヘッダー */}
            <div className="grid grid-cols-7 border-b">
                {weekdays.map((day, index) => (
                    <div
                        key={index}
                        className={`py-1 sm:py-2 text-center text-xs sm:text-sm font-medium ${index === 0
                            ? 'text-red-500'
                            : index === 6
                                ? 'text-blue-500'
                                : isDark
                                    ? 'text-gray-300'
                                    : 'text-gray-700'
                            }`}
                    >
                        {day}
                    </div>
                ))}
            </div>

            {/* カレンダー本体 */}
            <div className="grid grid-cols-7">
                {calendarDays.map((day, index) => {
                    const tasksForDay = getTasksForDate(day.date);
                    const isWeekend = day.date.getDay() === 0 || day.date.getDay() === 6;

                    return (
                        <div
                            key={index}
                            className={`min-h-[60px] sm:min-h-[80px] p-1 border-b border-r ${index % 7 === 6 ? '' : 'border-r'
                                } ${index >= 35 ? '' : 'border-b'} ${day.isCurrentMonth
                                    ? isDark
                                        ? 'bg-gray-800'
                                        : 'bg-white'
                                    : isDark
                                        ? 'bg-gray-900 text-gray-500'
                                        : 'bg-gray-50 text-gray-400'
                                }`}
                        >
                            <button
                                onClick={() => onSelectDate(day.date)}
                                className={`w-full h-full p-1 flex flex-col items-start rounded-md transition-colors ${isSelected(day.date)
                                    ? 'bg-primary-100 text-primary-800'
                                    : 'hover:bg-gray-100'
                                    }`}
                            >
                                <div
                                    className={`flex justify-center items-center w-6 h-6 sm:w-7 sm:h-7 rounded-full mb-1 ${isToday(day.date)
                                        ? 'bg-primary-500 text-white'
                                        : isWeekend && day.isCurrentMonth
                                            ? day.date.getDay() === 0
                                                ? 'text-red-500'
                                                : 'text-blue-500'
                                            : ''
                                        }`}
                                >
                                    {day.date.getDate()}
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
                                            <div className="text-xs text-gray-500 px-1">
                                                +{tasksForDay.length - 2} 件
                                            </div>
                                        )}
                                    </div>
                                )}
                            </button>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default Calendar;