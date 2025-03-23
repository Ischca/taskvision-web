"use client";

import React from "react";
import { useTheme } from "../ThemeProvider";
import { useTranslations } from "next-intl";

interface ReminderSettingsProps {
  enableBlockStartReminder: boolean;
  setEnableBlockStartReminder: (value: boolean) => void;
  blockStartReminderMinutes: number;
  setBlockStartReminderMinutes: (value: number) => void;
  enableBlockEndReminder: boolean;
  setEnableBlockEndReminder: (value: boolean) => void;
  blockEndReminderMinutes: number;
  setBlockEndReminderMinutes: (value: number) => void;
  enableDeadlineReminder: boolean;
  setEnableDeadlineReminder: (value: boolean) => void;
  deadlineReminderMinutes: number;
  setDeadlineReminderMinutes: (value: number) => void;
  deadline: string;
}

export const ReminderSettings: React.FC<ReminderSettingsProps> = ({
  enableBlockStartReminder,
  setEnableBlockStartReminder,
  blockStartReminderMinutes,
  setBlockStartReminderMinutes,
  enableBlockEndReminder,
  setEnableBlockEndReminder,
  blockEndReminderMinutes,
  setBlockEndReminderMinutes,
  enableDeadlineReminder,
  setEnableDeadlineReminder,
  deadlineReminderMinutes,
  setDeadlineReminderMinutes,
  deadline,
}) => {
  const { theme } = useTheme();
  const t = useTranslations();

  return (
    <div className="space-y-4 mt-2 mb-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="block-start-reminder"
            checked={enableBlockStartReminder}
            onChange={(e) => setEnableBlockStartReminder(e.target.checked)}
            className="h-4 w-4"
          />
          <label htmlFor="block-start-reminder" className="text-sm">
            {t("tasks.notifyBeforeBlockStart")}
          </label>
        </div>
        {enableBlockStartReminder && (
          <select
            value={blockStartReminderMinutes}
            onChange={(e) =>
              setBlockStartReminderMinutes(Number(e.target.value))
            }
            className="text-sm p-1 border rounded"
          >
            <option value="5">5 {t("common.time.minutesBefore")}</option>
            <option value="10">10 {t("common.time.minutesBefore")}</option>
            <option value="15">15 {t("common.time.minutesBefore")}</option>
            <option value="30">30 {t("common.time.minutesBefore")}</option>
            <option value="60">1 {t("common.time.hourBefore")}</option>
          </select>
        )}
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="block-end-reminder"
            checked={enableBlockEndReminder}
            onChange={(e) => setEnableBlockEndReminder(e.target.checked)}
            className="h-4 w-4"
          />
          <label htmlFor="block-end-reminder" className="text-sm">
            {t("tasks.notifyBeforeBlockEnd")}
          </label>
        </div>
        {enableBlockEndReminder && (
          <select
            value={blockEndReminderMinutes}
            onChange={(e) => setBlockEndReminderMinutes(Number(e.target.value))}
            className="text-sm p-1 border rounded"
          >
            <option value="5">5 {t("common.time.minutesBefore")}</option>
            <option value="10">10 {t("common.time.minutesBefore")}</option>
            <option value="15">15 {t("common.time.minutesBefore")}</option>
            <option value="30">30 {t("common.time.minutesBefore")}</option>
          </select>
        )}
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="deadline-reminder"
            checked={enableDeadlineReminder}
            onChange={(e) => setEnableDeadlineReminder(e.target.checked)}
            disabled={!deadline}
            className="h-4 w-4"
          />
          <label htmlFor="deadline-reminder" className="text-sm">
            {t("tasks.notifyBeforeDeadline")}
          </label>
        </div>
        {enableDeadlineReminder && (
          <select
            value={deadlineReminderMinutes}
            onChange={(e) => setDeadlineReminderMinutes(Number(e.target.value))}
            className="text-sm p-1 border rounded"
          >
            <option value="15">15 {t("common.time.minutesBefore")}</option>
            <option value="30">30 {t("common.time.minutesBefore")}</option>
            <option value="60">1 {t("common.time.hourBefore")}</option>
            <option value="120">2 {t("common.time.hoursBefore")}</option>
            <option value="1440">1 {t("common.time.dayBefore")}</option>
          </select>
        )}
      </div>

      {!deadline && (
        <div className="text-sm text-amber-600 dark:text-amber-400">
          {t("tasks.pleaseSetDeadline")}
        </div>
      )}
    </div>
  );
};

export default ReminderSettings;
