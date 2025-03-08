"use client";

import React, { useRef } from "react";
import { XMarkIcon, CheckIcon, ArrowPathIcon, BellIcon, BellSlashIcon, ChevronDownIcon, ArrowPathRoundedSquareIcon } from "@heroicons/react/24/outline";
import { useTheme } from "../ThemeProvider";
import { useMessages } from '../../hooks/useMessages';
import ShadcnDatePicker from "../ShadcnDatePicker";
// import { Checkbox } from "../../../components/ui/checkbox";
// import { Label } from "../../../components/ui/label";
// import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "../../../components/ui/select";
import ReminderSettings from "./ReminderSettings";
import RepeatSettings from "./RepeatSettings";
import { RepeatSettings as RepeatSettingsType, RepeatType, RepeatEndType } from "@/types";

// ダミーコンポーネント
const Checkbox = ({ checked, onCheckedChange, ...props }: any) => (
    <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onCheckedChange(e.target.checked)}
        {...props}
    />
);
const Label = ({ children, htmlFor, ...props }: any) => <label htmlFor={htmlFor} {...props}>{children}</label>;
const Select = ({ children, value, onValueChange, ...props }: any) => {
    console.log("Select rendering, value:", value, "children:", children);
    return (
        <div className="select-wrapper relative" {...props}>
            <select
                value={value || ""}
                onChange={(e) => onValueChange(e.target.value)}
                className="w-full p-2 border rounded bg-white dark:bg-gray-700 dark:text-white appearance-none cursor-pointer"
            >
                {children}
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                <ChevronDownIcon className="h-4 w-4 text-gray-400" />
            </div>
        </div>
    );
};
const SelectTrigger = ({ children, className, ...props }: any) => (
    <div className={`select-trigger ${className || ''}`} {...props}>{children}</div>
);
const SelectValue = ({ children, placeholder, ...props }: any) => (
    <span className="select-value" {...props}>{children || placeholder}</span>
);
const SelectContent = ({ children, ...props }: any) => {
    // Selectコンポーネント内のselectタグに直接子要素を渡すため、
    // このコンポーネントの子要素をそのまま返す
    return children;
};
const SelectItem = ({ children, value, ...props }: any) => {
    console.log("SelectItem:", value, children);
    return (
        <option value={value} {...props}>{children}</option>
    );
};

interface TaskFormModalProps {
    isModalOpen: boolean;
    setIsModalOpen: (value: boolean) => void;
    title: string;
    setTitle: (value: string) => void;
    description: string;
    setDescription: (value: string) => void;
    selectedBlock: string;
    setSelectedBlock: (value: string) => void;
    selectedDate: string | undefined;
    setSelectedDate: (value: string | undefined) => void;
    isDateUnassigned: boolean;
    setIsDateUnassigned: (value: boolean) => void;
    deadlineDate: string | undefined;
    setDeadlineDate: (value: string | undefined) => void;
    blocks: { id: string; name: string }[];
    isSubmitting: boolean;
    handleSubmit: (e: React.FormEvent) => Promise<void>;
    titleInputRef: React.RefObject<HTMLInputElement | null>;
    modalRef: React.RefObject<HTMLDivElement | null>;
    showReminderSettings: boolean;
    setShowReminderSettings: (value: boolean) => void;
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
    showRepeatSettings: boolean;
    setShowRepeatSettings: (value: boolean) => void;
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
    deadline: string;
    dateToString: (date: Date) => string;
    isEditing?: boolean;  // 既存タスクの編集かどうかのフラグ
    taskId?: string;      // 編集中のタスクID
}

