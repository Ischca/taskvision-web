"use client";

import { FC, useState } from "react";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";
import { useTheme } from "./ThemeProvider";

interface DatePickerProps {
    selectedDate: Date;
    onDateSelect: (date: Date) => void;
    onClose: () => void;
}

const DatePicker: FC<DatePickerProps> = ({
    selectedDate,
    onDateSelect,
    onClose,
}) => {
    const [currentMonth, setCurrentMonth] = useState(new Date(selectedDate));
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
            });
        }
        return days;
    };

    // 次月の最初の数日を取得（6行になるように調整）
    const getNextMonthDays = (year: number, month: number) => {
        const firstDayOfMonth = getFirstDayOfMonth(year, month);
        const daysInMonth = getDaysInMonth(year, month);
        const nextMonth = month === 11 ? 0 : month + 1;
        const nextMonthYear = month === 11 ? year + 1 : year;

        const totalCells = 42; // 6行 x 7列
        const filledCells = firstDayOfMonth + daysInMonth;
        const remainingCells = totalCells - filledCells;

        const days = [];
        for (let i = 1; i <= remainingCells; i++) {
            days.push({
                date: new Date(nextMonthYear, nextMonth, i),
                isCurrentMonth: false,
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

    // 前月へ移動
    const goToPreviousMonth = () => {
        const newDate = new Date(currentMonth);
        newDate.setMonth(newDate.getMonth() - 1);
        setCurrentMonth(newDate);
    };

    // 次月へ移動
    const goToNextMonth = () => {
        const newDate = new Date(currentMonth);
        newDate.setMonth(newDate.getMonth() + 1);
        setCurrentMonth(newDate);
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

    // 日付文字列を生成する関数（タイムゾーンの問題を解決）
    const formatDateString = (date: Date): string => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    // 選択された日付かどうかをチェック
    const isSelected = (date: Date) => {
        return (
            date.getDate() === selectedDate.getDate() &&
            date.getMonth() === selectedDate.getMonth() &&
            date.getFullYear() === selectedDate.getFullYear()
        );
    };

    // 曜日の表示
    const weekdays = ["日", "月", "火", "水", "木", "金", "土"];

    const calendarDays = generateCalendarDays();

    return (
        <div className="bg-white p-2 sm:p-4 rounded-lg shadow-lg w-[280px] sm:w-[320px]">
            <div className="flex justify-between items-center mb-4">
                <button
                    onClick={goToPreviousMonth}
                    className="p-1 rounded-full hover:bg-gray-100"
                >
                    <ChevronLeftIcon className="h-5 w-5 text-gray-500" />
                </button>
                <h3 className="text-sm sm:text-base font-medium">
                    {currentMonth.toLocaleDateString('ja-JP', { year: 'numeric', month: 'long' })}
                </h3>
                <button
                    onClick={goToNextMonth}
                    className="p-1 rounded-full hover:bg-gray-100"
                >
                    <ChevronRightIcon className="h-5 w-5 text-gray-500" />
                </button>
            </div>

            <div className="grid grid-cols-7 gap-1">
                {/* 曜日のヘッダー */}
                {weekdays.map((day, index) => (
                    <div
                        key={index}
                        className={`text-center text-xs sm:text-sm font-medium py-1 ${index === 0
                            ? 'text-red-500'
                            : index === 6
                                ? 'text-blue-500'
                                : 'text-gray-500'
                            }`}
                    >
                        {day}
                    </div>
                ))}

                {/* 日付のグリッド */}
                {calendarDays.map((day, index) => (
                    <button
                        key={index}
                        onClick={() => {
                            onDateSelect(day.date);
                            onClose();
                        }}
                        className={`
                            w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center rounded-full text-xs sm:text-sm
                            ${isToday(day.date)
                                ? 'bg-primary-100 text-primary-800 font-bold'
                                : ''
                            }
                            ${isSelected(day.date)
                                ? 'bg-primary-500 text-white'
                                : 'hover:bg-gray-100'
                            }
                            ${day.date.getMonth() !== currentMonth.getMonth()
                                ? 'text-gray-400'
                                : day.date.getDay() === 0
                                    ? 'text-red-500'
                                    : day.date.getDay() === 6
                                        ? 'text-blue-500'
                                        : ''
                            }
                        `}
                    >
                        {day.date.getDate()}
                    </button>
                ))}
            </div>

            <div className="mt-4 flex justify-between">
                <button
                    onClick={() => {
                        onDateSelect(new Date());
                        onClose();
                    }}
                    className="px-2 py-1 text-xs sm:text-sm text-primary-600 hover:bg-primary-50 rounded"
                >
                    今日
                </button>
                <button
                    onClick={onClose}
                    className="px-2 py-1 text-xs sm:text-sm text-gray-600 hover:bg-gray-100 rounded"
                >
                    閉じる
                </button>
            </div>
        </div>
    );
};

export default DatePicker; 