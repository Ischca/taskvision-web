"use client";

import React from "react";
import { useTheme } from "../ThemeProvider";
import { useTranslations } from "next-intl";
import { RepeatType, RepeatEndType } from "@/types";
import ShadcnDatePicker from "../ShadcnDatePicker";

interface RepeatSettingsProps {
  enableRepeat: boolean;
  setEnableRepeat: (value: boolean) => void;
  repeatType: RepeatType;
  setRepeatType: (value: RepeatType) => void;
  repeatFrequency: number;
  setRepeatFrequency: (value: number) => void;
  repeatDaysOfWeek: number[];
  toggleDayOfWeek: (day: number) => void;
  repeatDayOfMonth: number;
  setRepeatDayOfMonth: (value: number) => void;
  repeatEndType: RepeatEndType;
  setRepeatEndType: (value: RepeatEndType) => void;
  repeatOccurrences: number;
  setRepeatOccurrences: (value: number) => void;
  repeatEndDate: string;
  setRepeatEndDate: (value: string) => void;
  getDayName: (day: number) => string;
  setIsAnyPopoverOpen: (value: boolean) => void;
  dateToString: (date: Date) => string;
}

// ShadcnDatePickerコンポーネントに使用するダミーの onOpenChange プロパティを定義
const datePickerWithOpenChange = ({
  date,
  onDateChange,
  disabled,
  onOpenChange,
}: {
  date: string;
  onDateChange: (date: string | undefined) => void;
  disabled: boolean;
  onOpenChange: (open: boolean) => void;
}) => {
  return (
    <ShadcnDatePicker
      date={date}
      onDateChange={onDateChange}
      disabled={disabled}
      // @ts-expect-error
      onOpenChange={onOpenChange}
    />
  );
};

const RepeatSettings: React.FC<RepeatSettingsProps> = ({
  enableRepeat,
  setEnableRepeat,
  repeatType,
  setRepeatType,
  repeatFrequency,
  setRepeatFrequency,
  repeatDaysOfWeek,
  toggleDayOfWeek,
  repeatDayOfMonth,
  setRepeatDayOfMonth,
  repeatEndType,
  setRepeatEndType,
  repeatOccurrences,
  setRepeatOccurrences,
  repeatEndDate,
  setRepeatEndDate,
  getDayName,
  setIsAnyPopoverOpen,
  dateToString,
}) => {
  const { theme } = useTheme();
  const t = useTranslations();

  return (
    <div className="space-y-4 mt-2 mb-4">
      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          id="repeat-task"
          checked={enableRepeat}
          onChange={(e) => setEnableRepeat(e.target.checked)}
          className="h-4 w-4"
        />
        <label htmlFor="repeat-task" className="text-sm font-medium">
          {t("tasks.repeatTask")}
        </label>
      </div>

      {enableRepeat && (
        <div className="space-y-4 pl-6">
          <div>
            <label htmlFor="repeat-type" className="block text-sm mb-1">
              {t("tasks.repeatPattern")}
            </label>
            <select
              id="repeat-type"
              value={repeatType}
              onChange={(e) => setRepeatType(e.target.value as RepeatType)}
              className="w-full p-2 text-sm border rounded"
            >
              <option value="daily">{t("tasks.repeatDaily")}</option>
              <option value="weekdays">{t("tasks.repeatWeekdays")}</option>
              <option value="weekly">{t("tasks.repeatWeekly")}</option>
              <option value="monthly">{t("tasks.repeatMonthly")}</option>
              <option value="custom">{t("tasks.repeatCustom")}</option>
            </select>
          </div>

          {repeatType === "custom" && (
            <div>
              <label htmlFor="repeat-frequency" className="block text-sm mb-1">
                {t("tasks.frequency")}
              </label>
              <div className="flex items-center">
                <span className="mr-2">{t("tasks.interval")}:</span>
                <select
                  id="repeat-frequency"
                  value={repeatFrequency}
                  onChange={(e) => setRepeatFrequency(Number(e.target.value))}
                  className="p-1 text-sm border rounded"
                >
                  <option value="1">{t("tasks.everyDay")}</option>
                  <option value="2">{t("tasks.everyTwoDays")}</option>
                  <option value="3">{t("tasks.everyThreeDays")}</option>
                  <option value="5">{t("tasks.everyFiveDays")}</option>
                  <option value="7">{t("tasks.everyWeek")}</option>
                </select>
              </div>
            </div>
          )}

          {repeatType === "weekly" && (
            <div>
              <label className="block text-sm mb-2">
                {t("tasks.selectDaysOfWeek")}
              </label>
              <div className="flex flex-wrap gap-2">
                {[0, 1, 2, 3, 4, 5, 6].map((day) => (
                  <button
                    key={day}
                    type="button"
                    onClick={() => toggleDayOfWeek(day)}
                    className={`px-2 py-1 text-xs rounded ${
                      repeatDaysOfWeek.includes(day)
                        ? "bg-blue-500 text-white"
                        : "bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
                    }`}
                  >
                    {getDayName(day)}
                  </button>
                ))}
              </div>
              {repeatDaysOfWeek.length === 0 && (
                <p className="text-xs text-red-500 mt-1">
                  {t("tasks.selectAtLeastOneDay")}
                </p>
              )}
            </div>
          )}

          {repeatType === "monthly" && (
            <div>
              <label className="block text-sm mb-2">
                {t("tasks.selectDate")}
              </label>
              <select
                value={repeatDayOfMonth}
                onChange={(e) => setRepeatDayOfMonth(Number(e.target.value))}
                className="p-2 text-sm border rounded w-20"
              >
                {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => (
                  <option key={day} value={day}>
                    {day} {t("tasks.dayOfMonth")}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="block text-sm mb-2">
              {t("tasks.endCondition")}
            </label>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <input
                  type="radio"
                  id="repeat-no-end"
                  name="repeat-end-type"
                  checked={repeatEndType === "never"}
                  onChange={() => setRepeatEndType("never")}
                  className="h-4 w-4"
                />
                <label htmlFor="repeat-no-end" className="text-sm">
                  {t("tasks.noEndDate")}
                </label>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="radio"
                  id="repeat-count"
                  name="repeat-end-type"
                  checked={repeatEndType === "after"}
                  onChange={() => setRepeatEndType("after")}
                  className="h-4 w-4"
                />
                <div className="flex items-center">
                  <span className="mr-2">{t("tasks.specifyCount")}:</span>
                  <input
                    type="number"
                    value={repeatOccurrences}
                    onChange={(e) =>
                      setRepeatOccurrences(Number(e.target.value))
                    }
                    min="1"
                    max="999"
                    disabled={repeatEndType !== "after"}
                    className="w-16 p-1 text-sm border rounded"
                  />
                  <span className="ml-2">{t("tasks.times")}</span>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="radio"
                  id="repeat-until"
                  name="repeat-end-type"
                  checked={repeatEndType === "on_date"}
                  onChange={() => setRepeatEndType("on_date")}
                  className="h-4 w-4"
                />
                <div className="flex flex-col">
                  <span className="mr-2 mb-2">{t("tasks.specifyDate")}:</span>
                  <ShadcnDatePicker
                    date={repeatEndDate}
                    onDateChange={(date) => setRepeatEndDate(date || "")}
                    disabled={repeatEndType !== "on_date"}
                    className="w-full"
                    // @ts-expect-error
                    onOpenChange={(open: boolean) => setIsAnyPopoverOpen(open)}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RepeatSettings;
