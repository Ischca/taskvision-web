"use client";

import React, { useState, useRef } from "react";
import { PencilIcon } from "@heroicons/react/24/outline";
import { useTheme } from "../ThemeProvider";
import { useMessages } from '../../hooks/useMessages';
import TaskFormModal from "./TaskFormModal";
import { Task, RepeatType, RepeatEndType } from "@/types";
import { doc, updateDoc, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";

// 型を拡張して、実際のFirestoreから取得したタスクの型に合わせる
interface FirestoreTask extends Omit<Task, 'date' | 'deadline' | 'repeatSettings'> {
    date: Timestamp | string | null;
    deadline?: Timestamp | string;
    repeatSettings?: {
        type: RepeatType;
        frequency: number;
        daysOfWeek?: number[];
        dayOfMonth?: number;
        endType: RepeatEndType;
        occurrences?: number;
        endDate?: Timestamp | string;
    };
    reminders?: {
        blockStart?: {
            enabled: boolean;
            minutes: number;
        };
        blockEnd?: {
            enabled: boolean;
            minutes: number;
        };
        deadline?: {
            enabled: boolean;
            minutes: number;
        };
    };
}

interface EditTaskButtonProps {
    task: FirestoreTask;
    blocks: { id: string; name: string }[];
    onTaskUpdated?: () => void;
    isInitiallyOpen?: boolean;
}

const EditTaskButton: React.FC<EditTaskButtonProps> = ({ task, blocks, onTaskUpdated, isInitiallyOpen = false }) => {
    const { theme } = useTheme();
    const { t } = useMessages();
    const [isModalOpen, setIsModalOpen] = useState(isInitiallyOpen);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [title, setTitle] = useState(task.title);
    const [description, setDescription] = useState(task.description || "");
    const [selectedBlock, setSelectedBlock] = useState(task.blockId || "");
    const [selectedDate, setSelectedDate] = useState<string | undefined>(
        task.date
            ? isTimestamp(task.date)
                ? dateToString(task.date.toDate())
                : task.date
            : undefined
    );
    const [isDateUnassigned, setIsDateUnassigned] = useState(!task.date);
    const [deadlineDate, setDeadlineDate] = useState<string | undefined>(
        task.deadline
            ? isTimestamp(task.deadline)
                ? dateToString(task.deadline.toDate())
                : task.deadline
            : undefined
    );

    // リマインド設定
    const [showReminderSettings, setShowReminderSettings] = useState(false);
    const [enableBlockStartReminder, setEnableBlockStartReminder] = useState(
        task.reminders?.blockStart?.enabled || false
    );
    const [blockStartReminderMinutes, setBlockStartReminderMinutes] = useState(
        task.reminders?.blockStart?.minutes || 15
    );
    const [enableBlockEndReminder, setEnableBlockEndReminder] = useState(
        task.reminders?.blockEnd?.enabled || false
    );
    const [blockEndReminderMinutes, setBlockEndReminderMinutes] = useState(
        task.reminders?.blockEnd?.minutes || 10
    );
    const [enableDeadlineReminder, setEnableDeadlineReminder] = useState(
        task.reminders?.deadline?.enabled || false
    );
    const [deadlineReminderMinutes, setDeadlineReminderMinutes] = useState(
        task.reminders?.deadline?.minutes || 30
    );

    // 繰り返し設定
    const [showRepeatSettings, setShowRepeatSettings] = useState(false);
    const [enableRepeat, setEnableRepeat] = useState(!!task.repeatSettings);
    const [repeatType, setRepeatType] = useState<RepeatType>(
        task.repeatSettings?.type || 'daily'
    );
    const [repeatFrequency, setRepeatFrequency] = useState(
        task.repeatSettings?.frequency || 1
    );
    const [repeatDaysOfWeek, setRepeatDaysOfWeek] = useState<number[]>(
        task.repeatSettings?.daysOfWeek || [1, 3, 5]
    );
    const [repeatDayOfMonth, setRepeatDayOfMonth] = useState(
        task.repeatSettings?.dayOfMonth || 1
    );
    const [repeatEndType, setRepeatEndType] = useState<RepeatEndType>(
        task.repeatSettings?.endType || 'never'
    );
    const [repeatOccurrences, setRepeatOccurrences] = useState(
        task.repeatSettings?.occurrences || 10
    );
    const [repeatEndDate, setRepeatEndDate] = useState(
        task.repeatSettings?.endDate
            ? isTimestamp(task.repeatSettings.endDate)
                ? dateToString(task.repeatSettings.endDate.toDate())
                : task.repeatSettings.endDate
            : ""
    );

    const titleInputRef = useRef<HTMLInputElement>(null);
    const modalRef = useRef<HTMLDivElement>(null);
    const [isAnyPopoverOpen, setIsAnyPopoverOpen] = useState(false);

    // 曜日名変換（日本語 or 英語）
    const getDayName = (day: number) => {
        const daysJA = ['日', '月', '火', '水', '木', '金', '土'];
        const daysEN = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const days = t('common.locale') === 'en-US' ? daysEN : daysJA;
        return days[day];
    };

    // 配列内の曜日を切り替える
    const toggleDayOfWeek = (day: number) => {
        setRepeatDaysOfWeek(current =>
            current.includes(day)
                ? current.filter(d => d !== day)
                : [...current, day].sort()
        );
    };

    // 日付をストリングに変換
    function dateToString(date: Date): string {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}/${month}/${day}`;
    }

    // TaskItemから渡されるデータがstring型の場合に対応するヘルパー関数
    function isTimestamp(value: any): value is Timestamp {
        return value && typeof value === 'object' && 'toDate' in value;
    }

    // タスク更新処理
    const handleUpdateTask = async () => {
        if (isSubmitting) return;
        setIsSubmitting(true);

        try {
            // 日付をYYYY-MM-DD形式に変換する関数
            function formatDateToString(date: Date): string {
                const year = date.getFullYear();
                const month = String(date.getMonth() + 1).padStart(2, '0');
                const day = String(date.getDate()).padStart(2, '0');
                return `${year}-${month}-${day}`;
            }

            // 日付の準備 - 文字列形式で保存
            let finalDate = null;
            if (!isDateUnassigned && selectedDate) {
                try {
                    // 日付形式の標準化
                    const dateObj = new Date(selectedDate);
                    if (!isNaN(dateObj.getTime())) {
                        finalDate = formatDateToString(dateObj);
                    }
                } catch (e) {
                    console.error("日付変換エラー:", e);
                }
            }

            const taskRef = doc(db, "tasks", task.id);
            const updateData: any = {
                title,
                description,
                updatedAt: new Date().toISOString(),
                // ブロックIDを明示的に null として設定（空文字列ではなく）
                blockId: selectedBlock && selectedBlock.trim() !== "" ? selectedBlock : null,
                // 日付は null または YYYY-MM-DD形式の文字列
                date: finalDate,
            };

            if (deadlineDate) {
                try {
                    const deadlineDateObj = new Date(deadlineDate);
                    if (!isNaN(deadlineDateObj.getTime())) {
                        updateData.deadline = formatDateToString(deadlineDateObj);
                    }
                } catch (e) {
                    console.error("締切日変換エラー:", e);
                }
            } else {
                updateData.deadline = null;
            }

            // リマインド設定
            const reminders = {
                blockStart: {
                    enabled: enableBlockStartReminder,
                    minutes: blockStartReminderMinutes
                },
                blockEnd: {
                    enabled: enableBlockEndReminder,
                    minutes: blockEndReminderMinutes
                },
                deadline: {
                    enabled: enableDeadlineReminder,
                    minutes: deadlineReminderMinutes
                }
            };

            // 繰り返し設定
            let repeatSettings = null;
            if (enableRepeat) {
                repeatSettings = {
                    type: repeatType,
                    frequency: repeatFrequency,
                    daysOfWeek: repeatType === 'weekly' ? repeatDaysOfWeek : null,
                    dayOfMonth: repeatType === 'monthly' ? repeatDayOfMonth : null,
                    endType: repeatEndType,
                    occurrences: repeatEndType === 'after' ? repeatOccurrences : null,
                    endDate: repeatEndType === 'on_date' ? (repeatEndDate ? new Date(repeatEndDate) : null) : null
                };
            }

            // データ更新
            await updateDoc(taskRef, {
                ...updateData,
                reminders,
                repeatSettings
            });

            setIsModalOpen(false);

            // 親コンポーネントに更新を通知
            if (onTaskUpdated) {
                onTaskUpdated();
            }
        } catch (error) {
            console.error("Error updating task:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <>
            <button
                className={`flex items-center p-2 rounded-md ${theme === 'dark'
                    ? 'hover:bg-gray-700 text-gray-200'
                    : 'hover:bg-gray-100 text-gray-700'
                    } transition-colors`}
                onClick={() => setIsModalOpen(true)}
                title={t('common.actions.editTask') || 'タスクを編集'}
            >
                <PencilIcon className="h-5 w-5" />
            </button>

            {isModalOpen && (
                <TaskFormModal
                    isModalOpen={isModalOpen}
                    setIsModalOpen={setIsModalOpen}
                    title={title}
                    setTitle={setTitle}
                    description={description}
                    setDescription={setDescription}
                    selectedBlock={selectedBlock}
                    setSelectedBlock={setSelectedBlock}
                    selectedDate={selectedDate}
                    setSelectedDate={setSelectedDate}
                    isDateUnassigned={isDateUnassigned}
                    setIsDateUnassigned={setIsDateUnassigned}
                    deadlineDate={deadlineDate}
                    setDeadlineDate={setDeadlineDate}
                    blocks={blocks}
                    isSubmitting={isSubmitting}
                    handleSubmit={handleUpdateTask}
                    titleInputRef={titleInputRef}
                    modalRef={modalRef}
                    showReminderSettings={showReminderSettings}
                    setShowReminderSettings={setShowReminderSettings}
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
                    showRepeatSettings={showRepeatSettings}
                    setShowRepeatSettings={setShowRepeatSettings}
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
                    deadline={deadlineDate || ""}
                    dateToString={dateToString}
                    isEditing={true}
                    taskId={task.id}
                />
            )}
        </>
    );
};

export default EditTaskButton; 