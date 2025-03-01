"use client";

import { FC, useState, useRef, useEffect } from "react";
import { db } from "../../lib/firebase";
import { doc, updateDoc, deleteDoc } from "firebase/firestore";
import { Task } from "@/types";
import {
    PencilIcon,
    TrashIcon,
    XMarkIcon,
    CheckIcon,
    ArrowPathIcon,
    BellIcon,
    BellSlashIcon,
    ChevronDownIcon,
    CalendarDaysIcon,
    ClockIcon,
    ArrowPathRoundedSquareIcon
} from "@heroicons/react/24/outline";
import { useTheme } from "../components/ThemeProvider";
import { useAuth } from "./AuthProvider";
import { RepeatSettings, RepeatType, RepeatEndType } from "@/types";
import { generateRepeatTaskInstances } from "@/lib/repeatTaskUtils";
import { useBlocks } from "../hooks/useBlocks";
import { useParams } from "next/navigation";
import { loadMessages } from "../components/i18n";
import { useMessages } from '@/app/hooks/useMessages';

type TaskItemProps = {
    task: Task;
    isDraggable?: boolean;
};

const TaskItem: FC<TaskItemProps> = ({ task, isDraggable = false }) => {
    const [checked, setChecked] = useState(task.status === "done");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);
    const [title, setTitle] = useState(task.title);
    const [description, setDescription] = useState(task.description || "");
    const [deadline, setDeadline] = useState(task.deadline || "");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState("");
    const [toastType, setToastType] = useState<"success" | "error">("success");
    const [selectedBlock, setSelectedBlock] = useState<string | null>(task.blockId || null);

    // リマインド設定
    const [showReminderSettings, setShowReminderSettings] = useState(false);
    const [enableBlockStartReminder, setEnableBlockStartReminder] = useState(
        task.reminderSettings?.enableBlockStartReminder || false
    );
    const [blockStartReminderMinutes, setBlockStartReminderMinutes] = useState(
        task.reminderSettings?.blockStartReminderMinutes || 15
    );
    const [enableBlockEndReminder, setEnableBlockEndReminder] = useState(
        task.reminderSettings?.enableBlockEndReminder || false
    );
    const [blockEndReminderMinutes, setBlockEndReminderMinutes] = useState(
        task.reminderSettings?.blockEndReminderMinutes || 10
    );
    const [enableDeadlineReminder, setEnableDeadlineReminder] = useState(
        task.reminderSettings?.enableDeadlineReminder || false
    );
    const [deadlineReminderMinutes, setDeadlineReminderMinutes] = useState(
        task.reminderSettings?.deadlineReminderMinutes || 30
    );

    // 繰り返し設定
    const [showRepeatSettings, setShowRepeatSettings] = useState(false);
    const [enableRepeat, setEnableRepeat] = useState(
        task.repeatSettings?.enabled || false
    );
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
        task.repeatSettings?.endDate || ""
    );

    const { theme } = useTheme();
    const modalRef = useRef<HTMLDivElement>(null);
    const initialRender = useRef(true);
    const { userId } = useAuth();
    const { blocks } = useBlocks();
    const params = useParams();
    const locale = (params?.locale as string) || 'ja';
    const { t } = useMessages();
    const daysJA = ['日', '月', '火', '水', '木', '金', '土'];
    const daysEN = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const days = locale === 'en' ? daysEN : daysJA;

    // i18n用のメッセージ取得
    const [messages, setMessages] = useState<Record<string, any>>({});
    const [messagesLoading, setMessagesLoading] = useState(true);

    // チェックボックス状態の変更を視覚的にアニメーション
    useEffect(() => {
        if (initialRender.current) {
            initialRender.current = false;
            return;
        }

        setIsUpdating(true);
        const timer = setTimeout(() => {
            setIsUpdating(false);
        }, 700); // アニメーション時間

        return () => clearTimeout(timer);
    }, [checked]);

    // モーダル外クリックでクローズ
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
                setIsModalOpen(false);
            }
        }

        if (isModalOpen) {
            document.addEventListener("mousedown", handleClickOutside);
        } else {
            document.removeEventListener("mousedown", handleClickOutside);
        }

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [isModalOpen]);

    // トースト表示
    const showSuccessToast = (message: string = t('common.tasks.taskUpdated')) => {
        setToastType("success");
        setToastMessage(message);
        setShowToast(true);
        setTimeout(() => setShowToast(false), 3000);
    };

    const showErrorToast = (message: string = t('common.tasks.taskUpdateFailed')) => {
        setToastType("error");
        setToastMessage(message);
        setShowToast(true);
        setTimeout(() => setShowToast(false), 3000);
    };

    const handleCheck = async () => {
        try {
            const newStatus = checked ? "open" : "done";
            setChecked(!checked);
            await updateDoc(doc(db, "tasks", task.id), {
                status: newStatus,
            });

            if (newStatus === "done") {
                showSuccessToast(t('common.tasks.taskUpdated'));
            }
        } catch (err) {
            console.error("Failed to update task status:", err);
            setChecked(checked);
            showErrorToast(t('common.tasks.taskUpdateFailed'));
        }
    };

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!title.trim()) return;

        try {
            setIsSubmitting(true);

            // リマインド設定オブジェクトを作成
            const reminderSettings = {
                enableBlockStartReminder,
                blockStartReminderMinutes,
                enableBlockEndReminder,
                blockEndReminderMinutes,
                enableDeadlineReminder,
                deadlineReminderMinutes
            };

            // 繰り返し設定を作成
            const repeatSettings = createRepeatSettings();

            // タスク更新データの作成
            const updateData: any = {
                title: title.trim(),
                description: description.trim(),
                deadline: deadline || null,
                reminderSettings,
                blockId: selectedBlock
            };

            // 繰り返し設定を追加（設定がある場合のみ）
            if (repeatSettings) {
                updateData.repeatSettings = repeatSettings;
            } else {
                // 繰り返し設定を無効化する場合はnullを設定
                updateData.repeatSettings = null;
            }

            await updateDoc(doc(db, "tasks", task.id), updateData);

            // 繰り返し設定が変更され、有効になった場合は繰り返しタスクインスタンスを生成
            if (repeatSettings?.enabled &&
                (!task.repeatSettings?.enabled ||
                    JSON.stringify(task.repeatSettings) !== JSON.stringify(repeatSettings))) {

                // 現在日から2週間分のタスクを生成
                const startDate = new Date();
                const endDate = new Date();
                endDate.setDate(endDate.getDate() + 14); // 2週間後

                const updatedTask = {
                    ...task,
                    ...updateData,
                    userId,
                };

                await generateRepeatTaskInstances(updatedTask as Task, startDate, endDate);
            }

            setIsModalOpen(false);
            showSuccessToast(t('common.tasks.taskUpdated'));
        } catch (error) {
            console.error("Error updating task:", error);
            showErrorToast(t('common.tasks.taskUpdateFailed'));
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async () => {
        if (window.confirm(t('common.tasks.deleteConfirmation'))) {
            try {
                setIsDeleting(true);
                await deleteDoc(doc(db, "tasks", task.id));
                showSuccessToast(t('common.tasks.taskDeleted'));
            } catch (error) {
                console.error("Error deleting task:", error);
                showErrorToast(t('common.tasks.taskDeleteFailed'));
                setIsDeleting(false);
            }
        }
    };

    // ドラッグ開始時のハンドラー
    const handleDragStart = (e: React.DragEvent<HTMLLIElement>) => {
        if (!isDraggable) return;

        // タスクデータをJSON文字列に変換して転送
        e.dataTransfer.setData("application/json", JSON.stringify(task));
        // ドラッグ中の要素の見た目を設定
        e.dataTransfer.effectAllowed = "move";

        // ドラッグ中のスタイルを適用
        e.currentTarget.classList.add("dragging");

        // 現在のターゲット要素を保存
        const targetElement = e.currentTarget;

        // ドラッグ終了時のイベントリスナーを追加
        const handleDragEnd = () => {
            // nullチェックを追加
            const dragElements = document.querySelectorAll('.dragging');
            dragElements.forEach(el => {
                el.classList.remove('dragging');
            });

            document.removeEventListener("dragend", handleDragEnd);
        };
        document.addEventListener("dragend", handleDragEnd);
    };

    // リマインド設定セクションの表示切り替え
    const toggleReminderSettings = () => {
        setShowReminderSettings(!showReminderSettings);
    };

    // 繰り返し設定セクションの表示切り替え
    const toggleRepeatSettings = () => {
        setShowRepeatSettings(!showRepeatSettings);
    };

    // 曜日選択のトグル処理
    const toggleDayOfWeek = (day: number) => {
        if (repeatDaysOfWeek.includes(day)) {
            setRepeatDaysOfWeek(repeatDaysOfWeek.filter(d => d !== day));
        } else {
            setRepeatDaysOfWeek([...repeatDaysOfWeek, day].sort());
        }
    };

    // 曜日の表示（ロケールに合わせて切り替え）
    const getDayName = (day: number): string => {
        return days[day];
    };

    // 繰り返し設定オブジェクトの作成
    const createRepeatSettings = (): RepeatSettings | undefined => {
        if (!enableRepeat) return undefined;

        const settings: RepeatSettings = {
            enabled: true,
            type: repeatType,
            frequency: repeatFrequency,
            endType: repeatEndType,
        };

        // 繰り返しタイプによる追加設定
        if (repeatType === 'weekly') {
            settings.daysOfWeek = repeatDaysOfWeek;
        } else if (repeatType === 'monthly') {
            settings.dayOfMonth = repeatDayOfMonth;
        }

        // 終了条件の設定
        if (repeatEndType === 'after') {
            settings.occurrences = repeatOccurrences;
        } else if (repeatEndType === 'on_date' && repeatEndDate) {
            settings.endDate = repeatEndDate;
        }

        // 既存の例外を引き継ぐ
        if (task.repeatSettings?.exceptions) {
            settings.exceptions = task.repeatSettings.exceptions;
        }

        return settings;
    };

    // 日付を見やすい形式にフォーマット
    const formatDisplayDate = (dateStr: string): string => {
        if (!dateStr) return t('common.tasks.unassigned');
        const date = new Date(dateStr);
        return date.toLocaleDateString(t('common.locale') || 'ja-JP', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const handleUpdateTask = async () => {
        if (isSubmitting) return;
        setIsSubmitting(true);

        try {
            const taskRef = doc(db, "tasks", task.id);
            const updateData: any = {
                title,
                description,
                updatedAt: new Date().toISOString(),
                blockId: selectedBlock,
            };

            if (deadline) {
                updateData.deadline = deadline;
            } else {
                // Firestore doesn't support setting fields to undefined, so we use deleteField()
                // But for our local state management, we'll just exclude the field from the object
            }

            // リマインダー設定を追加
            updateData.reminderSettings = {
                enableBlockStartReminder,
                blockStartReminderMinutes,
                enableBlockEndReminder,
                blockEndReminderMinutes,
                enableDeadlineReminder,
                deadlineReminderMinutes,
            };

            // 繰り返し設定を追加
            if (enableRepeat) {
                const repeatSettings: RepeatSettings = {
                    enabled: true,
                    type: repeatType,
                    frequency: repeatFrequency,
                    daysOfWeek: repeatType === 'weekly' ? repeatDaysOfWeek : undefined,
                    dayOfMonth: repeatType === 'monthly' ? repeatDayOfMonth : undefined,
                    endType: repeatEndType,
                    occurrences: repeatEndType === 'after' ? repeatOccurrences : undefined,
                    endDate: repeatEndType === 'on_date' ? repeatEndDate : undefined,
                };
                updateData.repeatSettings = repeatSettings;

                // 繰り返しタスクのインスタンスを生成
                if (task.repeatSettings?.enabled !== true) {
                    // 新しく繰り返し設定が有効になった場合のみインスタンスを生成
                    const startDate = new Date();
                    const endDate = new Date();
                    endDate.setDate(endDate.getDate() + 14); // 2週間後

                    const updatedTask = {
                        ...task,
                        title,
                        description,
                        blockId: selectedBlock,
                        deadline,
                        reminderSettings: updateData.reminderSettings,
                        repeatSettings,
                        userId,
                    };

                    await generateRepeatTaskInstances(updatedTask as Task, startDate, endDate);
                }
            } else {
                updateData.repeatSettings = { enabled: false };
            }

            await updateDoc(taskRef, updateData);
            setIsModalOpen(false);
            setShowToast(true);
            setToastMessage("タスクを更新しました");
            setToastType("success");
            setTimeout(() => setShowToast(false), 3000);
        } catch (error) {
            console.error("Error updating task:", error);
            setShowToast(true);
            setToastMessage("エラーが発生しました");
            setToastType("error");
            setTimeout(() => setShowToast(false), 3000);
        } finally {
            setIsSubmitting(false);
        }
    };

    // 編集モーダル
    const renderTaskDetailModal = () => {
        if (!isModalOpen) return null;

        return (
            <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50 flex items-center justify-center p-4 modal-appear">
                <div
                    ref={modalRef}
                    className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-lg w-full modal-content-appear overflow-y-auto max-h-[90vh]"
                >
                    <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                            {t('common.tasks.taskDetails')}
                        </h3>
                        <button
                            className="p-1 rounded-full text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                            onClick={() => setIsModalOpen(false)}
                        >
                            <XMarkIcon className="h-5 w-5" />
                        </button>
                    </div>

                    <form onSubmit={handleUpdate} className="p-4">
                        <div className="space-y-4">
                            <div>
                                <label className="form-label" htmlFor="task-title">
                                    {t('common.tasks.taskName')}
                                </label>
                                <input
                                    id="task-title"
                                    type="text"
                                    className="input input-bordered w-full focus-ring"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    required
                                />
                            </div>

                            <div>
                                <label className="form-label" htmlFor="task-deadline">
                                    {t('common.tasks.deadline')}
                                </label>
                                <input
                                    id="task-deadline"
                                    type="datetime-local"
                                    className={`input input-bordered w-full focus-ring ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : ''}`}
                                    value={deadline}
                                    onChange={(e) => setDeadline(e.target.value)}
                                />
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
                                        <span>{showReminderSettings ? t('common.tasks.hideReminderSettings') : t('common.tasks.showReminderSettings')}</span>
                                    </div>
                                    <ChevronDownIcon className={`h-5 w-5 text-gray-400 transition-transform ${showReminderSettings ? 'transform rotate-180' : ''}`} />
                                </button>
                            </div>

                            {showReminderSettings && (
                                <div className={`p-3 rounded-md ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'} space-y-3 animate-fade-in`}>
                                    <div>
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center">
                                                <input
                                                    type="checkbox"
                                                    id="edit-enable-block-start"
                                                    className="checkbox checkbox-sm checkbox-primary mr-2"
                                                    checked={enableBlockStartReminder}
                                                    onChange={() => setEnableBlockStartReminder(!enableBlockStartReminder)}
                                                />
                                                <label htmlFor="edit-enable-block-start" className="text-sm">
                                                    {t('common.tasks.notifyBeforeBlockStart')}
                                                </label>
                                            </div>
                                            <select
                                                className={`select select-bordered select-sm ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : ''}`}
                                                value={blockStartReminderMinutes}
                                                onChange={(e) => setBlockStartReminderMinutes(Number(e.target.value))}
                                                disabled={!enableBlockStartReminder}
                                            >
                                                <option value="5">5{t('common.time.minutesBefore')}</option>
                                                <option value="10">10{t('common.time.minutesBefore')}</option>
                                                <option value="15">15{t('common.time.minutesBefore')}</option>
                                                <option value="30">30{t('common.time.minutesBefore')}</option>
                                                <option value="60">1{t('common.time.hourBefore')}</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div>
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center">
                                                <input
                                                    type="checkbox"
                                                    id="edit-enable-block-end"
                                                    className="checkbox checkbox-sm checkbox-primary mr-2"
                                                    checked={enableBlockEndReminder}
                                                    onChange={() => setEnableBlockEndReminder(!enableBlockEndReminder)}
                                                />
                                                <label htmlFor="edit-enable-block-end" className="text-sm">
                                                    {t('common.tasks.notifyBeforeBlockEnd')}
                                                </label>
                                            </div>
                                            <select
                                                className={`select select-bordered select-sm ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : ''}`}
                                                value={blockEndReminderMinutes}
                                                onChange={(e) => setBlockEndReminderMinutes(Number(e.target.value))}
                                                disabled={!enableBlockEndReminder}
                                            >
                                                <option value="5">5{t('common.time.minutesBefore')}</option>
                                                <option value="10">10{t('common.time.minutesBefore')}</option>
                                                <option value="15">15{t('common.time.minutesBefore')}</option>
                                                <option value="30">30{t('common.time.minutesBefore')}</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div>
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center">
                                                <input
                                                    type="checkbox"
                                                    id="edit-enable-deadline"
                                                    className="checkbox checkbox-sm checkbox-primary mr-2"
                                                    checked={enableDeadlineReminder}
                                                    onChange={() => setEnableDeadlineReminder(!enableDeadlineReminder)}
                                                    disabled={!deadline}
                                                />
                                                <label htmlFor="edit-enable-deadline" className="text-sm">
                                                    {t('common.tasks.notifyBeforeDeadline')}
                                                </label>
                                            </div>
                                            <select
                                                className={`select select-bordered select-sm ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : ''}`}
                                                value={deadlineReminderMinutes}
                                                onChange={(e) => setDeadlineReminderMinutes(Number(e.target.value))}
                                                disabled={!enableDeadlineReminder || !deadline}
                                            >
                                                <option value="15">15{t('common.time.minutesBefore')}</option>
                                                <option value="30">30{t('common.time.minutesBefore')}</option>
                                                <option value="60">1{t('common.time.hourBefore')}</option>
                                                <option value="120">2{t('common.time.hoursBefore')}</option>
                                                <option value="1440">1{t('common.time.dayBefore')}</option>
                                            </select>
                                        </div>
                                        {!deadline && enableDeadlineReminder && (
                                            <p className="text-xs text-orange-500 mt-1">
                                                {t('common.tasks.pleaseSetDeadline')}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            )}

                            <div>
                                <label className="form-label" htmlFor="task-description">
                                    {t('common.tasks.details')}
                                </label>
                                <textarea
                                    id="task-description"
                                    className="textarea textarea-bordered w-full focus-ring min-h-24"
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    placeholder={t('common.tasks.detailsPlaceholder')}
                                    rows={4}
                                ></textarea>
                            </div>

                            <div className="mt-4">
                                <label className="block text-sm font-medium mb-1">
                                    {t('common.tasks.blockAssignment')}
                                </label>
                                <select
                                    value={selectedBlock || ""}
                                    onChange={(e) => setSelectedBlock(e.target.value || null)}
                                    className={`w-full p-2 border rounded-md ${theme === "dark"
                                        ? "bg-gray-700 border-gray-600 text-white"
                                        : "bg-white border-gray-300 text-gray-900"
                                        }`}
                                >
                                    <option value="">{t('common.tasks.unassigned')}</option>
                                    {blocks.map((block) => (
                                        <option key={block.id} value={block.id}>
                                            {block.name} ({block.startTime}〜{block.endTime})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="flex items-center pt-3">
                                <div className="flex items-center h-5">
                                    <input
                                        id="task-status"
                                        type="checkbox"
                                        className="checkbox checkbox-sm checkbox-primary"
                                        checked={checked}
                                        onChange={handleCheck}
                                    />
                                </div>
                                <label
                                    htmlFor="task-status"
                                    className="ml-2 text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer"
                                >
                                    {t('common.tasks.taskCompleted')}
                                </label>
                            </div>
                        </div>

                        <div className="flex justify-between mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                            <button
                                type="button"
                                className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
                                onClick={handleDelete}
                                disabled={isSubmitting || isDeleting}
                            >
                                <TrashIcon className="h-4 w-4 mr-1" />
                                {isDeleting ? t('common.tasks.deleting') : t('common.actions.delete')}
                            </button>

                            <div className="flex space-x-2">
                                <button
                                    type="button"
                                    className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 text-sm leading-4 font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors"
                                    onClick={() => setIsModalOpen(false)}
                                    disabled={isSubmitting}
                                >
                                    {t('common.actions.cancel')}
                                </button>
                                <button
                                    type="submit"
                                    className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors"
                                    disabled={!title.trim() || isSubmitting}
                                >
                                    {isSubmitting ? (
                                        <>
                                            <ArrowPathIcon className="h-4 w-4 mr-1 animate-spin" />
                                            {t('common.tasks.saving')}
                                        </>
                                    ) : (
                                        <>
                                            <CheckIcon className="h-4 w-4 mr-1" />
                                            {t('common.actions.save')}
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        );
    };

    return (
        <>
            <li
                className={`task-item group ${isUpdating ? 'animate-pulse-soft' : ''} ${isDraggable ? 'cursor-grab active:cursor-grabbing hover:bg-gray-50' : ''}`}
                draggable={isDraggable}
                onDragStart={handleDragStart}
                data-task-id={task.id}
            >
                <div className="flex items-center flex-1 min-w-0">
                    <div className="relative flex items-start w-full">
                        <div className="flex items-center h-5 mt-1">
                            <input
                                type="checkbox"
                                className="checkbox checkbox-sm checkbox-primary focus-ring"
                                checked={checked}
                                onChange={handleCheck}
                                disabled={isDeleting || isUpdating}
                            />
                        </div>
                        <div
                            className="ml-3 cursor-pointer min-w-0 flex-1"
                            onClick={() => setIsModalOpen(true)}
                        >
                            <span
                                className={`text-sm font-medium ${checked ? "completed-task" : "text-gray-700 dark:text-gray-200"}`}
                            >
                                {task.title}
                            </span>
                            {task.description && (
                                <p className={`text-xs truncate max-w-full sm:max-w-xs mt-0.5 ${checked ? "completed-task" : "text-gray-500"}`}>
                                    {task.description.substring(0, 100)}
                                    {task.description.length > 100 ? '...' : ''}
                                </p>
                            )}
                            <div className="flex flex-wrap gap-x-2 gap-y-1 mt-1">
                                {task.deadline && (
                                    <div className="flex items-center">
                                        <CalendarDaysIcon className="h-3 w-3 text-orange-500 mr-1" />
                                        <span className="text-xs text-orange-500">
                                            {new Date(task.deadline).toLocaleDateString(t('common.locale') || 'ja-JP', {
                                                month: 'short',
                                                day: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            })}
                                        </span>
                                    </div>
                                )}
                                {task.reminderSettings && (task.reminderSettings.enableBlockStartReminder ||
                                    task.reminderSettings.enableBlockEndReminder ||
                                    task.reminderSettings.enableDeadlineReminder) && (
                                        <div className="flex items-center">
                                            <BellIcon className="h-3 w-3 text-primary-500 mr-1" />
                                            <span className="text-xs text-primary-500">
                                                {t('common.tasks.reminderSettingsAvailable')}
                                            </span>
                                        </div>
                                    )}
                                {/* 繰り返し設定の表示 */}
                                {task.repeatSettings?.enabled && (
                                    <div className="flex items-center">
                                        <ArrowPathRoundedSquareIcon className="h-3 w-3 text-green-600 mr-1" />
                                        <span className="text-xs text-green-600">
                                            {t('common.tasks.repeatSettingsAvailable')}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex items-center ml-2 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                    {isDraggable && (
                        <div className="mr-1 text-gray-400 hidden sm:block">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
                            </svg>
                        </div>
                    )}
                    <button
                        className="p-1 rounded-full text-gray-500 hover:bg-gray-100 hover:text-primary-600 transition-colors"
                        onClick={() => setIsModalOpen(true)}
                        disabled={isDeleting}
                        aria-label="タスクを編集"
                    >
                        <PencilIcon className="h-4 w-4" />
                    </button>
                    <button
                        className="p-1 rounded-full text-gray-500 hover:bg-red-100 hover:text-red-600 transition-colors ml-1"
                        onClick={handleDelete}
                        disabled={isDeleting}
                        aria-label="タスクを削除"
                    >
                        <TrashIcon className="h-4 w-4" />
                    </button>
                </div>
            </li>

            {renderTaskDetailModal()}

            {/* トースト通知 */}
            {showToast && (
                <div className={`toast ${toastType === "success" ? "toast-success" : "toast-error"} toast-visible`}>
                    <div className="flex items-center">
                        <CheckIcon className={`h-5 w-5 ${toastType === "success" ? "text-green-500" : "text-red-500"} mr-2`} />
                        <p className="text-sm">{toastMessage}</p>
                    </div>
                </div>
            )}
        </>
    );
};

export default TaskItem;