const TaskFormModal: React.FC<TaskFormModalProps> = ({
    isModalOpen,
    setIsModalOpen,
    title,
    setTitle,
    description,
    setDescription,
    selectedBlock,
    setSelectedBlock,
    selectedDate,
    setSelectedDate,
    isDateUnassigned,
    setIsDateUnassigned,
    deadlineDate,
    setDeadlineDate,
    blocks,
    isSubmitting,
    handleSubmit,
    titleInputRef,
    modalRef,
    showReminderSettings,
    setShowReminderSettings,
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
    showRepeatSettings,
    setShowRepeatSettings,
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
    deadline,
    dateToString,
    isEditing,
    taskId
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

    // デバッグ
    console.log("Available blocks:", blocks);

    // 日付未割り当てチェックボックスの処理を改善
    const handleDateUnassignedChange = (checked: boolean) => {
        console.log("日付未割り当て変更:", checked);
        setIsDateUnassigned(checked);

        // 未割り当てにチェックが入った場合は日付をクリア
        if (checked) {
            setSelectedDate(undefined);
        }
    };

    // 日付選択時の処理を改善
    const handleDateChange = (date: string | undefined) => {
        // 日付が選択された場合、未割り当てチェックを外す
        if (date) {
            setIsDateUnassigned(false);
        }
        setSelectedDate(date);
    };

    // 締切日選択時の処理を改善
    const handleDeadlineDateChange = (date: string | undefined) => {
        setDeadlineDate(date);

        // 締切日が設定され、締切リマインダーが有効な場合は、そのまま維持
        // 締切日がない場合は、締切リマインダーを無効化
        if (!date && enableDeadlineReminder) {
            setEnableDeadlineReminder(false);
        }
    };

    // リマインダー設定表示切り替え
    const toggleReminderSettings = () => {
        setShowReminderSettings(!showReminderSettings);
    };

    // 繰り返し設定表示切り替え
    const toggleRepeatSettings = () => {
        setShowRepeatSettings(!showRepeatSettings);
    };

    // カレンダーポップオーバーの状態管理
    const handleCalendarOpenChange = (open: boolean) => {
        setIsAnyPopoverOpen(open);
        // カレンダーが開いている間はモーダルのクリックイベントを防止
        if (open) {
            const modalElement = modalRef.current;
            if (modalElement) {
                const originalPointerEvents = modalElement.style.pointerEvents;
                modalElement.style.pointerEvents = 'none';

                // カレンダーが閉じられたときに元の状態に戻す
                const restorePointerEvents = () => {
                    modalElement.style.pointerEvents = originalPointerEvents;
                    document.removeEventListener('mousedown', checkCalendarClosed);
                };

                // カレンダーが閉じられたかチェック
                const checkCalendarClosed = () => {
                    if (!document.querySelector('[data-state="open"]')) {
                        restorePointerEvents();
                    }
                };

                document.addEventListener('mousedown', checkCalendarClosed);
            }
        }
    };

    if (!isModalOpen) return null;

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50 flex items-center justify-center p-4 modal-appear">
            <div
                ref={modalRef}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-lg w-full modal-content-appear overflow-y-auto max-h-[90vh]"
            >
                <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                        {translate('common.tasks.taskDetails', 'タスクの詳細')}
                    </h3>
                    <button
                        className="p-1 rounded-full text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                        onClick={() => setIsModalOpen(false)}
                    >
                        <XMarkIcon className="h-5 w-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-4">
                    <div className="space-y-4">
                        <div>
                            <label className="form-label" htmlFor="task-title">
                                {translate('common.tasks.taskName', 'タスク名')}
                            </label>
                            <input
                                id="task-title"
                                ref={titleInputRef}
                                type="text"
                                className="input input-bordered w-full focus-ring"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                required
                            />
                        </div>

                        <div className="space-y-4 mt-4">
                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    id="unassigned-date"
                                    checked={isDateUnassigned}
                                    onCheckedChange={handleDateUnassignedChange}
                                />
                                <label
                                    htmlFor="unassigned-date"
                                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                >
                                    {translate('common.tasks.unassignedDate', '日付未割り当て')}
                                </label>
                            </div>

                            {!isDateUnassigned && (
                                <div className="grid w-full items-center gap-1.5">
                                    <Label htmlFor="task-date">{translate('common.tasks.date', '日付')}</Label>
                                    <div className="flex items-center">
                                        <div className="flex-grow">
                                            <ShadcnDatePicker
                                                date={selectedDate}
                                                onDateChange={handleDateChange}
                                                placeholder={translate('common.tasks.selectDate', '日付を選択')}
                                                className="w-full calendar-popup"
                                                // @ts-ignore
                                                onOpenChange={handleCalendarOpenChange}
                                            />
                                        </div>
                                        {selectedDate && (
                                            <button
                                                type="button"
                                                className="ml-2 p-1 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                                                onClick={() => handleDateChange(undefined)}
                                                title={translate('common.actions.clearDate', '日付をクリア')}
                                            >
                                                <XMarkIcon className="h-5 w-5" />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            )}

                            <div className="grid w-full items-center gap-1.5">
                                <Label htmlFor="task-block">{translate('common.tasks.block', 'ブロック')}</Label>
                                <Select
                                    value={selectedBlock}
                                    onValueChange={setSelectedBlock}
                                >
                                    <option value="">{translate('common.tasks.selectBlock', 'ブロックを選択')}</option>
                                    {blocks && blocks.length > 0 ? (
                                        blocks.map((block) => (
                                            <option key={block.id} value={block.id}>
                                                {block.name}
                                            </option>
                                        ))
                                    ) : (
                                        <option value="no-blocks">{translate('common.tasks.noBlocks', 'ブロックがありません')}</option>
                                    )}
                                </Select>
                            </div>

                            <div className="grid w-full items-center gap-1.5">
                                <Label htmlFor="task-deadline">{translate('common.tasks.deadline', '締切日')}</Label>
                                <div className="flex items-center">
                                    <div className="flex-grow">
                                        <ShadcnDatePicker
                                            date={deadlineDate}
                                            onDateChange={handleDeadlineDateChange}
                                            placeholder={translate('common.tasks.selectDeadline', '締切日を選択')}
                                            className="w-full calendar-popup"
                                            // @ts-ignore
                                            onOpenChange={handleCalendarOpenChange}
                                        />
                                    </div>
                                    {deadlineDate && (
                                        <button
                                            type="button"
                                            className="ml-2 p-1 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                                            onClick={() => handleDeadlineDateChange(undefined)}
                                            title={translate('common.actions.clearDate', '日付をクリア')}
                                        >
                                            <XMarkIcon className="h-5 w-5" />
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div>
                            <button
                                type="button"
                                className={`flex items-center justify-between w-full px-3 py-2 rounded-md ${theme === 'dark' ? 'hover:bg-gray-700 text-gray-200' : 'hover:bg-gray-100 text-gray-700'} transition-colors`}
                                onClick={toggleReminderSettings}
                            >
                                <div className="flex items-center">
                                    {showReminderSettings ? (
                                        <BellIcon className="h-5 w-5 mr-2 text-primary-500" />
                                    ) : (
                                        <BellSlashIcon className="h-5 w-5 mr-2 text-gray-500" />
                                    )}
                                    <span>{showReminderSettings ? translate('common.tasks.hideReminderSettings', 'リマインダー設定を非表示') : translate('common.tasks.showReminderSettings', 'リマインダー設定を表示')}</span>
                                </div>
                                <ChevronDownIcon className={`h-5 w-5 text-gray-400 transition-transform ${showReminderSettings ? 'transform rotate-180' : ''}`} />
                            </button>
                        </div>

                        {showReminderSettings && (
                            <ReminderSettings
                                enableBlockStartReminder={enableBlockStartReminder}
                                setEnableBlockStartReminder={setEnableBlockStartReminder}
                                blockStartReminderMinutes={blockStartReminderMinutes}
                                setBlockStartReminderMinutes={setBlockStartReminderMinutes}
                                enableBlockEndReminder={enableBlockEndReminder}
                                setEnableBlockEndReminder={setEnableBlockEndReminder}
                                blockEndReminderMinutes={blockEndReminderMinutes}
                                setBlockEndReminderMinutes={setBlockEndReminderMinutes}
                                enableDeadlineReminder={enableDeadlineReminder}
                                setEnableDeadlineReminder={setEnableDeadlineReminder}
                                deadlineReminderMinutes={deadlineReminderMinutes}
                                setDeadlineReminderMinutes={setDeadlineReminderMinutes}
                                deadline={deadline}
                            />
                        )}

                        {/* 繰り返し設定トグルボタン */}
                        <div>
                            <button
                                type="button"
                                className={`flex items-center justify-between w-full px-3 py-2 rounded-md ${theme === 'dark' ? 'hover:bg-gray-700 text-gray-200' : 'hover:bg-gray-100 text-gray-700'} transition-colors`}
                                onClick={toggleRepeatSettings}
                            >
                                <div className="flex items-center">
                                    {showRepeatSettings ? (
                                        <ArrowPathRoundedSquareIcon className="h-5 w-5 mr-2 text-primary-500" />
                                    ) : (
                                        <ArrowPathRoundedSquareIcon className="h-5 w-5 mr-2 text-gray-500" />
                                    )}
                                    <span>{showRepeatSettings ? translate('common.tasks.hideRepeatSettings', '繰り返し設定を非表示') : translate('common.tasks.showRepeatSettings', '繰り返し設定を表示')}</span>
                                </div>
                                <ChevronDownIcon className={`h-5 w-5 text-gray-400 transition-transform ${showRepeatSettings ? 'transform rotate-180' : ''}`} />
                            </button>
                        </div>

                        {/* 繰り返し設定パネル */}
                        {showRepeatSettings && (
                            <RepeatSettings
                                enableRepeat={enableRepeat}
                                setEnableRepeat={setEnableRepeat}
                                repeatType={repeatType}
                                setRepeatType={setRepeatType}
                                repeatFrequency={repeatFrequency}
                                setRepeatFrequency={setRepeatFrequency}
                                repeatDaysOfWeek={repeatDaysOfWeek}
                                toggleDayOfWeek={toggleDayOfWeek}
                                repeatDayOfMonth={repeatDayOfMonth}
                                setRepeatDayOfMonth={setRepeatDayOfMonth}
                                repeatEndType={repeatEndType}
                                setRepeatEndType={setRepeatEndType}
                                repeatOccurrences={repeatOccurrences}
                                setRepeatOccurrences={setRepeatOccurrences}
                                repeatEndDate={repeatEndDate}
                                setRepeatEndDate={setRepeatEndDate}
                                getDayName={getDayName}
                                setIsAnyPopoverOpen={setIsAnyPopoverOpen}
                                dateToString={dateToString}
                            />
                        )}

                        <div>
                            <label className="form-label" htmlFor="task-description">
                                {translate('common.tasks.details', '詳細')}
                            </label>
                            <textarea
                                id="task-description"
                                className="textarea textarea-bordered w-full focus-ring min-h-24"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder={translate('common.tasks.detailsPlaceholder', '詳細を入力')}
                                rows={4}
                            ></textarea>
                        </div>
                    </div>

                    <div className="flex justify-end mt-6 pt-4 border-t border-gray-200 dark:border-gray-700 space-x-2">
                        <button
                            type="button"
                            className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 text-sm leading-4 font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors"
                            onClick={() => setIsModalOpen(false)}
                            disabled={isSubmitting}
                        >
                            {translate('common.actions.cancel', 'キャンセル')}
                        </button>
                        <button
                            type="submit"
                            className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors"
                            disabled={!title.trim() || isSubmitting}
                        >
                            {isSubmitting ? (
                                <>
                                    <ArrowPathIcon className="h-4 w-4 mr-1 animate-spin" />
                                    {translate('common.tasks.saving', '保存中...')}
                                </>
                            ) : (
                                <>
                                    <CheckIcon className="h-4 w-4 mr-1" />
                                    {translate('common.actions.save', '保存')}
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default TaskFormModal; 