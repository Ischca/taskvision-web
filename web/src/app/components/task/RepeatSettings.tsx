"use client";

import React from "react";
import { useTheme } from "../ThemeProvider";
import { useMessages } from '../../hooks/useMessages';
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
const datePickerWithOpenChange = ({ date, onDateChange, disabled, onOpenChange }: {
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
            // @ts-ignore 
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
    dateToString
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
                <div className="flex items-center mb-3">
                    <input
                        type="checkbox"
                        id="enable-repeat"
                        className="checkbox checkbox-sm checkbox-primary mr-2"
                        checked={enableRepeat}
                        onChange={() => setEnableRepeat(!enableRepeat)}
                    />
                    <label htmlFor="enable-repeat" className="text-sm font-medium">
                        {translate('common.tasks.repeatTask', '繰り返しタスク')}
                    </label>
                </div>

                {enableRepeat && (
                    <div className="space-y-3 pl-6">
                        {/* 繰り返しタイプ */}
                        <div>
                            <label className="form-label text-sm" htmlFor="repeat-type">
                                {translate('common.tasks.repeatPattern', '繰り返しパターン')}
                            </label>
                            <select
                                id="repeat-type"
                                className={`select select-bordered select-sm w-full ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : ''}`}
                                value={repeatType}
                                onChange={(e) => setRepeatType(e.target.value as RepeatType)}
                            >
                                <option value="daily">{translate('common.tasks.repeatDaily', '毎日')}</option>
                                <option value="weekdays">{translate('common.tasks.repeatWeekdays', '平日')}</option>
                                <option value="weekly">{translate('common.tasks.repeatWeekly', '毎週')}</option>
                                <option value="monthly">{translate('common.tasks.repeatMonthly', '毎月')}</option>
                                <option value="custom">{translate('common.tasks.repeatCustom', 'カスタム')}</option>
                            </select>
                        </div>

                        {/* 繰り返しの頻度（daily, customの場合） */}
                        {(repeatType === 'daily' || repeatType === 'custom') && (
                            <div>
                                <label className="form-label text-sm" htmlFor="repeat-frequency">
                                    {translate('common.tasks.frequency', '頻度')}
                                </label>
                                <div className="flex items-center">
                                    <span className="mr-2">{translate('common.tasks.interval', '間隔')}:</span>
                                    <select
                                        id="repeat-frequency"
                                        className={`select select-bordered select-sm ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : ''}`}
                                        value={repeatFrequency}
                                        onChange={(e) => setRepeatFrequency(Number(e.target.value))}
                                    >
                                        <option value="1">{translate('common.tasks.everyDay', '毎日')}</option>
                                        <option value="2">{translate('common.tasks.everyTwoDays', '2日ごと')}</option>
                                        <option value="3">{translate('common.tasks.everyThreeDays', '3日ごと')}</option>
                                        <option value="5">{translate('common.tasks.everyFiveDays', '5日ごと')}</option>
                                        <option value="7">{translate('common.tasks.everyWeek', '1週間ごと')}</option>
                                    </select>
                                </div>
                            </div>
                        )}

                        {/* 曜日選択（weeklyの場合） */}
                        {repeatType === 'weekly' && (
                            <div>
                                <label className="form-label text-sm mb-2 block">
                                    {translate('common.tasks.selectDaysOfWeek', '曜日を選択')}
                                </label>
                                <div className="flex flex-wrap gap-2">
                                    {[0, 1, 2, 3, 4, 5, 6].map((day) => (
                                        <button
                                            key={day}
                                            type="button"
                                            onClick={() => toggleDayOfWeek(day)}
                                            className={`w-8 h-8 rounded-full flex items-center justify-center text-sm 
                                                ${repeatDaysOfWeek.includes(day)
                                                    ? 'bg-primary-500 text-white'
                                                    : theme === 'dark'
                                                        ? 'bg-gray-600 text-gray-200'
                                                        : 'bg-gray-200 text-gray-700'} 
                                                transition-colors`}
                                        >
                                            {getDayName(day)}
                                        </button>
                                    ))}
                                </div>
                                {repeatDaysOfWeek.length === 0 && (
                                    <p className="text-xs text-orange-500 mt-1">
                                        {translate('common.tasks.selectAtLeastOneDay', '少なくとも1日は選択してください')}
                                    </p>
                                )}
                            </div>
                        )}

                        {/* 日付選択（monthlyの場合） */}
                        {repeatType === 'monthly' && (
                            <div>
                                <label className="form-label text-sm" htmlFor="repeat-day-of-month">
                                    {translate('common.tasks.selectDate', '日付を選択')}
                                </label>
                                <select
                                    id="repeat-day-of-month"
                                    className={`select select-bordered select-sm w-full ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : ''}`}
                                    value={repeatDayOfMonth}
                                    onChange={(e) => setRepeatDayOfMonth(Number(e.target.value))}
                                >
                                    {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => (
                                        <option key={day} value={day}>
                                            {day} {translate('common.tasks.dayOfMonth', '日')}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}

                        {/* 繰り返し終了設定 */}
                        <div>
                            <label className="form-label text-sm mb-2 block">
                                {translate('common.tasks.endCondition', '終了条件')}
                            </label>
                            <div className="space-y-2">
                                <div className="flex items-center">
                                    <input
                                        type="radio"
                                        id="end-never"
                                        name="repeat-end"
                                        className="radio radio-sm radio-primary mr-2"
                                        checked={repeatEndType === 'never'}
                                        onChange={() => setRepeatEndType('never')}
                                    />
                                    <label htmlFor="end-never" className="text-sm">
                                        {translate('common.tasks.noEndDate', '終了日なし')}
                                    </label>
                                </div>

                                <div className="flex items-center">
                                    <input
                                        type="radio"
                                        id="end-after"
                                        name="repeat-end"
                                        className="radio radio-sm radio-primary mr-2"
                                        checked={repeatEndType === 'after'}
                                        onChange={() => setRepeatEndType('after')}
                                    />
                                    <label htmlFor="end-after" className="text-sm flex items-center">
                                        <span className="mr-2">{translate('common.tasks.specifyCount', '指定回数')}:</span>
                                        <input
                                            type="number"
                                            className={`input input-bordered input-sm w-16 ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : ''}`}
                                            value={repeatOccurrences}
                                            onChange={(e) => setRepeatOccurrences(Number(e.target.value))}
                                            min="1"
                                            max="100"
                                            disabled={repeatEndType !== 'after'}
                                        />
                                        <span className="ml-2">{translate('common.tasks.times', '回')}</span>
                                    </label>
                                </div>

                                <div className="flex items-center">
                                    <input
                                        type="radio"
                                        id="end-on-date"
                                        name="repeat-end"
                                        className="radio radio-sm radio-primary mr-2"
                                        checked={repeatEndType === 'on_date'}
                                        onChange={() => setRepeatEndType('on_date')}
                                    />
                                    <label htmlFor="end-on-date" className="text-sm flex items-center flex-wrap">
                                        <span className="mr-2 mb-2">{translate('common.tasks.specifyDate', '指定日')}:</span>
                                        <div className="w-full">
                                            <ShadcnDatePicker
                                                date={repeatEndDate}
                                                onDateChange={(date) => setRepeatEndDate(date || '')}
                                                disabled={repeatEndType !== 'on_date'}
                                                // @ts-ignore onOpenChangeプロパティは実際のコンポーネントでは受け付けるようにする
                                                onOpenChange={(open: boolean) => setIsAnyPopoverOpen(open)}
                                                className="calendar-popup"
                                            />
                                        </div>
                                    </label>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default RepeatSettings; 