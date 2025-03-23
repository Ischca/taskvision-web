"use client";

import React, { FC, useMemo } from "react";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";
import { useTheme } from "./ThemeProvider";
import { useTranslations } from "next-intl";

interface MiniCalendarProps {
  selectedDate: Date | undefined;
  onDateChange: (date: Date | undefined) => void;
  month?: Date; // 表示する月（指定しない場合は現在の月）
}

const MiniCalendar: FC<MiniCalendarProps> = ({
  selectedDate,
  onDateChange,
  month,
}) => {
  const { theme } = useTheme();
  const t = useTranslations();
  const isDark = theme === "dark";

  // 現在の月を取得（propsで指定されていない場合）
  const currentMonth = useMemo(() => month || new Date(), [month]);

  // 前月へ移動
  const goToPrevMonth = () => {
    const newMonth = new Date(currentMonth);
    newMonth.setMonth(newMonth.getMonth() - 1);
    if (onDateChange && selectedDate) {
      // 同じ日付で月だけ変更
      const newDate = new Date(selectedDate);
      newDate.setFullYear(newMonth.getFullYear());
      newDate.setMonth(newMonth.getMonth());
      // 存在しない日付の場合（例: 2月31日）は月の最終日に設定
      const lastDayOfMonth = new Date(
        newMonth.getFullYear(),
        newMonth.getMonth() + 1,
        0,
      ).getDate();
      if (newDate.getDate() > lastDayOfMonth) {
        newDate.setDate(lastDayOfMonth);
      }
      onDateChange(newDate);
    }
  };

  // 次月へ移動
  const goToNextMonth = () => {
    const newMonth = new Date(currentMonth);
    newMonth.setMonth(newMonth.getMonth() + 1);
    if (onDateChange && selectedDate) {
      // 同じ日付で月だけ変更
      const newDate = new Date(selectedDate);
      newDate.setFullYear(newMonth.getFullYear());
      newDate.setMonth(newMonth.getMonth());
      // 存在しない日付の場合（例: 2月31日）は月の最終日に設定
      const lastDayOfMonth = new Date(
        newMonth.getFullYear(),
        newMonth.getMonth() + 1,
        0,
      ).getDate();
      if (newDate.getDate() > lastDayOfMonth) {
        newDate.setDate(lastDayOfMonth);
      }
      onDateChange(newDate);
    }
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
  const weekdays =
    t("common.locale") === "en-US"
      ? ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
      : ["日", "月", "火", "水", "木", "金", "土"];

  // 月の表示 - 国際化対応
  const monthName = currentMonth.toLocaleDateString(
    t("common.locale") || "ja-JP",
    {
      year: "numeric",
      month: "long",
    },
  );

  // 日付クリックハンドラ
  const handleDateClick = (date: Date) => {
    onDateChange(date);
  };

  return (
    <div
      className={`rounded-lg shadow-md overflow-hidden ${isDark ? "bg-gray-800 text-white" : "bg-white"}`}
    >
      {/* カレンダーヘッダー */}
      <div className="p-2 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
        <button
          onClick={goToPrevMonth}
          className={`p-1 rounded-full ${
            isDark
              ? "hover:bg-gray-700 text-gray-300"
              : "hover:bg-gray-100 text-gray-700"
          }`}
        >
          <ChevronLeftIcon className="h-4 w-4" />
        </button>
        <h2 className="text-sm font-semibold">{monthName}</h2>
        <button
          onClick={goToNextMonth}
          className={`p-1 rounded-full ${
            isDark
              ? "hover:bg-gray-700 text-gray-300"
              : "hover:bg-gray-100 text-gray-700"
          }`}
        >
          <ChevronRightIcon className="h-4 w-4" />
        </button>
      </div>

      {/* カレンダー本体 */}
      <div className="p-1">
        {/* 曜日ヘッダー */}
        <div className="weekday-header">
          {weekdays.map((day, index) => (
            <div
              key={index}
              className={`weekday-cell ${
                index === 0 ? "sunday" : index === 6 ? "saturday" : "weekday"
              }`}
            >
              {day}
            </div>
          ))}
        </div>

        {/* 日付グリッド - コンパクト表示 */}
        <div className="grid grid-cols-7 gap-0.5">
          {calendarDays.map((day, index) => {
            const isSunday = day.getDay() === 0;
            const isSaturday = day.getDay() === 6;

            return (
              <div
                key={index}
                className={`relative p-0.5 rounded-md cursor-pointer
                                    ${!isCurrentMonth(day) ? "opacity-40" : ""}
                                    ${isSelected(day) ? "bg-primary-100 dark:bg-primary-900" : ""}
                                    ${isDark ? "hover:bg-gray-700" : "hover:bg-gray-50"}`}
                onClick={() => handleDateClick(day)}
              >
                <div
                  className={`flex justify-center items-center w-6 h-6 rounded-full text-xs
                                        ${
                                          isSelected(day)
                                            ? "bg-primary-500 text-white"
                                            : isToday(day)
                                              ? "border border-primary-500"
                                              : ""
                                        }
                                        ${
                                          !isSelected(day) && isSunday
                                            ? "text-red-500"
                                            : !isSelected(day) && isSaturday
                                              ? "text-blue-500"
                                              : ""
                                        }`}
                >
                  {day.getDate()}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default MiniCalendar;
