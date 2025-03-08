"use client";

import React from "react";
import { useTheme } from "../ThemeProvider";
import { useMessages } from '../../hooks/useMessages';

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
    deadline
}) => {
    const { theme } = useTheme();
    const { t } = useMessages();

    // i18nのフォールバック関数
    const translate = (key: string, fallback: string): string => {
        try {
            const translation = t(key);
            // 翻訳が存在しない場合や、翻訳キーがそのまま返ってきた場合はフォールバックを使用
            return translation === key ? fallback : translation;
        } catch (error) {
            console.warn(`Translation error for key ${key}:`, error);
            return fallback;
        }
    };

    return (
        <div className={`p-3 rounded-md ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'} space-y-3 animate-fade-in`}>
            <div>
                <div className="flex items-center justify-between">
                    <div className="flex items-center">
                        <input
                            type="checkbox"
                            id="enable-block-start"
                            className="checkbox checkbox-sm checkbox-primary mr-2"
                            checked={enableBlockStartReminder}
                            onChange={() => setEnableBlockStartReminder(!enableBlockStartReminder)}
                        />
                        <label htmlFor="enable-block-start" className="text-sm">
                            {translate('common.tasks.notifyBeforeBlockStart', 'ブロック開始前に通知')}
                        </label>
                    </div>
                    <select
                        className={`select select-bordered select-sm ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : ''}`}
                        value={blockStartReminderMinutes}
                        onChange={(e) => setBlockStartReminderMinutes(Number(e.target.value))}
                        disabled={!enableBlockStartReminder}
                    >
                        <option value="5">5 {translate('common.time.minutesBefore', '分前')}</option>
                        <option value="10">10 {translate('common.time.minutesBefore', '分前')}</option>
                        <option value="15">15 {translate('common.time.minutesBefore', '分前')}</option>
                        <option value="30">30 {translate('common.time.minutesBefore', '分前')}</option>
                        <option value="60">1 {translate('common.time.hourBefore', '時間前')}</option>
                    </select>
                </div>
            </div>

            <div>
                <div className="flex items-center justify-between">
                    <div className="flex items-center">
                        <input
                            type="checkbox"
                            id="enable-block-end"
                            className="checkbox checkbox-sm checkbox-primary mr-2"
                            checked={enableBlockEndReminder}
                            onChange={() => setEnableBlockEndReminder(!enableBlockEndReminder)}
                        />
                        <label htmlFor="enable-block-end" className="text-sm">
                            {translate('common.tasks.notifyBeforeBlockEnd', 'ブロック終了前に通知')}
                        </label>
                    </div>
                    <select
                        className={`select select-bordered select-sm ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : ''}`}
                        value={blockEndReminderMinutes}
                        onChange={(e) => setBlockEndReminderMinutes(Number(e.target.value))}
                        disabled={!enableBlockEndReminder}
                    >
                        <option value="5">5 {translate('common.time.minutesBefore', '分前')}</option>
                        <option value="10">10 {translate('common.time.minutesBefore', '分前')}</option>
                        <option value="15">15 {translate('common.time.minutesBefore', '分前')}</option>
                        <option value="30">30 {translate('common.time.minutesBefore', '分前')}</option>
                    </select>
                </div>
            </div>

            <div>
                <div className="flex items-center justify-between">
                    <div className="flex items-center">
                        <input
                            type="checkbox"
                            id="enable-deadline"
                            className="checkbox checkbox-sm checkbox-primary mr-2"
                            checked={enableDeadlineReminder}
                            onChange={() => setEnableDeadlineReminder(!enableDeadlineReminder)}
                            disabled={!deadline}
                        />
                        <label htmlFor="enable-deadline" className="text-sm">
                            {translate('common.tasks.notifyBeforeDeadline', '締切前に通知')}
                        </label>
                    </div>
                    <select
                        className={`select select-bordered select-sm ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : ''}`}
                        value={deadlineReminderMinutes}
                        onChange={(e) => setDeadlineReminderMinutes(Number(e.target.value))}
                        disabled={!enableDeadlineReminder || !deadline}
                    >
                        <option value="15">15 {translate('common.time.minutesBefore', '分前')}</option>
                        <option value="30">30 {translate('common.time.minutesBefore', '分前')}</option>
                        <option value="60">1 {translate('common.time.hourBefore', '時間前')}</option>
                        <option value="120">2 {translate('common.time.hoursBefore', '時間前')}</option>
                        <option value="1440">1 {translate('common.time.dayBefore', '日間前')}</option>
                    </select>
                </div>
                {!deadline && enableDeadlineReminder && (
                    <p className="text-xs text-orange-500 mt-1">
                        {translate('common.tasks.pleaseSetDeadline', '締切日を設定してください')}
                    </p>
                )}
            </div>
        </div>
    );
};

export default ReminderSettings; 